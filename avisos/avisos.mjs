// Servidor de avisos de Corcho App.
// Lo corre GitHub Actions cada 10 minutos. Lee de Firestore la hora del "cierre del día"
// de cada usuario y manda la notificación a cada dispositivo registrado, aunque la app esté cerrada.
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

let enviados = 0;
for (const [uid, datos] of Object.entries(usuarios)) {
  const cfg = parse(datos["corcho:ajustes"]) || {};
  const c = cfg.cierre;
  if (!c || !c.on || !/^\d\d:\d\d$/.test(c.hora || "")) continue;
  const [hh, mm] = c.hora.split(":").map(Number), hora = hh * 60 + mm;
  for (const [key, doc] of Object.entries(datos)) {
    if (!key.startsWith("corcho:push:")) continue;
    const reg = parse(doc); if (!reg || !reg.sub || !reg.sub.endpoint) continue;
    const { fecha, min } = ahora(reg.tz || "America/Argentina/Buenos_Aires");
    if (min < hora || min - hora > VENTANA_MIN) continue;
    const estadoRef = db.collection("avisos").doc(`${uid}_${key.slice(12)}`);
    const estado = (await estadoRef.get()).data() || {};
    if (estado.muerto === reg.sub.endpoint) continue;
    if (estado.cierre === fecha) continue;
    // Cuenta los gastos que ya anotó hoy para personalizar el mensaje
    const mes = parse(datos["corcho:fin:mes:" + fecha.slice(0, 7)]) || {};
    const gastos = (mes.items || []).filter(it => it.fecha === fecha && it.tipo !== "ingreso").length;
    const body = gastos
      ? `Anotaste ${gastos} ${gastos === 1 ? "gasto" : "gastos"} hoy: revisá que estén todos y marcá tus hábitos.`
      : "Anotá tus hábitos y los gastos de hoy.";
    try {
      await webpush.sendNotification(reg.sub, JSON.stringify({ title: "Cierre del día", body, tag: "cierre-" + fecha, url: "./#hoy" }), { TTL: 3 * 3600, urgency: "high" });
      await estadoRef.set({ cierre: fecha, enviado: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      enviados++;
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) { await estadoRef.set({ muerto: reg.sub.endpoint }, { merge: true }); console.log("Dispositivo dado de baja:", key); }
      else console.log("Error al enviar a", key, e.statusCode || "", e.body || e.message);
    }
  }
}
console.log(`Avisos enviados: ${enviados}`);
