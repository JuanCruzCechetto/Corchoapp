/* Corcho · sincronización con Firebase (Google + Firestore).
   Cada clave "corcho:*" de este dispositivo se guarda como un documento en users/{uid}/data/{clave}.
   Gana la versión más nueva de cada clave. Sin configuración, la app funciona solo en el dispositivo. */
(function(){
"use strict";
const META_K="corcho-sync-meta",SDK="https://www.gstatic.com/firebasejs/10.12.2/";
const cfg=window.CORCHO_FIREBASE&&window.CORCHO_FIREBASE.apiKey?window.CORCHO_FIREBASE:null;
let meta;try{meta=JSON.parse(localStorage.getItem(META_K)||"{}")}catch(e){meta={}}
meta.ts=meta.ts||{};meta.dirty=meta.dirty||{};
const saveMeta=()=>{try{localStorage.setItem(META_K,JSON.stringify(meta))}catch(e){}};
const listeners=new Set();
const S={available:!!cfg,ready:false,user:null,state:cfg?"cargando":"sin-config",lastSync:meta.last||null,error:null,
 onChange(fn){listeners.add(fn);return()=>listeners.delete(fn)},
 touch(k){if(!k||k.indexOf("corcho:")!==0)return;meta.ts[k]=Date.now();meta.dirty[k]=1;saveMeta();schedule()},
 signIn,signOut,syncNow,wipeRemote,chooseFirst:null};
window.CorchoSync=S;
const emit=()=>listeners.forEach(fn=>{try{fn(S)}catch(e){}});
if(!cfg)return;
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement("script");s.src=src;s.async=true;s.onload=ok;s.onerror=()=>ko(new Error("No se pudo cargar "+src));document.head.appendChild(s)})}
let fb=null,db=null,auth=null,col=null,unsub=null,flushT=null,flushing=false;
const localKeys=()=>{const o=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf("corcho:")===0)o.push(k)}}catch(e){}return o};
const enc=k=>encodeURIComponent(k),dec=id=>decodeURIComponent(id);
function setState(st,err){S.state=st;S.error=err||null;emit()}
loadScript(SDK+"firebase-app-compat.js").then(()=>Promise.all([loadScript(SDK+"firebase-auth-compat.js"),loadScript(SDK+"firebase-firestore-compat.js")])).then(()=>{
 fb=window.firebase;fb.initializeApp(cfg);auth=fb.auth();db=fb.firestore();
 auth.getRedirectResult().catch(e=>setState("error",authMsg(e)));
 auth.onAuthStateChanged(u=>{S.user=u?{uid:u.uid,email:u.email,name:u.displayName}:null;S.ready=true;if(unsub){unsub();unsub=null}
  if(u){col=db.collection("users").doc(u.uid).collection("data");firstSync().catch(e=>setState("error","No se pudo sincronizar: "+(e&&e.message||e)))}else{col=null;setState("desconectado")}});
}).catch(()=>{S.ready=true;setState("sin-conexion","Sin conexión: tus cambios se guardan en este dispositivo y se sincronizan cuando vuelvas a tener internet.")});
function authMsg(e){const c=e&&e.code||"";if(c.includes("unauthorized-domain"))return "Este dominio no está autorizado en Firebase. Agregalo en Authentication › Configuración › Dominios autorizados.";if(c.includes("popup-closed"))return "Cerraste la ventana de Google antes de terminar.";if(c.includes("network"))return "No hay conexión a internet.";return "No se pudo iniciar sesión ("+(c||e&&e.message||"error")+")."}
function signIn(){if(!auth)return;const p=new fb.auth.GoogleAuthProvider();p.setCustomParameters({prompt:"select_account"});setState("conectando");
 auth.signInWithPopup(p).catch(e=>{const c=e&&e.code||"";if(c.includes("popup-blocked")||c.includes("operation-not-supported")||c.includes("web-storage-unsupported"))return auth.signInWithRedirect(p);setState(S.user?"ok":"desconectado",authMsg(e))})}
function signOut(){if(!auth)return;auth.signOut()}
const hasLocalData=()=>localKeys().some(k=>{const v=localStorage.getItem(k);return v&&v!=="[]"&&v!=="{}"&&v!=="null"});
async function firstSync(){
 setState("sincronizando");
 const snap=await col.get();const remote={};snap.forEach(d=>{remote[dec(d.id)]=d.data()});
 const firstTime=meta.uid!==S.user.uid;
 if(firstTime&&Object.keys(remote).length&&hasLocalData()){
  const choice=await new Promise(res=>{S.chooseFirst=res;emit()});S.chooseFirst=null;
  if(choice==="nube"){localKeys().forEach(k=>{if(!(k in remote)){try{localStorage.removeItem(k)}catch(e){}}});meta.ts={};meta.dirty={}}
  else{const now=Date.now();localKeys().forEach(k=>{meta.ts[k]=now;meta.dirty[k]=1});Object.keys(remote).forEach(k=>{if(localStorage.getItem(k)==null){meta.dirty[k]=1;meta.ts[k]=now;remote[k]=null}})}
 }
 let changed=false;
 for(const [k,r] of Object.entries(remote)){if(!r)continue;const lt=meta.ts[k]||0;
  if(r.del){if(r.ts>lt&&localStorage.getItem(k)!=null){localStorage.removeItem(k);changed=true}meta.ts[k]=Math.max(lt,r.ts);continue}
  if(r.ts>lt||(firstTime&&!meta.dirty[k])){if(localStorage.getItem(k)!==r.v){localStorage.setItem(k,r.v);changed=true}meta.ts[k]=r.ts;delete meta.dirty[k]}
  else if(lt>r.ts)meta.dirty[k]=1}
 localKeys().forEach(k=>{if(!(k in remote)){meta.dirty[k]=1;meta.ts[k]=meta.ts[k]||Date.now()}});
 meta.uid=S.user.uid;saveMeta();
 await flush();
 if(changed&&window.CorchoApp&&window.CorchoApp.reloadData)window.CorchoApp.reloadData();
 listen();
}
function listen(){if(!col)return;unsub=col.onSnapshot(snap=>{let changed=false;snap.docChanges().forEach(ch=>{if(ch.doc.metadata.hasPendingWrites)return;const k=dec(ch.doc.id),r=ch.doc.data();if(!r)return;const lt=meta.ts[k]||0;if(r.ts<=lt||meta.dirty[k])return;
  if(r.del){try{localStorage.removeItem(k)}catch(e){}}else{try{localStorage.setItem(k,r.v)}catch(e){}}meta.ts[k]=r.ts;changed=true});
  if(changed){saveMeta();S.lastSync=meta.last=Date.now();saveMeta();if(window.CorchoApp&&window.CorchoApp.reloadData)window.CorchoApp.reloadData();emit()}},e=>setState("error","Se cortó la sincronización: "+(e&&e.message||e)))}
function schedule(){if(!col)return;clearTimeout(flushT);flushT=setTimeout(()=>flush().catch(()=>{}),900)}
async function flush(){if(!col||flushing)return;flushing=true;try{const keys=Object.keys(meta.dirty);if(keys.length)setState("sincronizando");
 for(let i=0;i<keys.length;i+=400){const b=db.batch();keys.slice(i,i+400).forEach(k=>{const v=localStorage.getItem(k);const ref=col.doc(enc(k));if(v==null)b.set(ref,{del:true,ts:meta.ts[k]||Date.now()});else b.set(ref,{v,ts:meta.ts[k]||Date.now()})});await b.commit();keys.slice(i,i+400).forEach(k=>delete meta.dirty[k])}
 S.lastSync=meta.last=Date.now();saveMeta();setState("ok")}catch(e){setState("error",navigator.onLine===false?"Sin conexión: se sincroniza cuando vuelva internet.":"No se pudo guardar en la nube: "+(e&&e.message||e))}finally{flushing=false;if(Object.keys(meta.dirty).length&&S.state==="ok")schedule()}}
function syncNow(){if(!col)return Promise.resolve();return flush()}
async function wipeRemote(){if(!col)return;const snap=await col.get();const now=Date.now();const b=db.batch();snap.forEach(d=>b.set(d.ref,{del:true,ts:now}));await b.commit();meta.ts={};meta.dirty={};saveMeta()}
window.addEventListener("online",()=>schedule());
document.addEventListener("visibilitychange",()=>{if(document.hidden&&col&&Object.keys(meta.dirty).length)flush().catch(()=>{})});
})();
