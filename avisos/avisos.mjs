// Servidor de avisos de Corcho App.
// Lo corre GitHub Actions cada 10 minutos. Lee de Firestore la hora del "cierre del día"
// de cada usuario, sus recordatorios, tareas con hora y vencimientos, y manda la notificación
// a cada dispositivo registrado, aunque la app esté cerrada.
import admin from "firebase-admin";
import webpush from "web-push";

const VAPID_PUB = "BOHmN3CcJ6A1jyqmkL3cv1kU4siwH2T0-qnXVDscjR3U0rMyXt_cXZFfxZbqz9K9Irm6S4RcFp83R-E1NlC0jX8";
const SA = process.env.FIREBASE_SA, VAPID_PRIV = process.env.VAPID_PRIVATE;
if (!SA || !VAPID_PRIV) { console.log("Faltan los secretos FIREBASE_SA o VAPID_PRIVATE: no se envía nada."); process.exit(0); }

admin.initializeApp({ credential: admin.credential.cert(JSON.parse(SA)) });
const db = admin.firestore();
webpush.setVapidDetails("https://juancruzcechetto.github.io/Corchoapp/", VAPID_PUB, VAPID_PRIV);

const VENTANA_MIN = 180; // si el aviso no salió a tiempo, se manda hasta 3 horas después
const parse = d => { try { return d && !d.del && typeof d.v === "string" ? JSON.parse(d.v) : null; } catch { return null; } };
function ahora(tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return { fecha: `${p.year}-${p.month}-${p.day}`, min: +p.hour * 60 + +p.minute };
}

const snap = await db.collectionGroup("data").get();
const usuarios = {};
snap.forEach(doc => {
  const uid = doc.ref.parent.parent && doc.ref.parent.parent.id; if (!uid) return;
  (usuarios[uid] = usuarios[uid] || {})[decodeURIComponent(doc.id)] = doc.data();
});

// Fechas "de reloj" (como las guarda la app, sin zona): "YYYY-MM-DDTHH:MM"
const msDe = t => Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 1, +t.slice(8, 10), +t.slice(11, 13) || 0, +t.slice(14, 16) || 0);
const deMs = ms => new Date(ms).toISOString().slice(0, 16);
function paso(t, rep) { const d = new Date(msDe(t)); if (rep === "diario") d.setUTCDate(d.getUTCDate() + 1); else if (rep === "semanal") d.setUTCDate(d.getUTCDate() + 7); else d.setUTCMonth(d.getUTCMonth() + 1); return deMs(d.getTime()); }
// Última vez que tocaba un recordatorio repetido, sin pasarse de ahora
function ultimaVez(at, rep, ahoraT) { let t = at.slice(0, 16), i = 0; if (t > ahoraT) return null; for (let n = paso(t, rep); n <= ahoraT && i < 5000; n = paso(n, rep), i++) t = n; return t; }
const plata = n => "$ " + Math.round(+n || 0).toLocaleString("es-AR");
const VENTANA_ITEM = 60; // minutos: recordatorios y tareas se avisan hasta 1 hora tarde

let enviados = 0;
for (const [uid, datos] of Object.entries(usuarios)) {
  const cfg = parse(datos["corcho:ajustes"]) || {};
  const subs = Object.entries(datos).filter(([k]) => k.startsWith("corcho:push:")).map(([k, d]) => ({ key: k, reg: parse(d) })).filter(x => x.reg && x.reg.sub && x.reg.sub.endpoint);
  if (!subs.length) continue;
  const tz = subs[0].reg.tz || "America/Argentina/Buenos_Aires";
  const { fecha, min } = ahora(tz);
  const ahoraT = fecha + "T" + String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0");
  const ahoraMs = msDe(ahoraT);

  // Estado por dispositivo (cierre y dispositivos dados de baja)
  const estados = {};
  for (const s of subs) { const ref = db.collection("avisos").doc(`${uid}_${s.key.slice(12)}`); estados[s.key] = { ref, d: (await ref.get()).data() || {} }; }
  const vivos = subs.filter(s => estados[s.key].d.muerto !== s.reg.sub.endpoint);
  if (!vivos.length) continue;
  async function mandar(s, msg) {
    try { await webpush.sendNotification(s.reg.sub, JSON.stringify(msg), { TTL: 3 * 3600, urgency: "high" }); enviados++; return true; }
    catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) { await estados[s.key].ref.set({ muerto: s.reg.sub.endpoint }, { merge: true }); console.log("Dispositivo dado de baja:", s.key); }
      else console.log("Error al enviar a", s.key, e.statusCode || "", e.body || e.message);
      return false;
    }
  }

  // 1) Cierre del día (uno por dispositivo y por día)
  const c = cfg.cierre;
  if (c && c.on && /^\d\d:\d\d$/.test(c.hora || "")) {
    const [hh, mm] = c.hora.split(":").map(Number), hora = hh * 60 + mm;
    if (min >= hora && min - hora <= VENTANA_MIN) {
      const mes = parse(datos["corcho:fin:mes:" + fecha.slice(0, 7)]) || {};
      const gastos = (mes.items || []).filter(it => it.fecha === fecha && it.tipo !== "ingreso").length;
      const body = gastos ? `Anotaste ${gastos} ${gastos === 1 ? "gasto" : "gastos"} hoy: revisá que estén todos y marcá tus hábitos.` : "Anotá tus hábitos y los gastos de hoy.";
      for (const s of vivos) {
        if (estados[s.key].d.cierre === fecha) continue;
        if (await mandar(s, { title: "Cierre del día", body, tag: "cierre-" + fecha, url: "./#hoy" })) await estados[s.key].ref.set({ cierre: fecha, enviado: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    }
  }

  // 2) Recordatorios, tareas con hora y vencimientos (si no desactivó las notificaciones)
  if (cfg.notif === false) continue;
  const avisos = [];
  for (const r of parse(datos["corcho:recordatorios"]) || []) {
    if (!r || r.hecho || !r.at) continue;
    const rep = r.rep && r.rep !== "no" ? r.rep : null;
    if (!rep && r.avisado) continue;
    const t = rep ? ultimaVez(r.at, rep, ahoraT) : r.at.slice(0, 16);
    if (!t || t > ahoraT || (ahoraMs - msDe(t)) / 60000 > VENTANA_ITEM) continue;
    avisos.push({ clave: `rem:${r.id}:${t}`, msg: { title: r.titulo || "Recordatorio", body: "Recordatorio · " + t.slice(11, 16), tag: "rem-" + r.id, url: "./#recordatorios" } });
  }
  for (const x of parse(datos["corcho:tareas"]) || []) {
    if (!x || x.done || x.avisado || !x.due || !x.time) continue;
    const t = x.due + "T" + x.time.slice(0, 5);
    if (t > ahoraT || (ahoraMs - msDe(t)) / 60000 > VENTANA_ITEM) continue;
    avisos.push({ clave: `task:${x.id}:${t}`, msg: { title: "Tarea: " + x.title, body: "Programada para las " + x.time.slice(0, 5), tag: "task-" + x.id, url: "./#tareas" } });
  }
  const pagos = parse(datos["corcho:pagos"]) || {};
  if (min >= 9 * 60) for (const p of pagos.items || []) {
    if (!p || p.pagado || p.fecha !== fecha || (pagos.avisos || {})[`pago:${p.id}:${p.fecha}`]) continue;
    avisos.push({ clave: `pago:${p.id}:${p.fecha}`, msg: { title: "Hoy vence: " + p.desc, body: plata(p.monto), tag: "pago-" + p.id, url: "./#finanzas" } });
  }
  if (!avisos.length) continue;
  const regRef = db.collection("avisos").doc(uid);
  const reg = (await regRef.get()).data() || {};
  const hechos = reg.items || {};
  let cambio = false;
  for (const a of avisos) {
    if (hechos[a.clave]) continue;
    let ok = false; for (const s of vivos) ok = (await mandar(s, a.msg)) || ok;
    if (ok) { hechos[a.clave] = Date.now(); cambio = true; }
  }
  if (cambio) {
    for (const k of Object.keys(hechos)) if (Date.now() - hechos[k] > 40 * 864e5) delete hechos[k];
    await regRef.set({ items: hechos }, { merge: false });
  }
}
console.log(`Avisos enviados: ${enviados}`);
