(function(){
"use strict";
/* ================= utilidades ================= */
const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim();
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const mem={};
function load(k,def){try{const v=localStorage.getItem("corcho:"+k);if(v)return JSON.parse(v)}catch(e){if(mem[k])return clone(mem[k])}return clone(def)}
let saveWarned=false;
function save(k,v){mem[k]=clone(v);try{localStorage.setItem("corcho:"+k,JSON.stringify(v));window.CorchoSync&&window.CorchoSync.touch("corcho:"+k)}catch(e){if(!saveWarned){saveWarned=true;toast("Este navegador no permite guardar datos. Lo que cargues se pierde al cerrar.")}}}

const pad2=n=>String(n).padStart(2,"0");
const isoOf=d=>d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());
const today=()=>isoOf(new Date());
const parseISO=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const addDays=(s,n)=>{const d=parseISO(s);d.setDate(d.getDate()+n);return isoOf(d)};
const wd=s=>parseISO(s).getDay();
const diffDays=(a,b)=>Math.round((parseISO(b)-parseISO(a))/864e5);
const weekStart=s=>addDays(s,-((wd(s)+6)%7));
const localDT=d=>isoOf(d)+"T"+pad2(d.getHours())+":"+pad2(d.getMinutes());
const DIAS=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
const DC=["dom","lun","mar","mié","jue","vie","sáb"];
const DL=["D","L","M","M","J","V","S"];
const MESES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const MC=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function fmtDay(s){if(!s)return "";const t=today();if(s===t)return "Hoy";if(s===addDays(t,1))return "Mañana";if(s===addDays(t,-1))return "Ayer";const d=parseISO(s);return DC[d.getDay()]+" "+d.getDate()+" "+MC[d.getMonth()]+(d.getFullYear()!==new Date().getFullYear()?" "+d.getFullYear():"")}
const longDate=s=>{const d=parseISO(s);return DIAS[d.getDay()]+" "+d.getDate()+" de "+MESES[d.getMonth()]};
const fmtMin=m=>{m=Math.round(m||0);if(m<60)return m+" min";const h=Math.floor(m/60),r=m%60;return h+" h"+(r?" "+r+" min":"")};
const mmss=sec=>{sec=Math.max(0,Math.ceil(sec));return pad2(Math.floor(sec/60))+":"+pad2(sec%60)};
const NF=new Intl.NumberFormat("es-AR",{maximumFractionDigits:1});
const n1=v=>NF.format(v||0);

const IC={
 hoy:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
 tareas:'<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><path d="M8 12.3l2.8 2.8L16.2 9.6"/>',
 habitos:'<path d="M4.5 12a7.5 7.5 0 0 1 12.9-5.2L19.5 9M19.5 4.5V9H15M19.5 12a7.5 7.5 0 0 1-12.9 5.2L4.5 15M4.5 19.5V15H9"/>',
 enfoque:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.6 2.2M9.5 2.8h5M18.5 6.2l1.4-1.4"/>',
 entreno:'<path d="M6.5 6v12M17.5 6v12M3.5 9v6M20.5 9v6M6.5 12h11"/>',
 estudio:'<path d="M5 5a2 2 0 0 1 2-2h12v15H7a2 2 0 0 0-2 2zM5 20a2 2 0 0 0 2 1.5h12V18M9 7.5h6"/>',
 finanzas:'<rect x="3" y="6" width="18" height="13.5" rx="3"/><path d="M3 10.5h18M15.5 15h2.5M7 6l8.5-3 1.2 3"/>',
 recordatorios:'<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.6 2H4.4zM10 21a2.1 2.1 0 0 0 4 0"/>',
 mas:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>',
 ajustes:'<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
 pagos:'<path d="M6 3.5h12v17l-2.2-1.5-1.9 1.5-1.9-1.5-1.9 1.5-1.9-1.5L6 20.5z"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
 calendario:'<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 play:'<path d="M8 5.5v13l10.5-6.5z"/>',
 close:'<path d="M6 6l12 12M18 6L6 18"/>'
};
const ico=(n,sw)=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.9)+'" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(IC[n]||"")+"</svg>";

/* ================= datos ================= */
const r3=(n,list)=>list.map(([a,s,r])=>({nombre:a,series:s,reps:r,kg:""}));
const SEED_RUT=[
 {id:"r-sup",nombre:"Tren superior",ejercicios:r3(0,[["Press banca",4,10],["Remo con barra",4,10],["Press militar",3,10],["Dominadas",3,8],["Curl de bíceps",3,12]])},
 {id:"r-inf",nombre:"Tren inferior",ejercicios:r3(0,[["Sentadilla",4,10],["Peso muerto rumano",3,10],["Prensa",3,12],["Estocadas",3,10],["Pantorrillas",4,15]])}
];
const DEF_CFG={nombre:"",tema:"sistema",notif:false,metaEntrenos:3,metaEstudio:10};
const D={
 cfg:Object.assign(clone(DEF_CFG),load("ajustes",{})),
 tareas:load("tareas",[]),
 habitos:load("habitos",[]),
 enfoque:load("enfoque",{cfg:{work:25,short:5,long:15,every:4},sesiones:[],timer:{mode:"work",endAt:null,left:null,ciclo:0,label:""}}),
 gym:load("entreno",{rutinas:SEED_RUT,logs:[],activo:null}),
 estudio:load("estudio",{materias:[],examenes:[],sesiones:[]}),
 rec:load("recordatorios",[])
};
const KEY={cfg:"ajustes",tareas:"tareas",habitos:"habitos",enfoque:"enfoque",gym:"entreno",estudio:"estudio",rec:"recordatorios"};
const put=(...ks)=>ks.forEach(k=>save(KEY[k],D[k]));
const COLORS=["#3363C9","#2C7A4D","#C4423A","#C2620F","#6E45C4","#18807C","#A67A0C","#B83F78"];

/* ================= avisos ================= */
let tT;
function toast(m){const t=$("#toast");if(!t)return;t.textContent=m;t.hidden=false;clearTimeout(tT);tT=setTimeout(()=>t.hidden=true,4000)}
let AC=null;
function beep(n){n=n||2;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();for(let i=0;i<n;i++){const o=AC.createOscillator(),g=AC.createGain();o.type="sine";o.frequency.value=i%2?660:880;o.connect(g);g.connect(AC.destination);const t=AC.currentTime+i*.32;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.28);o.start(t);o.stop(t+.3)}}catch(e){}try{navigator.vibrate&&navigator.vibrate([180,90,180])}catch(e){}}
document.addEventListener("pointerdown",()=>{try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume&&AC.resume()}catch(e){}},{once:true});
const canNotify=()=>"Notification" in window;
function notify(title,body,tag){
 toast(title+(body?". "+body:""));beep();
 if(!D.cfg.notif||!canNotify()||Notification.permission!=="granted")return;
 const opts={body:body||"",icon:"icon-192-jc3.png",badge:"icon-badge-jc3.png",tag:tag||uid()};
 const plain=()=>{try{new Notification(title,opts)}catch(e){}};
 try{if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.ready.then(r=>r.showNotification(title,opts)).catch(plain);else plain()}catch(e){plain()}
}

/* ================= hoja (formularios emergentes) ================= */
let SH=null;
function openSheet(ctx){SH=ctx;$("#sheet").hidden=false;document.body.classList.add("noscroll");drawSheet(true)}
function drawSheet(first){if(!SH)return;$("#sheetTitle").textContent=SH.title;const b=$("#sheetBody");const st=b.parentElement.scrollTop;b.innerHTML=SH.html();if(first){b.parentElement.scrollTop=0;const f=b.querySelector("[autofocus]");if(f&&window.matchMedia("(min-width:700px)").matches)f.focus()}else b.parentElement.scrollTop=st}
function closeSheet(){$("#sheet").hidden=true;document.body.classList.remove("noscroll");SH=null;render()}
function armed(el){if(el.dataset.armed)return true;el.dataset.armed="1";const old=el.innerHTML;el.textContent=el.dataset.ask||"Tocá de nuevo para confirmar";el.classList.add("armed");setTimeout(()=>{if(el.isConnected&&el.dataset.armed){delete el.dataset.armed;el.innerHTML=old;el.classList.remove("armed")}},3500);return false}
const delBtn=(what,id,label,extra)=>'<button type="button" class="btn danger" data-act="kill" data-what="'+what+'" data-id="'+esc(id)+'"'+(extra||"")+">"+(label||"Eliminar")+"</button>";
const xBtn=(what,id,extra)=>'<button type="button" class="x" data-act="kill" data-what="'+what+'" data-id="'+esc(id)+'" data-ask="¿Borrar?" aria-label="Borrar"'+(extra||"")+">×</button>";

/* ================= navegación ================= */
const NAV=[["hoy","Hoy"],["tareas","Tareas"],["habitos","Hábitos"],["enfoque","Enfoque"],["entreno","Entrenos"],["estudio","Estudio"],["finanzas","Finanzas"],["recordatorios","Recordatorios"]];
const BOTTOM=[["hoy","Hoy"],["tareas","Tareas"],["habitos","Hábitos"],["finanzas","Finanzas"]];
const MORE=["enfoque","entreno","estudio","recordatorios","ajustes","mas"];
const VIEWS=NAV.map(n=>n[0]).concat(["ajustes"]);
let view="hoy";
function openDrawer(){document.body.classList.add("drawer-open");const b=$(".menubtn");if(b)b.setAttribute("aria-expanded","true");const f=$("#sideNav button.on")||$("#sideNav button");if(f&&window.matchMedia("(max-width:899px)").matches)setTimeout(()=>f.focus(),60)}
function closeDrawer(){if(!document.body.classList.contains("drawer-open"))return;document.body.classList.remove("drawer-open");const b=$(".menubtn");if(b)b.setAttribute("aria-expanded","false")}
function buildNav(){
 $("#sideNav").innerHTML=NAV.map(([k,l])=>'<button data-go="'+k+'" style="--mc:var(--m-'+k+')">'+ico(k)+"<span>"+l+'</span><span class="badge" data-badge="'+k+'" hidden></span></button>').join("")+'<div class="sep"></div><button data-go="ajustes" style="--mc:var(--m-ajustes)">'+ico("ajustes")+"<span>Ajustes</span></button>";
 $("#bottomNav").innerHTML=BOTTOM.map(([k,l])=>'<button data-go="'+k+'" style="--mc:var(--m-'+(k==="mas"?"hoy":k)+')">'+ico(k)+"<span>"+l+'</span><span class="badge" data-badge="'+k+'" hidden></span></button>').join("");
}
function go(v){
 if(!VIEWS.includes(v))v="hoy";view=v;
 $$(".view").forEach(el=>el.hidden=el.id!=="v-"+v);
 $$("[data-go]").forEach(b=>{if(b.closest("#sideNav,#bottomNav"))b.classList.toggle("on",b.dataset.go===v)});
 const mb=$(".menubtn");if(mb)mb.classList.toggle("on",!BOTTOM.some(x=>x[0]===v));
 closeDrawer();
 try{history.replaceState(null,"","#"+v)}catch(e){}
 if(v==="finanzas"&&window.CorchoFin)window.CorchoFin.refresh();
 render();window.scrollTo(0,0);
}
function badges(){
 const t=today();
 const late=D.tareas.filter(x=>!x.done&&x.due&&x.due<=t).length;
 const remNow=D.rec.filter(r=>!r.hecho&&r.avisado).length;
 const set=(k,n)=>$$('[data-badge="'+k+'"]').forEach(b=>{b.hidden=!n;b.textContent=n});
 set("tareas",late);set("recordatorios",remNow);set("menu",remNow);try{const tt=today();set("finanzas",pendientes().filter(p=>p.fecha<=tt).length)}catch(e){}
}

/* ================= cálculos compartidos ================= */
const isDue=(h,s)=>{if(h.cada>1){const d=diffDays(h.ancla||h.creado||s,s);return ((d%h.cada)+h.cada)%h.cada===0}return !h.dias||!h.dias.length||h.dias.includes(wd(s))};
const hName=h=>(h.emoji?esc(h.emoji)+" ":"")+esc(h.nombre);
const hCnt=(h,s)=>(h.log&&h.log[s])||0;
const hOk=(h,s)=>hCnt(h,s)>=(h.meta||1);
function streak(h){let s=today();if(!hOk(h,s))s=addDays(s,-1);let n=0;for(let i=0;i<730;i++){if(s<h.creado)break;if(isDue(h,s)){if(hOk(h,s))n++;else break}s=addDays(s,-1)}return n}
function bestStreak(h){let best=0,cur=0,s=h.creado,t=today();for(let i=0;s<=t&&i<3000;i++){if(isDue(h,s)){if(hOk(h,s)){cur++;best=Math.max(best,cur)}else if(s!==t)cur=0}s=addDays(s,1)}return best}
function rate(h,days){let due=0,ok=0;const t=today();for(let i=0;i<days;i++){const s=addDays(t,-i);if(s<h.creado)break;if(isDue(h,s)){due++;if(hOk(h,s))ok++}}return due?ok/due:0}
const focusMin=(a,b)=>D.enfoque.sesiones.filter(x=>x.fecha>=a&&x.fecha<=(b||a)).reduce((s,x)=>s+x.min,0);
const studyMin=(a,b,mid)=>D.estudio.sesiones.filter(x=>x.fecha>=a&&x.fecha<=b&&(!mid||x.materiaId===mid)).reduce((s,x)=>s+(+x.min||0),0);
const materia=id=>D.estudio.materias.find(m=>m.id===id);
function nextExams(){const t=today();return D.estudio.examenes.filter(e=>e.fecha>=t).sort((a,b)=>a.fecha.localeCompare(b.fecha))}
function weekStats(){
 const t=today(),wk=weekStart(t);let due=0,ok=0;
 D.habitos.forEach(h=>{for(let s=wk;s<=t;s=addDays(s,1)){if(s<h.creado)continue;if(isDue(h,s)){due++;if(hOk(h,s))ok++}}});
 return {tareas:D.tareas.filter(x=>x.done&&x.doneAt&&x.doneAt>=wk).length,hab:due?ok/due:null,foco:focusMin(wk,t),gym:D.gym.logs.filter(l=>l.fecha>=wk).length,est:studyMin(wk,t)};
}
function bars(vals,labels,fmt,aria){
 const W=320,H=128,pb=20,pt=16,n=vals.length,bw=W/n,max=Math.max(1,...vals);let s='<svg viewBox="0 0 '+W+" "+H+'" class="bars" role="img" aria-label="'+esc(aria)+'">';
 vals.forEach((v,i)=>{const h=(H-pb-pt)*v/max,x=i*bw+bw*.2,w=bw*.6,y=H-pb-h;s+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+Math.max(0,h).toFixed(1)+'" rx="3" class="'+(i===n-1?"last":"")+'"/>';if(v>0)s+='<text x="'+(x+w/2).toFixed(1)+'" y="'+(y-4).toFixed(1)+'" text-anchor="middle">'+(fmt?fmt(v):v)+"</text>";s+='<text x="'+(x+w/2).toFixed(1)+'" y="'+(H-5)+'" text-anchor="middle">'+esc(labels[i])+"</text>"});
 return s+'<line x1="0" x2="'+W+'" y1="'+(H-pb)+'" y2="'+(H-pb)+'" class="base"/></svg>';
}
const card=(m,title,right,body,foot,extra)=>'<article class="card'+(extra||"")+'" style="--mc:var(--m-'+m+')"><header class="card-head"><h2>'+(IC[m]?ico(m):"")+title+"</h2>"+(right?'<span class="small muted">'+right+"</span>":"")+"</header>"+body+(foot?'<footer class="card-foot">'+foot+"</footer>":"")+"</article>";
const vhead=(title,sub,act)=>'<div class="vhead"><div><h1 class="vtitle">'+title+"</h1>"+(sub?'<div class="vsub">'+sub+"</div>":"")+"</div>"+(act?'<div class="vact">'+act+"</div>":"")+"</div>";

/* ================= HOY ================= */
function greet(){const h=new Date().getHours();return h<6?"Buenas noches":h<13?"Buen día":h<20?"Buenas tardes":"Buenas noches"}
/* ================= TAREAS ================= */
let tF="hoy";
const taskSort=(a,b)=>(a.due||"9999").localeCompare(b.due||"9999")||(a.time||"99").localeCompare(b.time||"99")||(a.prio||3)-(b.prio||3);
function tasksFor(f){const t=today(),L=D.tareas;
 if(f==="hoy")return L.filter(x=>!x.done&&x.due&&x.due<=t).sort(taskSort);
 if(f==="proximas")return L.filter(x=>!x.done&&x.due&&x.due>t).sort(taskSort);
 if(f==="todas")return L.filter(x=>!x.done).sort(taskSort);
 return L.filter(x=>x.done).sort((a,b)=>(b.doneTs||0)-(a.doneTs||0));
}
function taskRow(x){
 const t=today(),late=!x.done&&x.due&&x.due<t;
 const meta=[];
 if(x.due)meta.push('<span class="'+(late?"late-t":"")+'">'+(late?"Vencida · ":"")+fmtDay(x.due)+(x.time?" "+x.time:"")+"</span>");
 else if(x.time)meta.push("<span>"+x.time+"</span>");
 if(x.prio==1)meta.push('<span class="prio1">Prioridad alta</span>');else if(x.prio==2)meta.push('<span class="prio2">Media</span>');
 if(x.area)meta.push("<span>"+esc(x.area)+"</span>");
 if(x.notes)meta.push("<span>Con notas</span>");
 return '<li class="task'+(x.done?" done":"")+'"><button class="chk p'+(x.prio||3)+'" data-act="tToggle" data-id="'+x.id+'" aria-label="'+(x.done?"Marcar como pendiente":"Completar")+'">'+ico("check",3)+'</button><button class="task-main" data-act="tEdit" data-id="'+x.id+'"><span class="task-t">'+esc(x.title)+"</span>"+(meta.length?'<span class="task-m">'+meta.join("")+"</span>":"")+"</button></li>";
}
function renderTareasLista(){
 const t=today();const C={hoy:tasksFor("hoy").length,proximas:tasksFor("proximas").length,todas:tasksFor("todas").length,hechas:tasksFor("hechas").length};
 const list=tasksFor(tF);
 let h=vhead("Tareas",C.todas+(C.todas===1?" pendiente":" pendientes"),'<button class="btn primary" data-act="tNew">'+ico("plus")+" Nueva</button>");
 h+='<div class="card" style="--mc:var(--m-tareas)"><form id="tqForm" class="quick" autocomplete="off"><input id="tqTitle" name="title" placeholder="¿Qué tenés que hacer?" aria-label="Nueva tarea" maxlength="200"><select id="tqDue" name="due" aria-label="Fecha"><option value="hoy"'+(tF!=="proximas"&&tF!=="todas"?" selected":"")+'>Hoy</option><option value="manana"'+(tF==="proximas"?" selected":"")+'>Mañana</option><option value=""'+(tF==="todas"?" selected":"")+'>Sin fecha</option></select><button class="btn mod">Agregar</button></form></div>';
 h+='<div class="seg" role="tablist" style="margin:14px 0">'+[["hoy","Hoy"],["proximas","Próximas"],["todas","Todas"],["hechas","Hechas"]].map(([k,l])=>'<button role="tab" data-act="tFilter" data-v="'+k+'" aria-selected="'+(tF===k)+'">'+l+'<span class="c">'+C[k]+"</span></button>").join("")+"</div>";
 h+='<div class="card">';
 if(!list.length)h+='<p class="empty">'+{hoy:"No hay nada para hoy. Agregá una tarea o mirá las próximas.",proximas:"No tenés tareas con fecha futura.",todas:"No hay tareas pendientes.",hechas:"Las tareas que completes aparecen acá."}[tF]+"</p>";
 else if(tF==="hoy"){const late=list.filter(x=>x.due<t),now=list.filter(x=>x.due===t);if(late.length)h+='<div class="group-h late">Vencidas</div><ul class="list">'+late.map(taskRow).join("")+"</ul>";if(now.length)h+=(late.length?'<div class="group-h">Hoy</div>':"")+'<ul class="list">'+now.map(taskRow).join("")+"</ul>"}
 else if(tF==="proximas"||tF==="todas"){let cur=null,open=false;list.forEach(x=>{const g=x.due?(x.due<t?"Vencidas":fmtDay(x.due)):"Sin fecha";if(g!==cur){if(open)h+="</ul>";h+='<div class="group-h'+(g==="Vencidas"?" late":"")+'">'+g+'</div><ul class="list">';cur=g;open=true}h+=taskRow(x)});if(open)h+="</ul>"}
 else h+='<ul class="list">'+list.slice(0,100).map(taskRow).join("")+"</ul>"+(list.length>1?'<div class="card-foot">'+delBtn("tareasHechas","","Borrar tareas hechas")+"</div>":"");
 h+="</div>";
 $("#v-tareas").innerHTML=h;
}
function taskSheet(id,preset){
 const x=id?D.tareas.find(t=>t.id===id):Object.assign({title:"",notes:"",due:tF==="proximas"?addDays(today(),1):today(),time:"",prio:3,area:""},preset||{});
 if(!x)return;
 const areas=[...new Set(D.tareas.map(t=>t.area).filter(Boolean))];
 openSheet({title:id?"Editar tarea":"Nueva tarea",html:()=>'<form class="form" id="sfTask" autocomplete="off">'+
  '<div class="field"><label for="f-title">Tarea</label><input id="f-title" name="title" required maxlength="200" value="'+esc(x.title)+'" autofocus></div>'+
  '<div class="field"><label for="f-notes">Notas</label><textarea id="f-notes" name="notes" rows="3">'+esc(x.notes)+"</textarea></div>"+
  '<div class="frow"><div class="field"><label for="f-due">Fecha</label><input type="date" id="f-due" name="due" value="'+(x.due||"")+'"></div><div class="field"><label for="f-time">Hora</label><input type="time" id="f-time" name="time" value="'+(x.time||"")+'"></div></div>'+
  '<div class="field"><span class="flabel">Prioridad</span><div class="chips">'+[[1,"Alta"],[2,"Media"],[3,"Baja"]].map(([v,l])=>'<label><input type="radio" name="prio" value="'+v+'"'+((x.prio||3)==v?" checked":"")+"><span>"+l+"</span></label>").join("")+"</div></div>"+
  '<div class="field"><label for="f-area">Área o proyecto</label><input id="f-area" name="area" list="areasList" value="'+esc(x.area)+'" placeholder="Trabajo, Casa, Facultad…"><datalist id="areasList">'+areas.map(a=>'<option value="'+esc(a)+'">').join("")+"</datalist></div>"+
  '<p class="small muted" style="margin:0">Si le ponés fecha y hora, te aviso a ese horario.</p>'+gcField("tarea",x,!id," · necesita fecha")+
  '<div class="sheet-actions">'+(id?delBtn("tarea",id):"")+'<span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>',
  forms:{sfTask(fd){
   const o={title:String(fd.get("title")).trim(),notes:String(fd.get("notes")||"").trim(),due:fd.get("due")||"",time:fd.get("time")||"",prio:+fd.get("prio")||3,area:String(fd.get("area")||"").trim()};
   if(!o.title)return;
   let nid=id;if(id){if(o.due!==x.due||o.time!==x.time)x.avisado=false;Object.assign(x,o)}else{nid=uid();D.tareas.push(Object.assign({id:nid,done:false,created:today()},o))}
   put("tareas");closeSheet();toast(id?"Tarea guardada":"Tarea creada");gcAfterSave("tarea",nid,fd,!id);
  }}});
}

/* ================= HÁBITOS ================= */
let hSel=null;
const CATALOGO={"Salud":["Tomar 2 litros de agua","Dormir 8 horas","Comer fruta o verdura","Caminar 30 minutos","Entrenar","Estirar 10 minutos","Sin azúcar","Tomar las vitaminas"],"Mente":["Meditar 10 minutos","Leer 20 minutos","Escribir un diario","Anotar 3 cosas que agradezco","Sin redes antes de dormir"],"Productividad":["Planificar el día","Ordenar el escritorio","Estudiar 1 hora","Practicar inglés","Revisar la lista de tareas"],"Finanzas":["Anotar los gastos del día","Evitar compras impulsivas","Separar plata para ahorro"]};
function dayInfo(s){const hs=D.habitos.filter(h=>(h.creado||s)<=s&&isDue(h,s));if(!hs.length)return null;let sum=0,full=0;hs.forEach(h=>{const r=Math.min(1,hCnt(h,s)/(h.meta||1));sum+=r;if(r>=1)full++});return {pct:sum/hs.length,full,n:hs.length,hs}}
function avgPct(days){let sum=0,n=0;const t=today();for(let i=0;i<days;i++){const d=dayInfo(addDays(t,-i));if(d){sum+=d.pct;n++}}return n?sum/n:null}
function perfectStreak(){let s=today();const d0=dayInfo(s);if(!d0||d0.pct<1)s=addDays(s,-1);let n=0;for(let i=0;i<400;i++){const d=dayInfo(s);if(d){if(d.pct>=1)n++;else break}else if(!D.habitos.some(h=>(h.creado||s)<=s))break;s=addDays(s,-1)}return n}
const pctTxt=p=>Math.round((p||0)*100)+"%";
function trackerMsg(p){return p>=1?"¡Día perfecto! Cumpliste todos tus hábitos.":p>=.75?"Muy bien, ya casi.":p>=.5?"Vas por la mitad. Seguí así.":p>0?"Buen comienzo.":"Todavía no marcaste ningún hábito."}
let hMes=null;
const MESES_C=MESES;
function monthDays(k){const [y,m]=k.split("-").map(Number);return new Date(y,m,0).getDate()}
function freqTxt(h){return h.cada>1?"Cada "+h.cada+" días":h.dias&&h.dias.length?h.dias.slice().sort((a,b)=>((a+6)%7)-((b+6)%7)).map(d=>cap(DC[d])).join(" "):"Todos los días"}
function habMonthStats(h,k,t){const n=monthDays(k);let ok=0,due=0;for(let d=1;d<=n;d++){const s=k+"-"+pad2(d);if(s>t)break;if(s<(h.creado||s)||!isDue(h,s))continue;due++;if(hOk(h,s))ok++}return {ok,due}}
function monthChart(k,vals,t,cw){
 const n=vals.length;cw=Math.max(280,cw||320);
 const W=cw,H=W<520?210:240,pl=40,pr=14,pt=26,pb=32,iw=W-pl-pr,ih=H-pt-pb,step=iw/Math.max(1,n-1),dense=step<26;
 const X=i=>pl+iw*(n===1?.5:i/(n-1)),Y=v=>pt+ih*(1-v/100);
 let g="";[0,25,50,75,100].forEach(v=>{g+='<line class="mc-grid" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'"/><text class="mc-ax" x="'+(pl-8)+'" y="'+(Y(v)+4).toFixed(1)+'" text-anchor="end">'+v+"%</text>"});
 let xl="";for(let i=0;i<n;i++){const s=k+"-"+pad2(i+1);if(dense&&s!==t&&i!==0&&(i+1)%5!==0)continue;xl+='<text class="mc-ax'+(s===t?" mc-today":"")+'" x="'+X(i).toFixed(1)+'" y="'+(H-12)+'" text-anchor="middle">'+(i+1)+"</text>"}
 const pts=[];vals.forEach((v,i)=>{if(v!=null)pts.push([X(i),Y(v),v,i])});
 let line="",area="",dots="",lab="";
 if(pts.length){line="M"+pts.map(p=>p[0].toFixed(1)+" "+p[1].toFixed(1)).join("L");area=line+"L"+pts[pts.length-1][0].toFixed(1)+" "+Y(0).toFixed(1)+"L"+pts[0][0].toFixed(1)+" "+Y(0).toFixed(1)+"Z";
  pts.forEach((p,j)=>{const last=j===pts.length-1;dots+='<circle class="mc-dot'+(last?" last":"")+'" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(last?5:dense?2.5:3.5)+'"/>';if(!dense||last)lab+='<text class="mc-lab'+(last?" last":"")+'" x="'+p[0].toFixed(1)+'" y="'+(p[1]-10).toFixed(1)+'" text-anchor="middle">'+p[2]+"%</text>"})}
 return '<svg class="mchart" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+" "+H+'" role="img" aria-label="Progreso diario de hábitos en el mes">'+g+(area?'<path class="mc-area" d="'+area+'"/><path class="mc-line" d="'+line+'"/>':"")+dots+lab+xl+"</svg>";
}
function catalogSheet(){
 const have=new Set(D.habitos.map(h=>norm(h.nombre)));
 openSheet({title:"Elegir hábitos",html:()=>'<form class="form" id="sfCatH"><p class="small muted" style="margin:0">Marcá los que querés sumar a tu tracker. Después podés cambiar los días y las veces por día de cada uno.</p>'+Object.entries(CATALOGO).map(([g,list])=>'<div class="field"><span class="flabel">'+g+'</span><div class="chips">'+list.map(n=>{const had=have.has(norm(n));return '<label><input type="checkbox" name="h" value="'+esc(n)+'"'+(had?" checked disabled":"")+"><span>"+esc(n)+(had?" ✓":"")+"</span></label>"}).join("")+"</div></div>").join("")+'<div class="field"><label for="hc-otro">Otro hábito (opcional)</label><input id="hc-otro" name="otro" maxlength="80" placeholder="Ej.: Llamar a mi abuela"></div><div class="sheet-actions"><span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Agregar al tracker</button></div></form>',
 forms:{sfCatH(fd){const names=fd.getAll("h").map(String);const o=String(fd.get("otro")||"").trim();if(o)names.push(o);const add=names.filter(n=>!have.has(norm(n)));if(!add.length){toast("Marcá al menos un hábito.");return}add.forEach(n=>{D.habitos.push({id:uid(),nombre:n,color:COLORS[D.habitos.length%COLORS.length],dias:[],meta:1,creado:today(),log:{}})});put("habitos");closeSheet();toast(add.length===1?"Agregaste 1 hábito":"Agregaste "+add.length+" hábitos")}}});
}
function habCard(x,t){
 const c=hCnt(x,t),m=x.meta||1,ok=c>=m,dueT=isDue(x,t),st=streak(x);
 let wk="";for(let i=6;i>=0;i--){const s=addDays(t,-i);const cc=hCnt(x,s);const cls=cc>=m?"on":cc>0?"part":(!isDue(x,s)||s<x.creado)?"off":"";wk+='<button class="dot '+cls+(i===0?" today":"")+'" data-act="hDay" data-id="'+x.id+'" data-v="'+s+'" aria-label="'+esc(x.nombre)+", "+longDate(s)+(cc>=m?": cumplido":"")+'"><i></i><span>'+DL[wd(s)]+"</span></button>"}
 return '<div class="hab'+(dueT?"":" rest")+'" style="--hc:var(--ink)"><button class="hab-check '+(ok?"on":c?"part":"")+'" data-act="hTap" data-id="'+x.id+'" aria-label="'+(ok?"Cumplido hoy":"Marcar hoy")+'">'+(ok?ico("check",2.6):m>1?c+"/"+m:"")+'</button><div class="hab-body"><button class="hab-name" data-act="hOpen" data-id="'+x.id+'">'+esc(x.nombre)+'</button><span class="small muted">'+(dueT?"":"Hoy libre · ")+(st?"Racha de "+st+(st===1?" día":" días"):"Sin racha todavía")+" · "+Math.round(rate(x,30)*100)+"% en 30 días</span></div><div class=\"week\">"+wk+"</div></div>";
}
function hTap(id,day,inc){
 const x=D.habitos.find(h=>h.id===id);if(!x)return;const t=day||today();if(t>today())return;
 const c=hCnt(x,t),m=x.meta||1;x.log=x.log||{};
 const nv=day&&day!==today()&&!inc?(c>=m?0:m):(c>=m?0:c+1);
 if(nv<=0)delete x.log[t];else x.log[t]=nv;
 put("habitos");render();
 if(nv>=m&&c<m&&t===today()){const di=dayInfo(t);if(di&&di.pct>=1)toast("¡Día perfecto! Cumpliste el 100% de tus hábitos");else{const s=streak(x);toast((s>1?"¡Bien! Racha de "+s+" días en "+x.nombre:"¡Hecho! "+x.nombre)+(di?" · "+pctTxt(di.pct)+" del día":""))}}
}
function habitSheet(id,preset){
 const x=id?D.habitos.find(h=>h.id===id):{nombre:preset||"",color:COLORS[D.habitos.length%COLORS.length],dias:[],meta:1};
 if(!x)return;
 const order=[1,2,3,4,5,6,0];
 openSheet({title:id?x.nombre:"Nuevo hábito",html:()=>{
  let s="";
  if(id){
   const t=today();let cells="";const start=addDays(weekStart(t),-7*16);
   for(let d=start;d<=addDays(weekStart(t),6);d=addDays(d,1)){const cc=hCnt(x,d),m=x.meta||1;const cls=d>t?"fut":cc>=m?"on":cc>0?"part":(!isDue(x,d)||d<x.creado)?"off":"";cells+='<i class="'+cls+'" title="'+longDate(d)+'"></i>'}
   s+='<div style="--hc:var(--ink)"><div class="stats" style="margin-bottom:14px"><div class="stat"><span class="eyebrow">Racha</span><span class="v">'+streak(x)+'</span></div><div class="stat"><span class="eyebrow">Mejor racha</span><span class="v">'+bestStreak(x)+'</span></div><div class="stat"><span class="eyebrow">30 días</span><span class="v">'+Math.round(rate(x,30)*100)+'%</span></div><div class="stat"><span class="eyebrow">Días cumplidos</span><span class="v">'+Object.keys(x.log||{}).filter(d=>hOk(x,d)).length+'</span></div></div><span class="flabel">Últimas 17 semanas</span><div class="heat-wrap" style="margin:6px 0 18px"><div class="heat">'+cells+"</div></div></div>";
  }
  s+='<form class="form" id="sfHab" autocomplete="off"><div class="field"><label for="h-n">Nombre</label><input id="h-n" name="nombre" required maxlength="80" value="'+esc(x.nombre)+'"'+(id?"":" autofocus")+'></div>'+
   '<div class="field"><span class="flabel">Ícono (opcional)</span><div class="chips">'+["","💊","📚","💪","🧘","💧","🏃","😴","🥗","💰","✍️","🎯"].map(e=>'<label><input type="radio" name="emoji" value="'+e+'"'+((x.emoji||"")===e?" checked":"")+'><span>'+(e||"Ninguno")+"</span></label>").join("")+"</div></div>"+
   '<div class="field"><span class="flabel">Frecuencia</span><div class="chips">'+[["todos","Todos los días"],["semana","Días de la semana"],["cada","Cada X días"]].map(([v,l])=>'<label><input type="radio" name="tipo" value="'+v+'"'+((x.cada>1?"cada":(x.dias&&x.dias.length?"semana":"todos"))===v?" checked":"")+"><span>"+l+"</span></label>").join("")+"</div></div>"+
   '<div class="field f-dias"><span class="flabel">¿Qué días?</span><div class="chips">'+order.map(d=>'<label><input type="checkbox" name="dias" value="'+d+'"'+((x.dias||[]).includes(d)?" checked":"")+"><span>"+cap(DC[d])+"</span></label>").join("")+"</div></div>"+
   '<div class="field f-cada"><label for="h-cada">Repetir cada cuántos días</label><input type="number" id="h-cada" name="cada" min="2" max="30" value="'+(x.cada>1?x.cada:2)+'"></div>'+
   '<div class="field"><label for="h-m">Veces por día</label><input type="number" id="h-m" name="meta" min="1" max="20" value="'+(x.meta||1)+'"></div>'+
   '<div class="sheet-actions">'+(id?delBtn("habito",id):"")+'<span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>';
  return s;},
  forms:{sfHab(fd){
   const tipo=fd.get("tipo")||"todos";
   const o={nombre:String(fd.get("nombre")).trim(),emoji:String(fd.get("emoji")||""),dias:tipo==="semana"?fd.getAll("dias").map(Number):[],cada:tipo==="cada"?Math.max(2,Math.min(30,Math.round(+fd.get("cada")||2))):0,meta:Math.max(1,Math.min(20,+fd.get("meta")||1))};
   if(!o.nombre)return;if(o.dias.length===7)o.dias=[];
   if(tipo==="semana"&&!o.dias.length){toast("Elegí al menos un día de la semana.");return}
   if(id){if(o.cada&&o.cada!==x.cada)o.ancla=today();Object.assign(x,o)}else D.habitos.push(Object.assign({id:uid(),creado:today(),ancla:today(),log:{}},o));
   put("habitos");closeSheet();toast(id?"Hábito guardado":"Hábito creado");
  }}});
}

/* ================= ENFOQUE ================= */
const MODES={work:"Enfoque",short:"Pausa corta",long:"Pausa larga"};
const timerDur=()=>D.enfoque.cfg[D.enfoque.timer.mode]*60;
function timerRemain(){const T=D.enfoque.timer;if(T.endAt)return Math.max(0,(T.endAt-Date.now())/1000);if(T.left!=null)return T.left;return timerDur()}
function labelInfo(l){if(!l)return {text:""};if(l.startsWith("t:")){const x=D.tareas.find(t=>t.id===l.slice(2));return {text:x?x.title:"",taskId:x&&x.id}}if(l.startsWith("m:")){const m=materia(l.slice(2));return {text:m?"Estudio: "+m.nombre:"",materiaId:m&&m.id}}return {text:""}}
function fStart(){const T=D.enfoque.timer;T.endAt=Date.now()+timerRemain()*1000;T.left=null;put("enfoque");if(D.cfg.notif&&canNotify()&&Notification.permission==="default")Notification.requestPermission().catch(()=>{})}
function fPause(){const T=D.enfoque.timer;T.left=timerRemain();T.endAt=null;put("enfoque")}
function fComplete(){
 const E=D.enfoque,T=E.timer;
 if(T.mode==="work"){
  const L=labelInfo(T.label);
  E.sesiones.push({id:uid(),fecha:today(),fin:Date.now(),min:E.cfg.work,label:T.label,texto:L.text});
  if(E.sesiones.length>3000)E.sesiones=E.sesiones.slice(-3000);
  if(L.materiaId){D.estudio.sesiones.push({id:uid(),fecha:today(),materiaId:L.materiaId,min:E.cfg.work,nota:"Pomodoro",origen:"pomodoro"});put("estudio")}
  T.ciclo=(T.ciclo||0)+1;T.mode=T.ciclo%(E.cfg.every||4)===0?"long":"short";
  notify("Terminó tu bloque de enfoque","Tomate "+E.cfg[T.mode]+" minutos de pausa","pomodoro");
 }else{T.mode="work";notify("Terminó la pausa","Cuando quieras, arrancá otro bloque","pomodoro")}
 T.endAt=null;T.left=null;put("enfoque");safeRender();
}
function renderEnfoque(){
 const E=D.enfoque,T=E.timer,t=today(),wk=weekStart(t);
 const pend=D.tareas.filter(x=>!x.done).sort(taskSort).slice(0,40);
 const opts='<option value="">Sin etiqueta</option>'+(D.estudio.materias.length?'<optgroup label="Materias">'+D.estudio.materias.map(m=>'<option value="m:'+m.id+'"'+(T.label==="m:"+m.id?" selected":"")+">"+esc(m.nombre)+"</option>").join("")+"</optgroup>":"")+(pend.length?'<optgroup label="Tareas">'+pend.map(x=>'<option value="t:'+x.id+'"'+(T.label==="t:"+x.id?" selected":"")+">"+esc(x.title.slice(0,60))+"</option>").join("")+"</optgroup>":"");
 const C=2*Math.PI*54;
 let h=vhead("Enfoque","Bloques de concentración con pausas (método Pomodoro)",'<button class="btn" data-act="fCfg">Ajustar tiempos</button>');
 h+='<div class="board two"><div class="stack">';
 h+='<article class="card" style="--mc:var(--m-enfoque)"><div class="timer"><div class="seg" role="tablist">'+Object.entries(MODES).map(([k,l])=>'<button role="tab" data-act="fMode" data-v="'+k+'" aria-selected="'+(T.mode===k)+'">'+l+"</button>").join("")+'</div>'+
  '<div class="ring'+(T.mode!=="work"?" brk":"")+'" id="fRing"><svg viewBox="0 0 120 120"><circle class="track" cx="60" cy="60" r="54"/><circle class="prog" id="fProg" cx="60" cy="60" r="54" stroke-dasharray="'+C.toFixed(2)+'" stroke-dashoffset="0"/></svg><div class="center"><span class="tm" id="fTm">'+mmss(timerRemain())+'</span><span class="small muted" id="fSub"></span></div></div>'+
  '<div class="field"><label for="fLabel">¿En qué vas a trabajar?</label><select id="fLabel">'+opts+"</select></div>"+
  '<div class="timer-btns"><button class="btn mod lg" id="fMain" data-act="fMain"></button><button class="btn" data-act="fReset">Reiniciar</button><button class="btn" data-act="fSkip">Saltar</button></div></div></article>';
 const ws=weekStats();
 h+=card("hoy","Tu semana","desde el lunes",'<div class="stats"><div class="stat"><span class="eyebrow">Tareas hechas</span><span class="v">'+ws.tareas+'</span></div><div class="stat"><span class="eyebrow">Hábitos</span><span class="v">'+(ws.hab==null?"—":Math.round(ws.hab*100)+"%")+'</span></div><div class="stat"><span class="eyebrow">Enfoque</span><span class="v">'+fmtMin(ws.foco)+'</span></div><div class="stat"><span class="eyebrow">Entrenos</span><span class="v">'+ws.gym+'</span></div><div class="stat"><span class="eyebrow">Estudio</span><span class="v">'+fmtMin(ws.est)+"</span></div></div>");
 h+='</div><div class="stack">';
 const vals=[],labs=[];for(let i=6;i>=0;i--){const s=addDays(t,-i);vals.push(focusMin(s));labs.push(i===0?"hoy":DL[wd(s)])}
 const todayS=E.sesiones.filter(x=>x.fecha===t);
 h+=card("enfoque","Minutos de enfoque","últimos 7 días",'<div class="stats" style="margin-bottom:10px"><div class="stat"><span class="eyebrow">Hoy</span><span class="v">'+fmtMin(focusMin(t))+'</span></div><div class="stat"><span class="eyebrow">Bloques hoy</span><span class="v">'+todayS.length+'</span></div><div class="stat"><span class="eyebrow">Semana</span><span class="v">'+fmtMin(focusMin(wk,t))+"</span></div></div>"+bars(vals,labs,null,"Minutos de enfoque por día"));
 const recent=E.sesiones.slice(-6).reverse();
 h+=card("enfoque","Bloques recientes","",recent.length?recent.map(x=>'<div class="rec-row"><span>'+esc(x.texto||"Sin etiqueta")+'</span><span class="muted num">'+fmtDay(x.fecha)+" · "+x.min+" min</span></div>").join(""):'<p class="empty">Tus bloques terminados aparecen acá.</p>');
 h+="</div></div>";
 $("#v-enfoque").innerHTML=h;timerUI();
}
function timerUI(){
 const T=D.enfoque.timer,rem=timerRemain(),dur=timerDur();
 document.title=T.endAt?mmss(rem)+" · "+MODES[T.mode]+" · Corcho App":"Corcho App";
 const ht=$("#hoyTimer");if(ht)ht.textContent=mmss(rem);
 if(view!=="enfoque")return;
 const tm=$("#fTm");if(!tm)return;tm.textContent=mmss(rem);
 const C=2*Math.PI*54,p=$("#fProg");if(p)p.setAttribute("stroke-dashoffset",(C*(1-rem/dur)).toFixed(2));
 const every=D.enfoque.cfg.every||4;
 $("#fSub").textContent=T.mode==="work"?"Bloque "+((T.ciclo||0)%every+1)+" de "+every:MODES[T.mode];
 $("#fMain").innerHTML=T.endAt?"Pausar":(T.left!=null?ico("play")+" Seguir":ico("play")+" Empezar");
}
function focusCfgSheet(){
 const c=D.enfoque.cfg;
 openSheet({title:"Tiempos del temporizador",html:()=>'<form class="form" id="sfFoc"><div class="frow"><div class="field"><label for="fc-w">Enfoque (min)</label><input type="number" id="fc-w" name="work" min="1" max="180" value="'+c.work+'"></div><div class="field"><label for="fc-s">Pausa corta</label><input type="number" id="fc-s" name="short" min="1" max="60" value="'+c.short+'"></div><div class="field"><label for="fc-l">Pausa larga</label><input type="number" id="fc-l" name="long" min="1" max="90" value="'+c.long+'"></div><div class="field"><label for="fc-e">Pausa larga cada</label><input type="number" id="fc-e" name="every" min="2" max="10" value="'+c.every+'"></div></div><div class="sheet-actions"><span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>',
 forms:{sfFoc(fd){["work","short","long","every"].forEach(k=>{const v=Math.round(+fd.get(k));if(v>0)c[k]=v});const T=D.enfoque.timer;if(!T.endAt)T.left=null;put("enfoque");closeSheet();toast("Tiempos guardados")}}});
}

/* ================= ENTRENOS ================= */
let restEnd=null,restDone=0,gymSaveT=null;
const gKey=s=>norm(s);
function lastFor(name){const k=gKey(name);const L=D.gym.logs.filter(l=>l.tipo!=="cardio").sort((a,b)=>b.fin-a.fin);for(const l of L){const e=l.ejercicios.find(e=>gKey(e.nombre)===k);if(e)return e.series}return null}
function prMap(logs){const m={};(logs||D.gym.logs).forEach(l=>(l.ejercicios||[]).forEach(e=>e.series.forEach(s=>{const kg=+s.kg||0;const k=gKey(e.nombre);if(kg>0&&(!m[k]||kg>m[k].kg))m[k]={nombre:e.nombre,kg,reps:s.reps,fecha:l.fecha}})));return m}
const vol=l=>(l.ejercicios||[]).reduce((a,e)=>a+e.series.reduce((b,s)=>b+(+s.reps||0)*(+s.kg||0),0),0);
const nSets=l=>(l.ejercicios||[]).reduce((a,e)=>a+e.series.length,0);
const durMin=l=>Math.max(1,Math.round(((l.fin||0)-(l.inicio||0))/60000));
function renderEntreno(){
 const G=D.gym,t=today(),wk=weekStart(t);
 const gw=G.logs.filter(l=>l.fecha>=wk).length;
 let h=vhead("Entrenos",gw+" de "+D.cfg.metaEntrenos+" esta semana",G.activo?"":'<button class="btn" data-act="gCardio">Registrar cardio</button><button class="btn primary" data-act="gRut">'+ico("plus")+" Nueva rutina</button>");
 if(G.activo)h+=activeWorkout();
 h+='<div class="board two"><div class="stack">';
 if(!G.activo)h+=card("entreno","Empezar entreno","",'<div class="routines">'+G.rutinas.map(r=>'<div class="rt"><div class="rt-main"><b>'+esc(r.nombre)+'</b><span class="small muted">'+r.ejercicios.length+" ejercicios · "+esc(r.ejercicios.slice(0,3).map(e=>e.nombre).join(", "))+(r.ejercicios.length>3?"…":"")+'</span></div><button class="btn" data-act="gRut" data-id="'+r.id+'">Editar</button><button class="btn mod" data-act="gStart" data-id="'+r.id+'">'+ico("play")+" Empezar</button></div>").join("")+'</div>',
   '<button class="linkbtn" data-act="gStart" data-id="">Entreno libre (sin rutina)</button>');
 const hist=G.logs.slice().sort((a,b)=>b.fin-a.fin).slice(0,20);
 h+=card("entreno","Historial",G.logs.length?G.logs.length+" en total":"",hist.length?'<div class="hist">'+hist.map(l=>'<button data-act="gLog" data-id="'+l.id+'"><span><b>'+esc(l.nombre)+'</b><span class="small muted">'+cap(fmtDay(l.fecha))+(l.tipo==="cardio"?" · "+l.cardio.min+" min"+(l.cardio.km?" · "+n1(l.cardio.km)+" km":""):" · "+durMin(l)+" min · "+nSets(l)+" series")+'</span></span><span class="num small muted">'+(l.tipo==="cardio"?"Cardio":vol(l)?n1(vol(l))+" kg":"")+"</span></button>").join("")+"</div>":'<p class="empty">Cuando termines un entreno, queda guardado acá con sus series y pesos.</p>');
 h+='</div><div class="stack">';
 const vals=[],labs=[];for(let i=7;i>=0;i--){const s=addDays(wk,-7*i),e=addDays(s,6);vals.push(G.logs.filter(l=>l.fecha>=s&&l.fecha<=e).length);const d=parseISO(s);labs.push(i===0?"esta":d.getDate()+"/"+(d.getMonth()+1))}
 h+=card("entreno","Constancia","entrenos por semana",'<div class="meter" style="margin-bottom:12px"><i style="width:'+Math.min(100,gw/Math.max(1,D.cfg.metaEntrenos)*100)+'%"></i></div>'+bars(vals,labs,null,"Entrenos por semana"),'<span class="small muted">Meta: '+D.cfg.metaEntrenos+' por semana</span><span class="grow"></span><button class="linkbtn" data-go="ajustes">Cambiar meta</button>');
 const prs=Object.values(prMap()).sort((a,b)=>b.fecha.localeCompare(a.fecha)).slice(0,10);
 h+=card("entreno","Récords personales","peso máximo",prs.length?prs.map(p=>'<div class="rec-row"><span>'+esc(p.nombre)+'</span><span class="num">'+n1(p.kg)+" kg × "+(p.reps||0)+' <span class="muted small">'+fmtDay(p.fecha)+"</span></span></div>").join(""):'<p class="empty">Registrá pesos en tus series y acá vas a ver tus mejores marcas.</p>');
 h+="</div></div>";
 $("#v-entreno").innerHTML=h;gymUI();
}
function activeWorkout(){
 const A=D.gym.activo;const exNames=[...new Set(D.gym.rutinas.flatMap(r=>r.ejercicios.map(e=>e.nombre)).concat(D.gym.logs.flatMap(l=>(l.ejercicios||[]).map(e=>e.nombre))))];
 let h='<article class="card" style="--mc:var(--m-entreno);margin-bottom:14px"><header class="card-head"><h2><span class="pin"></span>'+esc(A.nombre)+'</h2><span class="num" id="gElapsed"></span></header>';
 h+='<div class="rest-row" style="margin-bottom:12px"><span class="small muted">Descanso:</span>'+[60,90,120,180].map(s=>'<button class="btn" data-act="gRest" data-v="'+s+'">'+mmss(s).replace(/^0/,"")+"</button>").join("")+'<span class="rest-pill" id="gRestPill" hidden></span></div>';
 h+='<div class="wk-list">'+A.ejercicios.map((e,i)=>{const prev=lastFor(e.nombre);return '<div class="ex"><div class="ex-head"><input id="gx-'+i+'" data-gx="'+i+'" data-gf="nombre" value="'+esc(e.nombre)+'" aria-label="Ejercicio">'+xBtn("gEx",i)+'</div><div class="sets"><span class="sh">Serie</span><span class="sh">Reps</span><span class="sh">Kg</span><span class="sh">Hecha</span><span></span>'+
  e.series.map((s,j)=>'<span class="num sn">'+(j+1)+'</span><input type="number" inputmode="numeric" min="0" id="gs-'+i+"-"+j+'-r" data-gx="'+i+'" data-gs="'+j+'" data-gf="reps" value="'+esc(s.reps)+'" aria-label="Repeticiones serie '+(j+1)+'"><input type="number" inputmode="decimal" step="any" min="0" id="gs-'+i+"-"+j+'-k" data-gx="'+i+'" data-gs="'+j+'" data-gf="kg" value="'+esc(s.kg)+'" aria-label="Kilos serie '+(j+1)+'"><button class="setok'+(s.ok?" on":"")+'" data-act="gOk" data-i="'+i+'" data-j="'+j+'" aria-label="Serie '+(j+1)+(s.ok?" hecha":" pendiente")+'">'+ico("check",2.6)+'</button><button class="x" data-act="gDelSet" data-i="'+i+'" data-j="'+j+'" aria-label="Quitar serie">×</button>').join("")+
  '</div><div style="display:flex;flex-wrap:wrap;gap:6px 14px;align-items:center"><button class="linkbtn" data-act="gAddSet" data-i="'+i+'">+ Agregar serie</button>'+(prev?'<span class="small muted">Última vez: '+esc(prev.map(s=>(s.reps||0)+(s.kg?"×"+n1(s.kg):"")).join(", "))+"</span>":"")+"</div></div>"}).join("")+"</div>";
 h+='<form id="gAddExForm" class="quick" style="margin-top:12px" autocomplete="off"><input id="gNewEx" name="ex" placeholder="Agregar ejercicio…" list="exList" aria-label="Nuevo ejercicio"><datalist id="exList">'+exNames.map(n=>'<option value="'+esc(n)+'">').join("")+'</datalist><button class="btn">Agregar</button></form>';
 h+='<div class="sheet-actions" style="margin-top:14px">'+delBtn("gCancel","","Descartar entreno")+'<span class="grow"></span><button class="btn mod lg" data-act="gFinish">Terminar entreno</button></div></article>';
 return h;
}
function gymUI(){
 const A=D.gym.activo;const el=$("#gElapsed");
 if(A&&el)el.textContent=mmss((Date.now()-A.inicio)/1000).replace(/^(\d\d):/,(m,a)=>+a>=60?Math.floor(a/60)+":"+pad2(a%60)+":":a+":");
 const p=$("#gRestPill");
 if(restEnd){const r=(restEnd-Date.now())/1000;if(r<=0){restEnd=null;restDone=Date.now();beep(3);toast("Terminó el descanso. ¡A la próxima serie!")}else if(p){p.hidden=false;p.textContent="Descanso "+mmss(r)}}
 if(!restEnd&&p){if(restDone&&Date.now()-restDone<4000){p.hidden=false;p.textContent="¡A la serie!"}else p.hidden=true}
}
function gymSaveSoon(){clearTimeout(gymSaveT);gymSaveT=setTimeout(()=>put("gym"),350)}
function gStart(id){
 const r=D.gym.rutinas.find(x=>x.id===id);
 const ej=r?r.ejercicios.map(e=>{const last=lastFor(e.nombre);const n=Math.max(1,+e.series||3);return {nombre:e.nombre,series:Array.from({length:n},(_,j)=>({reps:last&&last[j]?last[j].reps:(e.reps||""),kg:last&&last[j]?last[j].kg:(e.kg||""),ok:false}))}}):[];
 D.gym.activo={inicio:Date.now(),nombre:r?r.nombre:"Entreno libre",rutinaId:r?r.id:"",ejercicios:ej};put("gym");render();window.scrollTo(0,0);
}
function gFinish(){
 const A=D.gym.activo;if(!A)return;
 const anyOk=A.ejercicios.some(e=>e.series.some(s=>s.ok));
 const ej=A.ejercicios.map(e=>({nombre:String(e.nombre||"").trim()||"Ejercicio",series:e.series.filter(s=>anyOk?s.ok:(+s.reps>0)).map(s=>({reps:+s.reps||0,kg:+s.kg||0}))})).filter(e=>e.series.length);
 if(!ej.length){toast("No hay series para guardar. Marcá las que hiciste o cargá las repeticiones.");return}
 const before=prMap();
 const log={id:uid(),fecha:today(),inicio:A.inicio,fin:Date.now(),nombre:A.nombre,tipo:"fuerza",ejercicios:ej};
 D.gym.logs.push(log);D.gym.activo=null;restEnd=null;put("gym");
 const news=[];ej.forEach(e=>{const k=gKey(e.nombre),mx=Math.max(...e.series.map(s=>s.kg));if(before[k]&&mx>before[k].kg)news.push(e.nombre+" "+n1(mx)+" kg")});
 render();window.scrollTo(0,0);
 toast("Entreno guardado: "+nSets(log)+" series"+(vol(log)?", "+n1(vol(log))+" kg de volumen":"")+(news.length?". Nuevo récord en "+news.join(", "):""));
}
function parseRoutine(txt){return txt.split(/\r?\n/).map(l=>l.trim()).filter(Boolean).map(l=>{const m=l.match(/^(.*?)\s+(\d+)\s*[x×]\s*(\d+)(?:\s+(\d+(?:[.,]\d+)?)\s*(?:kg)?)?\s*$/i);if(m)return {nombre:m[1].trim(),series:+m[2],reps:+m[3],kg:m[4]?+m[4].replace(",","."):""};return {nombre:l,series:3,reps:10,kg:""}})}
function routineSheet(id){
 const r=id?D.gym.rutinas.find(x=>x.id===id):{nombre:"",ejercicios:[]};if(!r)return;
 const txt=r.ejercicios.map(e=>e.nombre+" "+e.series+"x"+e.reps+(e.kg?" "+e.kg+"kg":"")).join("\n");
 openSheet({title:id?"Editar rutina":"Nueva rutina",html:()=>'<form class="form" id="sfRut" autocomplete="off"><div class="field"><label for="ru-n">Nombre</label><input id="ru-n" name="nombre" required maxlength="60" value="'+esc(r.nombre)+'" placeholder="Ej.: Día de piernas"'+(id?"":" autofocus")+'></div><div class="field"><label for="ru-e">Ejercicios, uno por línea: nombre series×reps peso</label><textarea id="ru-e" name="ej" rows="8" placeholder="Sentadilla 4x10 60kg&#10;Prensa 3x12&#10;Plancha 3x30" style="font-family:var(--f-num);font-size:13.5px">'+esc(txt)+'</textarea></div><div class="sheet-actions">'+(id?delBtn("rutina",id):"")+'<span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>',
 forms:{sfRut(fd){const o={nombre:String(fd.get("nombre")).trim(),ejercicios:parseRoutine(String(fd.get("ej")||""))};if(!o.nombre)return;if(!o.ejercicios.length){toast("Agregá al menos un ejercicio.");return}if(id)Object.assign(r,o);else D.gym.rutinas.push(Object.assign({id:uid()},o));put("gym");closeSheet();toast("Rutina guardada")}}});
}
function cardioSheet(){
 openSheet({title:"Registrar cardio",html:()=>'<form class="form" id="sfCar"><div class="field"><span class="flabel">Actividad</span><div class="chips">'+["Correr","Bici","Caminar","Natación","Otro"].map((l,i)=>'<label><input type="radio" name="tipo" value="'+l+'"'+(i===0?" checked":"")+"><span>"+l+"</span></label>").join("")+'</div></div><div class="frow"><div class="field"><label for="ca-m">Minutos</label><input type="number" id="ca-m" name="min" min="1" required inputmode="numeric" autofocus></div><div class="field"><label for="ca-k">Kilómetros</label><input type="number" id="ca-k" name="km" min="0" step="any" inputmode="decimal"></div><div class="field"><label for="ca-f">Fecha</label><input type="date" id="ca-f" name="fecha" value="'+today()+'"></div></div><div class="sheet-actions"><span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>',
 forms:{sfCar(fd){const min=+fd.get("min");if(!(min>0))return;const now=Date.now();D.gym.logs.push({id:uid(),fecha:fd.get("fecha")||today(),inicio:now-min*60000,fin:now,nombre:String(fd.get("tipo")),tipo:"cardio",cardio:{min,km:+fd.get("km")||0},ejercicios:[]});put("gym");closeSheet();toast("Cardio registrado")}}});
}
function logSheet(id){
 const l=D.gym.logs.find(x=>x.id===id);if(!l)return;
 openSheet({title:l.nombre,html:()=>'<p class="muted" style="margin-top:0">'+cap(longDate(l.fecha))+(l.tipo==="cardio"?"":" · "+durMin(l)+" min")+"</p>"+(l.tipo==="cardio"?'<div class="stats"><div class="stat"><span class="eyebrow">Minutos</span><span class="v">'+l.cardio.min+'</span></div><div class="stat"><span class="eyebrow">Km</span><span class="v">'+n1(l.cardio.km)+"</span></div>"+(l.cardio.km?'<div class="stat"><span class="eyebrow">Ritmo</span><span class="v">'+mmss(l.cardio.min*60/l.cardio.km)+"/km</span></div>":"")+"</div>":l.ejercicios.map(e=>'<h3>'+esc(e.nombre)+"</h3>"+e.series.map((s,j)=>'<div class="rec-row"><span class="muted">Serie '+(j+1)+'</span><span class="num">'+s.reps+" reps"+(s.kg?" × "+n1(s.kg)+" kg":"")+"</span></div>").join("")).join("")+'<p class="small muted">Volumen total: '+n1(vol(l))+" kg</p>")+'<div class="sheet-actions" style="margin-top:16px">'+delBtn("log",id)+'<span class="grow"></span><button type="button" class="btn" data-act="close">Cerrar</button></div>'});
}

/* ================= ESTUDIO ================= */
function examDay(e){const d=diffDays(today(),e.fecha);return '<div class="d '+(d<=3?"crit":d<=7?"warn":"")+'"><b>'+d+"</b><small>"+(d===1?"día":"días")+"</small></div>"}
function renderEstudio(){
 const E=D.estudio,t=today(),wk=weekStart(t);const wm=studyMin(wk,t),meta=(D.cfg.metaEstudio||0)*60;
 let h=vhead("Estudio",fmtMin(wm)+" esta semana"+(meta?" de "+D.cfg.metaEstudio+" h":""),'<button class="btn" data-act="eMat">'+ico("plus")+' Materia</button><button class="btn primary" data-act="eSes">Registrar estudio</button>');
 h+='<div class="board two"><div class="stack">';
 h+=card("estudio","Esta semana","",'<div class="stats" style="margin-bottom:12px"><div class="stat"><span class="eyebrow">Hoy</span><span class="v">'+fmtMin(studyMin(t,t))+'</span></div><div class="stat"><span class="eyebrow">Semana</span><span class="v">'+fmtMin(wm)+'</span></div><div class="stat"><span class="eyebrow">Meta</span><span class="v">'+(D.cfg.metaEstudio||0)+' h</span></div></div><div class="meter"><i style="width:'+(meta?Math.min(100,wm/meta*100):0)+'%"></i></div>',
  '<button class="btn mod" data-act="ePomo">'+ico("play")+' Estudiar con temporizador</button>');
 if(!E.materias.length)h+=card("estudio","Tus materias","",'<p class="empty">Agregá las materias o cursos que estás haciendo. Cada una lleva sus temas, fechas de examen y horas de estudio.</p>','<button class="btn mod" data-act="eMat">'+ico("plus")+" Agregar materia</button>");
 else h+='<div class="board" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr))">'+E.materias.map(m=>{const tt=m.temas||[],dn=tt.filter(x=>x.ok).length,nx=E.examenes.filter(e=>e.materiaId===m.id&&e.fecha>=t).sort((a,b)=>a.fecha.localeCompare(b.fecha))[0];return '<button class="subj" data-act="eOpen" data-id="'+m.id+'" style="--sc:var(--ink)"><span class="subj-h"><span class="pin"></span>'+esc(m.nombre)+'</span><span class="small muted">'+fmtMin(studyMin(wk,t,m.id))+" esta semana"+(tt.length?" · "+dn+" de "+tt.length+" temas":"")+'</span>'+(tt.length?'<span class="meter"><i style="width:'+(dn/tt.length*100)+'%"></i></span>':"")+'<span class="small">'+(nx?'<span class="chip '+(diffDays(t,nx.fecha)<=3?"crit":diffDays(t,nx.fecha)<=7?"warn":"")+'">'+esc(nx.titulo)+" · "+fmtDay(nx.fecha)+"</span>":'<span class="muted">Sin exámenes próximos</span>')+"</span></button>"}).join("")+"</div>";
 h+='</div><div class="stack">';
 const ex=nextExams();
 h+=card("estudio","Próximos exámenes y entregas",ex.length?ex.length+"":"",ex.length?ex.slice(0,8).map(e=>'<div class="exam">'+examDay(e)+'<div style="flex:1;min-width:0"><b>'+esc(e.titulo)+'</b><div class="small muted">'+esc((materia(e.materiaId)||{}).nombre||"")+" · "+cap(fmtDay(e.fecha))+"</div></div>"+xBtn("examen",e.id)+"</div>").join(""):'<p class="empty">Cargá fechas de parciales, finales o entregas para ver la cuenta regresiva.</p>','<button class="linkbtn" data-act="eEx">+ Nuevo examen o entrega</button>');
 const vals=[],labs=[];for(let i=6;i>=0;i--){const s=addDays(t,-i);vals.push(studyMin(s,s));labs.push(i===0?"hoy":DL[wd(s)])}
 h+=card("estudio","Minutos por día","últimos 7 días",bars(vals,labs,null,"Minutos de estudio por día"));
 h+="</div></div>";
 $("#v-estudio").innerHTML=h;
}
function materiaSheet(id){
 const m=id?materia(id):{nombre:"",color:COLORS[(D.estudio.materias.length+4)%COLORS.length],temas:[]};if(id&&!m)return;
 const form=()=>'<form class="form" id="sfMat" autocomplete="off"><div class="field"><label for="ma-n">Nombre</label><input id="ma-n" name="nombre" required maxlength="80" value="'+esc(m.nombre)+'" placeholder="Ej.: Análisis Matemático"'+(id?"":" autofocus")+'></div><div class="field"><span class="flabel">Color</span><div class="chips swatches">'+COLORS.map((c,i)=>'<label><input type="radio" name="color" value="'+c+'"'+(m.color===c?" checked":"")+' aria-label="Color '+(i+1)+'"><span style="--sw:'+c+'"></span></label>').join("")+'</div></div><div class="sheet-actions">'+(id?delBtn("materia",id,"Eliminar materia"):"")+'<span class="grow"></span>'+(id?"":'<button type="button" class="btn" data-act="close">Cancelar</button>')+'<button class="btn primary">'+(id?"Guardar cambios":"Crear materia")+"</button></div></form>";
 openSheet({title:id?m.nombre:"Nueva materia",html:()=>{
  if(!id)return form();
  const t=today(),tt=m.temas||[],ex=D.estudio.examenes.filter(e=>e.materiaId===id).sort((a,b)=>a.fecha.localeCompare(b.fecha)),ses=D.estudio.sesiones.filter(s=>s.materiaId===id).slice(-6).reverse();
  return '<div class="stats"><div class="stat"><span class="eyebrow">Semana</span><span class="v">'+fmtMin(studyMin(weekStart(t),t,id))+'</span></div><div class="stat"><span class="eyebrow">Total</span><span class="v">'+fmtMin(studyMin("0000-01-01","9999-12-31",id))+'</span></div><div class="stat"><span class="eyebrow">Temas</span><span class="v">'+tt.filter(x=>x.ok).length+"/"+tt.length+"</span></div></div>"+
  '<h3>Temas</h3>'+(tt.length?tt.map(x=>'<div class="topic'+(x.ok?" done":"")+'"><button class="chk'+(x.ok?" on":"")+'" data-act="eTema" data-id="'+id+'" data-v="'+x.id+'" aria-label="'+(x.ok?"Marcar pendiente":"Marcar visto")+'">'+ico("check",3)+"</button><span>"+esc(x.t)+"</span>"+xBtn("tema",x.id,' data-m="'+id+'"')+"</div>").join(""):'<p class="empty">Sumá los temas del programa y tachalos a medida que los estudiás.</p>')+
  '<form id="sfTema" class="quick" style="margin-top:8px" autocomplete="off"><input id="te-n" name="t" placeholder="Nuevo tema…" aria-label="Nuevo tema" maxlength="120"><button class="btn">Agregar</button></form>'+
  '<h3>Exámenes y entregas</h3>'+(ex.length?ex.map(e=>'<div class="exam">'+(e.fecha>=t?examDay(e):'<div class="d"><b>✓</b><small>pasó</small></div>')+'<div style="flex:1;min-width:0"><b>'+esc(e.titulo)+'</b><div class="small muted">'+cap(fmtDay(e.fecha))+"</div></div>"+xBtn("examen",e.id)+"</div>").join(""):'<p class="empty">Sin fechas cargadas.</p>')+'<button class="linkbtn" data-act="eEx" data-id="'+id+'">+ Agregar examen o entrega</button>'+
  '<h3>Sesiones recientes</h3>'+(ses.length?ses.map(s=>'<div class="rec-row"><span>'+cap(fmtDay(s.fecha))+(s.nota?' <span class="muted">· '+esc(s.nota)+"</span>":"")+'</span><span class="num">'+fmtMin(s.min)+" "+xBtn("sesion",s.id)+"</span></div>").join(""):'<p class="empty">Todavía no registraste estudio en esta materia.</p>')+
  '<div class="sheet-actions" style="margin:6px 0 4px"><button class="btn" data-act="eSes" data-id="'+id+'">Registrar estudio</button><button class="btn mod" data-act="ePomo" data-id="'+id+'">'+ico("play")+" Temporizador</button></div>"+
  '<h3>Datos de la materia</h3>'+form();},
 forms:{sfMat(fd){const o={nombre:String(fd.get("nombre")).trim(),color:fd.get("color")||COLORS[0]};if(!o.nombre)return;if(id){Object.assign(m,o);put("estudio");SH.title=m.nombre;drawSheet();toast("Materia guardada")}else{const nm=Object.assign({id:uid(),temas:[]},o);D.estudio.materias.push(nm);put("estudio");closeSheet();toast("Materia creada")}},
  sfTema(fd,f){const v=String(fd.get("t")||"").trim();if(!v)return;m.temas=m.temas||[];m.temas.push({id:uid(),t:v,ok:false});put("estudio");drawSheet();const i=$("#te-n");if(i)i.focus()}}});
}
function sesionSheet(mid){
 if(!D.estudio.materias.length){toast("Primero agregá una materia.");materiaSheet();return}
 openSheet({title:"Registrar estudio",html:()=>'<form class="form" id="sfSes"><div class="field"><label for="se-m">Materia</label><select id="se-m" name="materia">'+D.estudio.materias.map(m=>'<option value="'+m.id+'"'+(m.id===mid?" selected":"")+">"+esc(m.nombre)+"</option>").join("")+'</select></div><div class="frow"><div class="field"><label for="se-min">Minutos</label><input type="number" id="se-min" name="min" min="1" required inputmode="numeric" autofocus></div><div class="field"><label for="se-f">Fecha</label><input type="date" id="se-f" name="fecha" value="'+today()+'"></div></div><div class="field"><label for="se-n">Qué estudiaste (opcional)</label><input id="se-n" name="nota" maxlength="120"></div><div class="sheet-actions"><span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>',
 forms:{sfSes(fd){const min=+fd.get("min");if(!(min>0))return;D.estudio.sesiones.push({id:uid(),fecha:fd.get("fecha")||today(),materiaId:fd.get("materia"),min,nota:String(fd.get("nota")||"").trim(),origen:"manual"});put("estudio");if(mid&&SH&&SH.prev){const p=SH.prev;SH=null;materiaSheet(p);toast("Estudio registrado: "+fmtMin(min));return}closeSheet();toast("Estudio registrado: "+fmtMin(min))}}});
 if(mid&&SH)SH.prev=mid;
}
function examenSheet(mid){
 if(!D.estudio.materias.length){toast("Primero agregá una materia.");materiaSheet();return}
 openSheet({title:"Nuevo examen o entrega",html:()=>'<form class="form" id="sfEx" autocomplete="off"><div class="field"><label for="ex-m">Materia</label><select id="ex-m" name="materia">'+D.estudio.materias.map(m=>'<option value="'+m.id+'"'+(m.id===mid?" selected":"")+">"+esc(m.nombre)+"</option>").join("")+'</select></div><div class="field"><label for="ex-t">Qué es</label><input id="ex-t" name="titulo" required maxlength="80" placeholder="Ej.: Primer parcial, Final, TP 2" autofocus></div><div class="field"><label for="ex-f">Fecha</label><input type="date" id="ex-f" name="fecha" required value="'+addDays(today(),7)+'"></div><div class="chips"><label><input type="checkbox" name="rec" value="1" checked><span>Recordarme el día anterior a las 20:00</span></label></div><div class="sheet-actions"><span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>',
 forms:{sfEx(fd){const o={id:uid(),materiaId:fd.get("materia"),titulo:String(fd.get("titulo")).trim(),fecha:fd.get("fecha")};if(!o.titulo||!o.fecha)return;D.estudio.examenes.push(o);put("estudio");
  if(fd.get("rec")){const at=addDays(o.fecha,-1)+"T20:00";if(new Date(at)>new Date()){D.rec.push({id:uid(),titulo:"Mañana: "+o.titulo+" de "+((materia(o.materiaId)||{}).nombre||""),at,rep:"no",hecho:false,avisado:false,examenId:o.id});put("rec")}}
  if(mid){SH=null;materiaSheet(mid)}else closeSheet();toast("Fecha guardada")}}});
}

/* ================= RECORDATORIOS ================= */
const REP={no:"Una vez",diario:"Todos los días",semanal:"Todas las semanas",mensual:"Todos los meses"};
function nextOcc(at,rep){const d=new Date(at),now=Date.now();let i=0;do{if(rep==="diario")d.setDate(d.getDate()+1);else if(rep==="semanal")d.setDate(d.getDate()+7);else d.setMonth(d.getMonth()+1);i++}while(d.getTime()<=now&&i<5000);return localDT(d)}
function remRow(r){const d=r.at.slice(0,10),late=r.avisado&&!r.hecho;return '<li class="task'+(r.hecho?" done":"")+'">'+(r.rep==="no"?'<button class="chk" data-act="rDone" data-id="'+r.id+'" aria-label="'+(r.hecho?"Marcar pendiente":"Listo")+'">'+ico("check",3)+"</button>":'<span class="chk" style="border-style:dashed;cursor:default" aria-hidden="true"></span>')+'<button class="task-main" data-act="rEdit" data-id="'+r.id+'"><span class="task-t">'+esc(r.titulo)+'</span><span class="task-m"><span class="'+(late?"late-t":"")+'">'+cap(fmtDay(d))+" "+r.at.slice(11,16)+"</span>"+(r.rep!=="no"?"<span>"+REP[r.rep]+"</span>":"")+"</span></button></li>"}
function notifCard(){
 let s,b="";
 if(!canNotify())s="Este navegador no permite notificaciones. Los avisos aparecen dentro de la app cuando está abierta.";
 else if(Notification.permission==="granted"&&D.cfg.notif){s="Notificaciones activadas.";b='<button class="btn" data-act="rTest">Probar aviso</button><button class="btn" data-act="rOff">Desactivar</button>'}
 else if(Notification.permission==="denied")s="Bloqueaste las notificaciones para esta app. Podés habilitarlas en los ajustes del navegador o del teléfono.";
 else{s="Activá las notificaciones para recibir recordatorios, fin del temporizador y tareas con hora.";b='<button class="btn mod" data-act="rPerm">Activar notificaciones</button>'}
 return card("recordatorios","Notificaciones","",'<p class="small" style="margin:0">'+s+'</p><p class="small muted" style="margin:8px 0 0">Los avisos llegan con la app abierta o en segundo plano reciente. Si el teléfono la cierra por completo, el aviso aparece al volver a abrirla.</p>',b);
}
function renderRecordatorios(){
 const now=D.rec.filter(r=>!r.hecho&&r.avisado).sort((a,b)=>a.at.localeCompare(b.at));
 const prox=D.rec.filter(r=>!r.hecho&&!r.avisado).sort((a,b)=>a.at.localeCompare(b.at));
 const done=D.rec.filter(r=>r.hecho).sort((a,b)=>b.at.localeCompare(a.at)).slice(0,15);
 const def=new Date(Date.now()+3600e3);def.setMinutes(0,0,0);
 let h=vhead("Recordatorios",prox.length+(prox.length===1?" programado":" programados"),'<button class="btn primary" data-act="rNew">'+ico("plus")+" Nuevo</button>");
 h+='<div class="board two"><div class="stack">';
 h+='<div class="card" style="--mc:var(--m-recordatorios)"><form id="rqForm" class="quick" autocomplete="off"><input id="rqTitle" name="titulo" placeholder="Recordarme…" aria-label="Recordatorio" maxlength="140"><input type="datetime-local" id="rqAt" name="at" value="'+localDT(def)+'" aria-label="Fecha y hora"><button class="btn mod">Agregar</button></form></div>';
 if(now.length)h+=card("recordatorios","Para atender ahora",now.length+"",'<ul class="list">'+now.map(remRow).join("")+"</ul>");
 h+=card("recordatorios","Próximos","",prox.length?'<ul class="list">'+prox.map(remRow).join("")+"</ul>":'<p class="empty">No tenés recordatorios programados.</p>');
 if(done.length)h+=card("recordatorios","Hechos","",'<ul class="list">'+done.map(remRow).join("")+"</ul>",delBtn("remHechos","","Borrar hechos"));
 h+='</div><div class="stack">'+notifCard()+"</div></div>";
 $("#v-recordatorios").innerHTML=h;
}
function remSheet(id){
 const r=id?D.rec.find(x=>x.id===id):(()=>{const d=new Date(Date.now()+3600e3);d.setMinutes(0,0,0);return {titulo:"",at:localDT(d),rep:"no"}})();if(!r)return;
 openSheet({title:id?"Editar recordatorio":"Nuevo recordatorio",html:()=>'<form class="form" id="sfRem" autocomplete="off"><div class="field"><label for="re-t">Recordarme</label><input id="re-t" name="titulo" required maxlength="140" value="'+esc(r.titulo)+'" autofocus></div><div class="frow"><div class="field"><label for="re-d">Fecha</label><input type="date" id="re-d" name="d" required value="'+r.at.slice(0,10)+'"></div><div class="field"><label for="re-h">Hora</label><input type="time" id="re-h" name="h" required value="'+r.at.slice(11,16)+'"></div></div><div class="field"><span class="flabel">Repetir</span><div class="chips">'+Object.entries(REP).map(([k,l])=>'<label><input type="radio" name="rep" value="'+k+'"'+(r.rep===k?" checked":"")+"><span>"+l+"</span></label>").join("")+'</div></div>'+gcField("rec",r,!id)+'<div class="sheet-actions">'+(id?delBtn("rec",id):"")+'<span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>',
 forms:{sfRem(fd){const o={titulo:String(fd.get("titulo")).trim(),at:fd.get("d")+"T"+fd.get("h"),rep:fd.get("rep")||"no"};if(!o.titulo||!fd.get("d")||!fd.get("h"))return;o.avisado=new Date(o.at).getTime()<=Date.now()&&o.rep==="no"?(id?r.avisado:false):false;
  let nid=id;if(id)Object.assign(r,o,{hecho:false});else{nid=uid();D.rec.push(Object.assign({id:nid,hecho:false},o))}put("rec");closeSheet();checkRem();toast("Recordatorio guardado");gcAfterSave("rec",nid,fd,!id);if(D.cfg.notif===false&&canNotify()&&Notification.permission==="default")setTimeout(()=>toast("Tip: activá las notificaciones en Recordatorios para recibir el aviso."),4200)}}});
}
function checkRem(){
 const now=Date.now();let ch=false,chT=false;
 D.rec.forEach(r=>{if(r.hecho||r.avisado&&r.rep==="no")return;const t=new Date(r.at).getTime();if(!(t<=now))return;
  if(now-t<12*3600e3)notify(r.titulo,"Recordatorio · "+r.at.slice(11,16),"rem-"+r.id);
  if(r.rep==="no")r.avisado=true;else r.at=nextOcc(r.at,r.rep);ch=true});
 D.tareas.forEach(x=>{if(x.done||x.avisado||!x.due||!x.time)return;const t=new Date(x.due+"T"+x.time).getTime();if(t<=now){if(now-t<12*3600e3)notify("Tarea: "+x.title,"Programada para las "+x.time,"task-"+x.id);x.avisado=true;chT=true}});
 let chP=false;if(new Date().getHours()>=9){const t=today();D.pagos.avisos=D.pagos.avisos||{};pendientes().forEach(p=>{if(p.fecha>t)return;const key=p.kind+":"+p.id+":"+p.fecha;if(D.pagos.avisos[key])return;D.pagos.avisos[key]=1;chP=true;if(p.fecha===t)notify("Hoy vence: "+p.desc,money(p.monto),"pago-"+p.id)})}
 if(chP)put("pagos");
 if(ch)put("rec");if(chT)put("tareas");if(ch||chT||chP)safeRender();
 try{cierreCheck()}catch(e){}
}

/* ================= MÁS y AJUSTES ================= */
function renderMas(){
 const t=today();
 const items=[["enfoque","Enfoque",fmtMin(focusMin(t))+" hoy"],["entreno","Entrenos",D.gym.logs.filter(l=>l.fecha>=weekStart(t)).length+" esta semana"],["estudio","Estudio",nextExams().length?nextExams().length+" exámenes próximos":fmtMin(studyMin(weekStart(t),t))+" esta semana"],["recordatorios","Recordatorios",D.rec.filter(r=>!r.hecho).length+" activos"],["ajustes","Ajustes","Tema, metas y copia de seguridad"]];
 $("#v-mas").innerHTML=vhead("Más")+'<div class="tiles">'+items.map(([k,l,s])=>'<button class="tile" data-go="'+k+'" style="--mc:var(--m-'+k+')">'+ico(k)+"<b>"+l+"</b><span>"+esc(s)+"</span></button>").join("")+"</div>";
}
function applyTheme(){document.documentElement.removeAttribute("data-theme");const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#000000")}
function renderAjustes(){
 const c=D.cfg;
 const SY=window.CorchoSync;let h=vhead("Ajustes",SY&&SY.user?"Tus datos se sincronizan con tu cuenta de Google":"Corcho App guarda todo en este dispositivo");
 h+='<div class="board">';
 h+=syncCard();h+=gcCard();h+=cierreCard();
 h+=card("ajustes","Perfil","",'<div class="field"><label for="a-nombre">Tu nombre</label><input id="a-nombre" data-cfg="nombre" value="'+esc(c.nombre)+'" placeholder="Para el saludo de Hoy" maxlength="40"></div>');
 h+=card("ajustes","Metas semanales","",'<div class="frow"><div class="field"><label for="a-me">Entrenos por semana</label><input type="number" id="a-me" data-cfg="metaEntrenos" data-n="1" min="1" max="14" value="'+c.metaEntrenos+'"></div><div class="field"><label for="a-ms">Horas de estudio</label><input type="number" id="a-ms" data-cfg="metaEstudio" data-n="1" min="0" max="80" value="'+c.metaEstudio+'"></div></div>');
 h+=notifCard();
 h+=card("ajustes","Copia de seguridad","",'<p class="small" style="margin:0">Tus datos viven solo en este navegador. Si lo borrás o cambiás de teléfono, se pierden. Descargá una copia cada tanto y restaurala donde quieras. También sirve para pasar los datos de tu Libro de Caja.</p>','<button class="btn" data-act="aExport">Descargar copia</button><label class="btn" for="aImport">Restaurar copia</label><input type="file" id="aImport" accept="application/json,.json" hidden>');
 h+=card("ajustes","Borrar datos","",'<p class="small muted" style="margin:0">Elimina tareas, hábitos, entrenos, estudio, finanzas y recordatorios de este dispositivo. No se puede deshacer.</p>',delBtn("todo","","Borrar todo",' data-ask="Tocá de nuevo: se borra todo"'));
 h+="</div>";
 $("#v-ajustes").innerHTML=h;
}
function exportAll(){
 const data={app:"corcho",version:1,fecha:new Date().toISOString(),datos:{}};
 try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.indexOf("corcho:")===0)data.datos[k]=JSON.parse(localStorage.getItem(k))}}catch(e){toast("No se pudo leer el almacenamiento del navegador.");return}
 const blob=new Blob([JSON.stringify(data,null,1)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="corcho-copia-"+today()+".json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);toast("Copia descargada");
}
function importAll(file){
 const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d||!d.datos)throw 0;let n=0;
  Object.keys(d.datos).forEach(k=>{let key=null;if(k.indexOf("corcho:")===0)key=k;else if(k==="ldc:config")key="corcho:fin:config";else if(k.indexOf("ldc:mes:")===0)key="corcho:fin:mes:"+k.slice(8);if(key){localStorage.setItem(key,JSON.stringify(d.datos[k]));window.CorchoSync&&window.CorchoSync.touch(key);n++}});
  if(!n)throw 0;toast("Copia restaurada. Recargando…");const go2=()=>setTimeout(()=>location.reload(),600);(window.CorchoSync&&window.CorchoSync.user?window.CorchoSync.syncNow():Promise.resolve()).then(go2,go2)}catch(e){toast("Ese archivo no es una copia válida de Corcho App.")}};r.readAsText(file);
}

/* ================= componentes compartidos (rediseño) ================= */
const CH={};let chN=0;
function chartSlot(fn,h,cls){const id="c"+(++chN);CH[id]=fn;return '<div class="chart-slot'+(cls?" "+cls:"")+'" data-chart="'+id+'" style="height:'+h+'px"></div>'}
function drawCharts(root){(root||document).querySelectorAll("[data-chart]").forEach(el=>{const fn=CH[el.dataset.chart];if(!fn)return;const w=el.clientWidth||el.parentElement.clientWidth||300;el.innerHTML=fn(Math.max(120,w),el.clientHeight||120)})}
function ring(p,size){size=size||46;const r=(size-6)/2,c=2*Math.PI*r,v=Math.max(0,Math.min(1,p||0));return '<span class="ring-mini" style="width:'+size+'px;height:'+size+'px" role="img" aria-label="'+Math.round(v*100)+'% completado"><svg viewBox="0 0 '+size+" "+size+'" aria-hidden="true"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" class="rm-t"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" class="rm-p" stroke-dasharray="'+c.toFixed(2)+'" stroke-dashoffset="'+(c*(1-v)).toFixed(2)+'"/></svg><b>'+Math.round(v*100)+"%</b></span>"}
const kfmt=v=>{const a=Math.abs(v);return (v<0?"−":"")+(a>=1e6?(a/1e6).toFixed(1).replace(".",",")+"M":a>=1e3?Math.round(a/1e3)+"k":Math.round(a))};
function lineSvg(vals,W,H,o){o=o||{};const n=vals.length;if(!n)return "";const pl=o.pl||2,pr=o.pr||2,pt=o.pt||6,pb=o.labels?22:(o.pb||4);let mn=Math.min(...vals),mx=Math.max(...vals);if(mx===mn){mx+=1;mn-=1}const X=i=>pl+(W-pl-pr)*(n===1?.5:i/(n-1)),Y=v=>pt+(H-pt-pb)*(1-(v-mn)/(mx-mn));
 const d="M"+vals.map((v,i)=>X(i).toFixed(1)+" "+Y(v).toFixed(1)).join("L");
 let s='<svg class="lsvg '+(o.cls||"")+'" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+" "+H+'" role="img" aria-label="'+esc(o.aria||"Gráfico")+'">';
 if(o.area)s+='<path class="ls-area" d="'+d+"L"+X(n-1).toFixed(1)+" "+(H-pb)+"L"+X(0).toFixed(1)+" "+(H-pb)+'Z"/>';
 if(o.labels)s+='<line class="ls-base" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+(H-pb)+'" y2="'+(H-pb)+'"/>';
 s+='<path class="ls-line" d="'+d+'"/>';
 if(o.dot)s+='<circle class="ls-dot" cx="'+X(n-1).toFixed(1)+'" cy="'+Y(vals[n-1]).toFixed(1)+'" r="3.5"/>';
 if(o.labels)o.labels.forEach((l,i)=>{if(l)s+='<text class="ls-lab" x="'+X(i).toFixed(1)+'" y="'+(H-6)+'" text-anchor="'+(i===0?"start":i===n-1?"end":"middle")+'">'+esc(l)+"</text>"});
 return s+"</svg>";
}
function miniCal(k,o){
 const [y,m]=k.split("-").map(Number);const first=k+"-01";const start=addDays(first,-((wd(first)+6)%7));const t=today();
 let h='<div class="mcal"><div class="mcal-h"><button class="iconbtn sm" data-act="'+o.nav+'" data-v="-1" aria-label="Mes anterior">‹</button><b>'+cap(MESES[m-1])+" "+y+'</b><button class="iconbtn sm" data-act="'+o.nav+'" data-v="1" aria-label="Mes siguiente">›</button></div><div class="mcal-g">'+["L","M","X","J","V","S","D"].map(d=>'<span class="mcal-wd">'+d+"</span>").join("");
 for(let i=0;i<42;i++){const d=addDays(start,i);if(i>=35&&d.slice(0,7)!==k)break;const mk=o.marks&&o.marks[d];h+='<button class="mcal-d'+(d.slice(0,7)!==k?" other":"")+(d===t?" today":"")+(d===o.sel?" sel":"")+(mk?" mark":"")+'" data-act="'+o.act+'" data-v="'+d+'"'+(mk&&o.title?' title="'+esc(o.title(d,mk))+'"':"")+' aria-label="'+longDate(d)+(mk?", con "+(typeof mk==="number"?mk:"")+" "+(o.what||"elementos"):"")+'">'+parseISO(d).getDate()+"</button>"}
 return h+"</div></div>";
}
function addMonths(iso,n){const d=parseISO(iso);const day=d.getDate();const t=new Date(d.getFullYear(),d.getMonth()+n,1);t.setDate(Math.min(day,new Date(t.getFullYear(),t.getMonth()+1,0).getDate()));return isoOf(t)}
const FIN=()=>window.CorchoFin||null;
const money=n=>{const f=FIN();try{return f?f.fmt(n):"$ "+Math.round(n||0).toLocaleString("es-AR")}catch(e){return String(Math.round(n||0))}};
function finSerie(items,sa,k,last){const net={};(items||[]).forEach(it=>{const d=+String(it.fecha).slice(8,10);net[d]=(net[d]||0)+(it.tipo==="ingreso"?it.monto:-it.monto)});const out=[];let b=sa||0;for(let d=1;d<=last;d++){b+=net[d]||0;out.push(b)}return out}
let rzT;window.addEventListener("resize",()=>{clearTimeout(rzT);rzT=setTimeout(()=>{if(!SH)safeRender();if(view==="finanzas")renderFinDash()},250)});

/* ================= HOY (panel) ================= */
const FRASES=["Un día más para avanzar, aunque sea un paso.","Lo que hacés hoy suma para lo que querés mañana.","Constancia antes que intensidad.","Hacé primero lo importante.","Pequeños hábitos, grandes cambios.","Terminá el día un poco mejor de como lo empezaste.","Enfocate en lo que depende de vos.","Lo simple, bien hecho, alcanza.","Ordená el día y el día te ordena a vos."];
function dcard(cls,icon,title,sub,right,body,foot){return '<article class="card dcard '+(cls||"")+'"><header class="dc-head"><div class="dc-t"><h2>'+(icon?ico(icon):"")+title+"</h2>"+(sub?'<span class="small muted">'+sub+"</span>":"")+"</div>"+(right||"")+"</header>"+body+(foot?'<footer class="dc-foot">'+foot+"</footer>":"")+"</article>"}
const HY_MARK='<svg viewBox="84 104 344 288" aria-hidden="true"><path d="M196 150V310A46 46 0 0 1 104 310" fill="none" stroke="#F4F4F5" stroke-width="40" stroke-linecap="round"/><path d="M353.6 337.0A70 70 0 1 1 353.6 247.0" fill="none" stroke="#F4F4F5" stroke-width="40" stroke-linecap="round"/><path d="M352 124H398L374 154Q404 152 406 178Q406 206 378 206Q360 206 352 196" fill="none" stroke="#E2B84A" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FLAME='<svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M12 3c.5 3.2 4.5 5.2 4.5 9.6A4.6 4.6 0 0 1 12 17.3a4.6 4.6 0 0 1-4.5-4.7c0-2.2 1.3-3.6 2.3-4.6.2 1.6.9 2.6 1.9 3.1C11.4 8.5 11.3 5.6 12 3z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/></svg>';
function hyName(){if(D.cfg.nombre)return D.cfg.nombre;const S=window.CorchoSync;const n=S&&S.user&&S.user.displayName;return n?String(n).split(" ")[0]:""}
/* Un solo consejo, el más importante del momento. */
function hyTip(c){
 const t=c.t,pl=(n,a,b)=>n+" "+(n===1?a:b);
 if(cierreActivo()){const e=cierreEstado();if(e.faltan||!e.gas)return {go:e.faltan?"habitos":"finanzas",txt:"<b>Cierre del día.</b> "+esc(cierreTxt(e))}}
 const venc=c.pp.filter(p=>p.fecha<t),pronto=c.pp.filter(p=>p.fecha>=t&&p.fecha<=addDays(t,1));
 if(venc.length)return {go:"pagos",txt:"Tenés "+pl(venc.length,"pago vencido","pagos vencidos")+": <b>"+esc(venc[0].desc)+"</b>. Resolvelo hoy y sacátelo de la cabeza."};
 if(pronto.length)return {go:"pagos",txt:"<b>"+esc(pronto[0].desc)+"</b> vence "+(pronto[0].fecha===t?"hoy":"mañana")+" ("+money(pronto[0].monto)+")."+(pronto.length>1?" Y "+pl(pronto.length-1,"pago más","pagos más")+".":"")};
 const late=c.pend.filter(x=>x.due<t);
 if(late.length)return {go:"tareas",txt:"Tenés "+pl(late.length,"tarea atrasada","tareas atrasadas")+". Atacá primero <b>"+esc(late[0].title)+"</b> y el resto fluye."};
 const urg=c.pend.filter(x=>x.prio==1);
 if(urg.length)return {go:"tareas",txt:"Tenés "+pl(urg.length,"urgente","urgentes")+" sin resolver: <b>"+esc(urg[0].title)+"</b>. Atacala primero y el resto fluye."};
 let fs=null;try{const f=FIN();fs=f&&f.summary()}catch(e){}
 if(fs&&fs.crit&&fs.top)return {go:"finanzas",txt:esc(fs.top)+". Revisá tus gastos antes de seguir."};
 const nx=c.gev.find(e=>!e.ad&&e.time>c.hm);
 if(nx)return {go:"tareas",txt:"Lo próximo en tu agenda: <b>"+esc(nx.title)+"</b> a las "+nx.time+"."};
 if(c.hdi&&c.hdi.pct<1&&new Date().getHours()>=17){const f=c.hdi.n-c.hdi.full;return {go:"habitos",txt:"Te "+(f===1?"falta 1 hábito":"faltan "+f+" hábitos")+" para cerrar el día perfecto."+(c.ps?" Venís con una racha de "+pl(c.ps,"día","días")+".":"")}}
 if(c.tot&&!c.pend.length)return {go:"tareas",txt:"Terminaste todo lo de hoy. Bien ahí: el resto del día es tuyo."};
 if(c.pend.length)return {go:"tareas",txt:"Tenés "+pl(c.pend.length,"tarea","tareas")+" para hoy. Empezá por <b>"+esc(c.pend[0].title)+"</b>."};
 return {go:"tareas",txt:FRASES[c.doy%FRASES.length]};
}
const hyGo=g=>g==="pagos"?'data-act="goPagos"':'data-go="'+g+'"';
function hyKpi(go,label,big,sub,side,p,cls){return '<button class="hy-k'+(cls?" "+cls:"")+'" '+hyGo(go)+' style="--p:'+(p==null?0:Math.max(0,Math.min(1,p))*100).toFixed(1)+'%"><span class="hy-k-l">'+label+'</span><b class="num">'+big+'</b><span class="hy-k-s">'+sub+"</span>"+(side?'<span class="hy-k-x">'+side+"</span>":"")+"</button>"}
function renderHoy(){
 const t=today(),d=parseISO(t),doy=Math.floor((d-new Date(d.getFullYear(),0,0))/864e5),tm=addDays(t,1),now=new Date(),hm=pad2(now.getHours())+":"+pad2(now.getMinutes());
 const pend=D.tareas.filter(x=>!x.done&&x.due&&x.due<=t).sort(taskSort);
 const doneT=D.tareas.filter(x=>x.done&&x.doneAt===t&&(!x.due||x.due<=t));
 const tot=pend.length+doneT.length;
 const hs=D.habitos.filter(h=>(h.creado||t)<=t&&isDue(h,t));const hdi=dayInfo(t);
 const rs=D.rec.filter(r=>!r.hecho&&r.at.slice(0,10)<=t).sort((a,b)=>a.at.localeCompare(b.at));
 const pp=pendientes().filter(p=>p.fecha<=addDays(t,30));
 const gm=gcMap([t,tm]),gev=gm[t]||[],gevT=gm[tm]||[];
 const ps=D.habitos.length?perfectStreak():0;
 const nm=hyName();
 let h='<header class="hy-head"><span class="eyebrow">'+cap(DIAS[d.getDay()])+", "+d.getDate()+" de "+MESES[d.getMonth()]+"</span><h1>"+greet()+(nm?", "+esc(nm):"")+"</h1></header>";
 const SY=window.CorchoSync;let later=null;try{later=localStorage.getItem("corcho-sync-later")}catch(e){}
 if(SY&&SY.available&&SY.ready&&!SY.user&&SY.state!=="sin-conexion"&&later!==t)h+='<div class="sync-banner"><div><b>Sincronizá tus datos</b><span class="small muted">Iniciá sesión con Google para ver lo mismo en el teléfono y en la computadora.</span></div><div class="vact"><button class="btn" data-act="syncLater">Ahora no</button><button class="btn primary" data-act="syncIn">'+GOOGLE_G+' Iniciar sesión</button></div></div>';
 // copiloto
 const tip=hyTip({t,pend,tot,pp,gev,hm,hdi,ps,doy});
 h+='<button class="hy-pilot" '+hyGo(tip.go)+'><span class="hy-mark">'+HY_MARK+'</span><span class="hy-pilot-t"><span class="eyebrow">Corcho · tu copiloto</span><span>'+tip.txt+"</span></span></button>";
 // cuatro indicadores
 const avg=avgPct(7);
 let k="";
 k+=hyKpi("habitos","Hábitos",hdi?pctTxt(hdi.pct):"—",hdi?hdi.full+" de "+hdi.n+" hoy":D.habitos.length?"Nada programado hoy":"Elegí tus hábitos",ps?'<span class="hy-streak">'+FLAME+" "+ps+(ps===1?" día":" días")+"</span>":avg!=null&&hdi?"prom. 7 días "+pctTxt(avg):"",hdi?hdi.pct:0);
 const late=pend.filter(x=>x.due<t).length;
 k+=hyKpi("tareas","Tareas",tot?pctTxt(doneT.length/tot):"—",tot?doneT.length+" de "+tot+" hechas":"Nada para hoy",late?'<span class="neg">'+late+(late===1?" atrasada":" atrasadas")+"</span>":"",tot?doneT.length/tot:0);
 const f=FIN();let fd=null;try{fd=f&&f.data()}catch(e){}
 if(fd){const sh=typeof shortMoney==="function"?shortMoney(fd.disp).replace(" M$"," M").replace(" k$"," k").replace(/ \$$/,""):money(fd.disp);const ap=fd.ing>0?Math.round((fd.ing-fd.gas)/fd.ing*100):null;
  k+=hyKpi("finanzas","Balance",(fd.disp<0?"":"$")+sh,"Gastos "+money(fd.gas),ap!=null?'<span class="'+(ap>=0?"pos":"neg")+'">'+(ap>=0?"ahorrás "+ap+"%":"en rojo")+"</span>":"",fd.ing>0?Math.min(1,fd.gas/fd.ing):0,fd.disp<0?"neg-v":"")}
 const p7=pp.filter(p=>p.fecha<=addDays(t,7)),nx=pp[0];
 k+=hyKpi("pagos","Por pagar",p7.length?money(p7.reduce((s,p)=>s+(+p.monto||0),0)):"$ 0",p7.length?"en los próximos 7 días":"Nada en 7 días",nx?'<span class="'+(nx.fecha<t?"neg":"")+'">'+esc(nx.desc)+" · "+(nx.fecha<t?"vencido":nx.fecha===t?"hoy":nx.fecha===tm?"mañana":"en "+Math.round((parseISO(nx.fecha)-d)/864e5)+" días")+"</span>":"",null,"no-bar");
 h+='<div class="hy-kpis">'+k+"</div>";
 // HOY
 const rec=rs.length?'<div class="group-h">Recordatorios</div><ul class="list">'+rs.slice(0,4).map(remRow).join("")+"</ul>":"";
 const ag=gev.length?'<div class="group-h gc-h">Agenda'+gcStatus()+'</div><ul class="list gc-list">'+gev.slice(0,5).map(gcRow).join("")+"</ul>"+(gev.length>5?'<button class="linkbtn small" data-go="tareas">+'+(gev.length-5)+" eventos más</button>":""):"";
 const tl=pend.concat(doneT);
 const tasks=tl.length?(ag||rec?'<div class="group-h">Tareas</div>':"")+'<ul class="list">'+tl.slice(0,8).map(taskRow).join("")+"</ul>"+(tl.length>8?'<button class="linkbtn small" data-go="tareas">+'+(tl.length-8)+" tareas más</button>":""):"";
 let hoy='<article class="card hy-day"><header class="hy-day-h"><span class="eyebrow">Hoy · '+d.getDate()+" "+MC[d.getMonth()]+'</span><span class="num muted">'+(tot?doneT.length+"/"+tot:"")+'</span></header><div class="hy-line" style="--p:'+(tot?doneT.length/tot*100:0).toFixed(1)+'%"></div>';
 hoy+=ag+tasks+rec;
 if(!tl.length&&!ag&&!rec)hoy+='<p class="empty">Nada pendiente para hoy.</p>';
 hoy+='<form id="hyQ" class="hy-q" autocomplete="off"><span aria-hidden="true">+</span><input id="hyQt" name="title" maxlength="200" placeholder="Tarea rápida para hoy…" aria-label="Tarea rápida para hoy"></form>';
 hoy+='<footer class="hy-foot"><button class="linkbtn" data-act="rNew">+ Recordatorio</button><span class="grow"></span><button class="linkbtn" data-go="tareas">Ver todo →</button></footer></article>';
 // MAÑANA
 const tT=D.tareas.filter(x=>!x.done&&x.due===tm).sort(taskSort),rT=D.rec.filter(r=>!r.hecho&&r.at.slice(0,10)===tm).sort((a,b)=>a.at.localeCompare(b.at)),pT=pp.filter(p=>p.fecha===tm);
 const md=parseISO(tm);
 let man='<article class="card hy-day hy-tm"><header class="hy-day-h"><span class="eyebrow">Mañana · '+md.getDate()+" "+MC[md.getMonth()]+'</span><span class="num muted">'+(tT.length+gevT.length+rT.length+pT.length||"")+"</span></header>";
 const items=gevT.map(gcRow).concat(rT.map(remRow),tT.map(taskRow),pT.map(p=>'<li class="hy-pay"><button data-act="goPagos"><span class="hy-pay-i">$</span><span><b>Vence '+esc(p.desc)+'</b></span><span class="num neg">−'+money(p.monto)+"</span></button></li>"));
 man+=items.length?'<ul class="list">'+items.join("")+"</ul>":'<p class="empty">Nada planeado para mañana.</p>';
 man+='<footer class="hy-foot"><button class="linkbtn" data-act="hyTm">+ Tarea para mañana</button></footer></article>';
 // hábitos de hoy
 const hab=dcard("d-habitos","habitos","Hábitos de hoy",hs.length?(hdi?hdi.full:0)+" de "+hs.length:"Sin hábitos hoy",hdi?ring(hdi.pct):"",
  hs.length?'<div class="hchips">'+hs.map(x=>{const c=hCnt(x,t),m=x.meta||1,ok=c>=m;return '<button class="hchip '+(ok?"on":c?"part":"")+'" data-act="hTap" data-id="'+x.id+'" style="--hc:var(--ink)"><i>'+(ok?ico("check",2.6):m>1?c+"/"+m:"")+"</i><span>"+hName(x)+"</span></button>"}).join("")+"</div>":'<p class="empty">'+(D.habitos.length?"Hoy no tenés hábitos programados.":"Todavía no elegiste hábitos.")+"</p>",
  '<span class="grow"></span><button class="linkbtn" data-go="habitos">'+(D.habitos.length?"Ver hábitos →":"Elegir hábitos →")+"</button>");
 // pagos
 const pag=dcard("d-pagos","pagos","Próximos pagos",pp.length?pp.length+" en los próximos 30 días":"Sin vencimientos cerca",pp.length?'<b class="num neg dc-sum">−'+money(pp.reduce((s,p)=>s+(+p.monto||0),0))+"</b>":"",
  pp.length?'<div class="plist">'+pp.slice(0,4).map(p=>'<div class="prow"><div><b>'+esc(p.desc)+'</b><span class="small '+(p.fecha<t?"neg":"muted")+'">'+(p.fecha<t?"Vencido · ":"Vence ")+fmtDay(p.fecha).toLowerCase()+'</span></div><span class="num neg">−'+money(p.monto)+"</span></div>").join("")+"</div>":'<p class="empty">Cargá tus cuentas a pagar y tarjetas para ver los vencimientos acá.</p>',
  '<button class="linkbtn" data-act="pNuevo">+ Nuevo pago</button><span class="grow"></span><button class="linkbtn" data-act="goPagos">Ver por pagar →</button>');
 h+='<div class="hy-grid"><div class="hy-col">'+hoy+man+'</div><div class="hy-col">'+hab+pag+"</div></div>";
 $("#v-hoy").innerHTML=h;drawCharts($("#v-hoy"));gcEnsure([t.slice(0,7),tm.slice(0,7)]);
}

/* ================= HÁBITOS (semanas, barras y mapa) ================= */
function renderHabitos(){
 const t=today(),curK=t.slice(0,7),k=hMes&&hMes<curK?hMes:curK,n=monthDays(k);
 const [yy,mm]=k.split("-").map(Number);const mesTxt=cap(MESES[mm-1])+" "+yy;
 const keep={g:($("#v-habitos .hg-scroll")||{}).scrollLeft,k:($("#v-habitos [data-mes]")||{dataset:{}}).dataset.mes};
 let h=vhead("Hábitos","Tus hábitos y tu constancia del mes",'<button class="btn" data-act="hCat">Elegir hábitos</button><button class="btn primary" data-act="hNew">'+ico("plus")+" Añadir hábito</button>");
 if(!D.habitos.length){
  h+=card("habitos","Tu tracker de hábitos","",'<p class="empty">Elegí tus hábitos de una lista o creá los tuyos. Cada día los tildás en la grilla del mes y ves tu porcentaje diario, semanal y mensual.</p><div class="sugs">'+["💊 Tomar vitaminas","📚 Leer 20 minutos","💪 Gimnasio","😴 Dormir antes de las 23:00","🧘 Meditar 10 minutos","💧 Tomar 2 litros de agua"].map(x=>'<button data-act="hQuick" data-v="'+esc(x)+'">+ '+esc(x)+"</button>").join("")+"</div>",'<button class="btn primary" data-act="hCat">Ver todos los hábitos sugeridos</button>');
  $("#v-habitos").innerHTML=h;return;
 }
 const days=[];for(let d=1;d<=n;d++){const s=k+"-"+pad2(d);const di=s<=t?dayInfo(s):null;days.push({d,s,fut:s>t,today:s===t,wk:Math.floor((d-1)/7),di,v:di?Math.round(di.pct*100):null})}
 const weeks=[];days.forEach(x=>{(weeks[x.wk]=weeks[x.wk]||[]).push(x)});
 const wstat=weeks.map(w=>{let ok=0,due=0;w.forEach(x=>{if(x.fut)return;D.habitos.forEach(hb=>{if(x.s<(hb.creado||x.s)||!isDue(hb,x.s))return;due++;if(hOk(hb,x.s))ok++})});return {ok,due,p:due?ok/due:0}});
 let mOk=0,mDue=0;wstat.forEach(w=>{mOk+=w.ok;mDue+=w.due});
 const pv=days.filter(x=>x.v!=null).map(x=>x.v);const avg=pv.length?Math.round(pv.reduce((a,b)=>a+b,0)/pv.length):null;const perfect=pv.filter(v=>v>=100).length;
 const ti=k===curK?dayInfo(t):null;
 // fila superior: resumen + mapa del mes
 h+='<div class="hab-top" data-mes="'+k+'"><article class="card hab-sum"><div class="hm-bar"><div class="day-nav"><button class="iconbtn" data-act="hMes" data-v="-1" aria-label="Mes anterior">‹</button><span class="dlabel">'+mesTxt+"<small>"+(k===curK?"Mes actual":"Mes anterior")+'</small></span><button class="iconbtn" data-act="hMes" data-v="1" aria-label="Mes siguiente"'+(k>=curK?" disabled":"")+">›</button></div>"+(ti?ring(ti.pct,58):"")+"</div>"+
  '<div class="hm-stats"><div class="stat"><span class="eyebrow">Hoy</span><span class="v">'+(ti?ti.full+" / "+ti.n:"—")+'</span></div><div class="stat"><span class="eyebrow">Promedio diario</span><span class="v">'+(avg==null?"—":avg+"%")+'</span></div><div class="stat"><span class="eyebrow">Mes</span><span class="v">'+mOk+" / "+mDue+'</span></div><div class="stat"><span class="eyebrow">Días al 100%</span><span class="v">'+perfect+"</span></div></div>"+
  '<div class="tr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+(mDue?Math.round(mOk/mDue*100):0)+'" aria-label="Cumplimiento del mes"><i style="width:'+(mDue?mOk/mDue*100:0).toFixed(1)+'%"></i></div><p class="small muted" style="margin:8px 0 0">'+(ti?"Hoy: "+trackerMsg(ti.pct):"Cumplimiento del mes: "+(mDue?Math.round(mOk/mDue*100):0)+"%")+"</p></article>";
 // mapa de calor del mes (por día de la semana)
 const first=k+"-01",off=(wd(first)+6)%7;let hm='<div class="heatmap">'+["L","M","X","J","V","S","D"].map(x=>'<span class="hm-wd">'+x+"</span>").join("");for(let i=0;i<off;i++)hm+='<span class="hm-c empty"></span>';
 days.forEach(x=>{hm+='<span class="hm-c'+(x.fut?" fut":"")+(x.today?" today":"")+'" style="--p:'+(x.v==null?0:x.v)+'%" title="'+x.d+": "+(x.v==null?"sin datos":x.v+"%")+'"></span>'});
 h+='<article class="card hab-map"><header class="card-head"><h2>Mapa del mes</h2><span class="small muted">más claro, más cumplido</span></header>'+hm+'</div><div class="hm-legend"><span>0%</span><i style="--p:15%"></i><i style="--p:40%"></i><i style="--p:70%"></i><i style="--p:100%"></i><span>100%</span></div></article></div>';
 // grilla
 let g='<table class="hgrid2"><thead><tr class="hg-w"><th class="hg-name" rowspan="2" scope="col">Diarios</th>'+weeks.map((w,i)=>'<th colspan="'+w.length+'" class="wk-s'+(w.some(x=>x.today)?" cur":"")+'" scope="colgroup">Sem '+(i+1)+"</th>").join("")+'<th class="hg-tot" rowspan="2" scope="col">Total</th></tr>';
 g+='<tr class="hg-dn">'+days.map(x=>'<th scope="col" class="'+(x.d%7===1?"wk-s ":"")+(x.today?"is-today":"")+'"><span class="hg-wd">'+DL[wd(x.s)]+"</span><span>"+x.d+"</span></th>").join("")+"</tr>";
 g+='<tr class="hg-bars"><th class="hg-name"><span class="small muted">% por día</span></th>'+days.map(x=>'<td class="'+(x.d%7===1?"wk-s":"")+'">'+(x.v!=null?'<i style="height:'+Math.max(x.v?6:2,x.v)+'%" title="'+x.d+": "+x.v+'%"></i>':"")+"</td>").join("")+"<td></td></tr>";
 g+='<tr class="hg-ws"><th class="hg-name"></th>'+weeks.map((w,i)=>{const st=wstat[i];return '<td colspan="'+w.length+'" class="wk-s"><div class="ws"><span class="num">'+st.ok+"/"+st.due+'</span><b class="num">'+Math.round(st.p*100)+'%</b></div><div class="ws-bar"><i style="width:'+(st.p*100).toFixed(1)+'%"></i></div></td>'}).join("")+"<td></td></tr></thead><tbody>";
 D.habitos.forEach(hb=>{
  const st=habMonthStats(hb,k,t);
  g+='<tr><th class="hg-name" scope="row"><button class="hg-hab" data-act="hOpen" data-id="'+hb.id+'"><span class="hg-t">'+hName(hb)+'</span><span class="hg-m num">'+st.ok+" / "+st.due+'<span class="hg-fq"> · '+freqTxt(hb)+"</span></span></button></th>";
  days.forEach(x=>{const ws=x.d%7===1?"wk-s":"";
   if(x.fut){g+='<td class="'+ws+'"><span class="hg-f" aria-hidden="true"></span></td>';return}
   if(!isDue(hb,x.s)){g+='<td class="off '+ws+'"><span aria-hidden="true">·</span></td>';return}
   const c=hCnt(hb,x.s),m=hb.meta||1,ok=c>=m,pre=x.s<(hb.creado||x.s);
   g+='<td class="'+ws+'"><button class="hg-c'+(ok?" on":c?" part":"")+(pre?" pre":"")+(x.today?" now":"")+'" data-act="hCell" data-id="'+hb.id+'" data-v="'+x.s+'" aria-pressed="'+ok+'" aria-label="'+esc(hb.nombre)+", "+longDate(x.s)+(ok?": cumplido":"")+'">'+(ok?ico("check",3.2):c?c:"")+"</button></td>"});
  g+='<td class="hg-tot num">'+st.ok+"</td></tr>";
 });
 g+='<tr class="hg-add"><th class="hg-name"><button class="linkbtn" data-act="hNew">+ Añadir hábito</button></th><td colspan="'+(n+1)+'"></td></tr></tbody></table>';
 h+='<article class="card hg-card"><div class="hg-scroll">'+g+'</div><p class="small muted hg-note">Tocá un casillero para marcarlo. Los puntos son días libres según la frecuencia de cada hábito. Tocá el nombre para editarlo.</p></article>';
 $("#v-habitos").innerHTML=h;
 const gs=$("#v-habitos .hg-scroll");
 if(keep.k===k&&keep.g!=null)gs.scrollLeft=keep.g;
 else{const th=gs.querySelector("th.is-today");if(th)gs.scrollLeft=Math.max(0,th.offsetLeft-gs.clientWidth+120)}
}

/* ================= TAREAS (calendario) ================= */
let tV=null,tD=null,tMini=null,tPanel="sinfecha";
function tView(){return tV||(window.matchMedia("(max-width:760px)").matches?"dia":"semana")}
function chipT(x){return '<div class="tchip'+(x.done?" done":"")+(x.prio==1?" p1":"")+'"><button class="tchip-c" data-act="tToggle" data-id="'+x.id+'" aria-label="'+(x.done?"Marcar pendiente":"Completar")+": "+esc(x.title)+'">'+(x.done?ico("check",3.4):"")+'</button><button class="tchip-t" data-act="tEdit" data-id="'+x.id+'">'+(x.time?'<span class="num">'+x.time+"</span> ":"")+esc(x.title)+"</button></div>"}
function renderTareas(){
 const v=tView(),t=today(),sel=tD||t;
 const seg='<div class="seg" role="tablist" aria-label="Vista">'+[["lista","Lista"],["dia","Día"],["semana","Semana"],["mes","Mes"]].map(([k,l])=>'<button role="tab" data-act="tVista" data-v="'+k+'" aria-selected="'+(v===k)+'">'+l+"</button>").join("")+"</div>";
 if(v==="lista"){renderTareasLista();const a=$("#v-tareas .vact");if(a)a.insertAdjacentHTML("afterbegin",seg);return}
 const keep={top:($("#v-tareas .tg-scroll")||{}).scrollTop,left:($("#v-tareas .tg-scroll")||{}).scrollLeft,v:($("#v-tareas [data-tv]")||{dataset:{}}).dataset.tv};
 const pendN=D.tareas.filter(x=>!x.done).length;
 let h=vhead("Tareas",pendN+(pendN===1?" pendiente":" pendientes"),seg+'<button class="btn primary" data-act="tNew">'+ico("plus")+" Nueva tarea</button>");
 // rango
 let days=[],label="";
 if(v==="dia"){days=[sel];label=cap(longDate(sel))}
 else if(v==="semana"){const ws=weekStart(sel);days=Array.from({length:7},(_,i)=>addDays(ws,i));const a=parseISO(days[0]),b=parseISO(days[6]);label=a.getDate()+" "+MC[a.getMonth()]+" – "+b.getDate()+" "+MC[b.getMonth()]+" "+b.getFullYear()}
 else{const d=parseISO(sel);label=cap(MESES[d.getMonth()])+" "+d.getFullYear()}
 const tool='<div class="tc-tool"><div class="day-nav"><button class="iconbtn" data-act="tNav" data-v="-1" aria-label="Anterior">‹</button><button class="btn sm" data-act="tNav" data-v="0">Hoy</button><button class="iconbtn" data-act="tNav" data-v="1" aria-label="Siguiente">›</button></div><b class="tc-label">'+label+"</b>"+gcStatus()+"</div>";
 let cal="";
 if(v==="mes")cal=tMonthHTML(sel.slice(0,7));
 else{
  const by={};D.tareas.forEach(x=>{if(x.due&&days.includes(x.due))(by[x.due]=by[x.due]||[]).push(x)});
  const gm=gcMap(days);
  const now=new Date();
  cal='<div class="tg-scroll" data-tv="'+v+'"><div class="tg" style="--cols:'+days.length+'"><div class="tg-corner"></div>'+days.map(d=>'<button class="tg-dh'+(d===t?" today":"")+'" data-act="tPick" data-v="'+d+'"><span>'+DC[wd(d)]+"</span><b>"+parseISO(d).getDate()+"</b></button>").join("");
  cal+='<div class="tg-time tg-ad">Sin hora</div>'+days.map(d=>'<div class="tg-cell tg-allday" data-act="tSlot" data-v="'+d+'">'+(gm[d]||[]).filter(e=>e.ad).map(e=>gcChip(e,d)).join("")+(by[d]||[]).filter(x=>!x.time).sort(taskSort).map(chipT).join("")+"</div>").join("");
  for(let hr=0;hr<24;hr++){cal+='<div class="tg-time" data-h="'+hr+'">'+pad2(hr)+":00</div>"+days.map(d=>{const it=(by[d]||[]).filter(x=>x.time&&+x.time.slice(0,2)===hr).sort(taskSort);const nl=d===t&&now.getHours()===hr?'<i class="tg-now" style="top:'+(now.getMinutes()/60*100).toFixed(1)+'%" aria-hidden="true"></i>':"";const ge=(gm[d]||[]).filter(e=>!e.ad&&e.date===d&&+e.time.slice(0,2)===hr);return '<div class="tg-cell" data-act="tSlot" data-v="'+d+'" data-h="'+pad2(hr)+':00">'+nl+ge.map(e=>gcChip(e,d)).join("")+it.map(chipT).join("")+"</div>"}).join("")}
  cal+="</div></div>";
 }
 // panel lateral
 const sinF=D.tareas.filter(x=>!x.done&&!x.due),late=D.tareas.filter(x=>!x.done&&x.due&&x.due<t).sort(taskSort);
 const marks={};D.tareas.forEach(x=>{if(!x.done&&x.due)marks[x.due]=(marks[x.due]||0)+1});
 {const mk=(tMini||sel.slice(0,7)),f0=mk+"-01",dl=Array.from({length:monthDays(mk)},(_,i)=>addDays(f0,i)),gmm=gcMap(dl);Object.keys(gmm).forEach(d=>{marks[d]=(marks[d]||0)+gmm[d].length})}
 const list=tPanel==="atrasadas"?late:sinF;
 let side=miniCal(tMini||sel.slice(0,7),{act:"tPick",nav:"tMiniNav",sel,marks,what:"tareas"});
 side+='<div class="seg tp-seg"><button data-act="tPanel" data-v="sinfecha" aria-selected="'+(tPanel!=="atrasadas")+'">Sin fecha · '+sinF.length+'</button><button data-act="tPanel" data-v="atrasadas" aria-selected="'+(tPanel==="atrasadas")+'">Atrasadas · '+late.length+"</button></div>";
 side+='<form id="tqSF" class="quick tp-add" autocomplete="off"><input id="tqSFt" name="title" placeholder="Añadir tarea…" aria-label="Añadir tarea sin fecha" maxlength="200"></form>';
 side+=list.length?'<ul class="list tp-list">'+list.slice(0,30).map(taskRow).join("")+"</ul>":'<p class="empty">'+(tPanel==="atrasadas"?"No tenés tareas atrasadas.":"No hay tareas sin fecha.")+"</p>";
 h+='<div class="tcal"><div class="card tc-main">'+tool+cal+'</div><aside class="card tc-side">'+side+"</aside></div>";
 $("#v-tareas").innerHTML=h;
 gcEnsure(gcMonthsNow().concat([(tMini||sel.slice(0,7))]));
 const sc=$("#v-tareas .tg-scroll");
 if(sc){const hd0=sc.querySelector(".tg-dh");if(hd0)sc.style.setProperty("--hdh",hd0.offsetHeight+"px");if(keep.v===v&&keep.top!=null){sc.scrollTop=keep.top;sc.scrollLeft=keep.left||0}else{const hr=days.includes(t)?Math.max(0,new Date().getHours()-1):7;const r=sc.querySelector('.tg-time[data-h="'+hr+'"]');const hd=sc.querySelector(".tg-dh");if(r)sc.scrollTop=r.offsetTop-(hd?hd.offsetHeight:0)}}
}
function tMonthHTML(k){
 const first=k+"-01",start=addDays(first,-((wd(first)+6)%7)),t=today();
 const by={};D.tareas.forEach(x=>{if(x.due)(by[x.due]=by[x.due]||[]).push(x)});
 const cells=[];for(let i=0;i<42;i++)cells.push(addDays(start,i));const gm=gcMap(cells);
 let h='<div class="tm"><div class="tm-g">'+["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].map(d=>'<span class="tm-wd">'+d+"</span>").join("");
 for(let i=0;i<42;i++){const d=addDays(start,i);if(i>=35&&d.slice(0,7)!==k)break;const L=(by[d]||[]).sort(taskSort),G=gm[d]||[],nT=L.length+G.length,shown=G.slice(0,3).map(e=>'<span class="tm-t tm-g" style="--gc:'+esc(e.color)+'">'+(e.ad?"":e.time+" ")+esc(e.title)+"</span>").concat(L.slice(0,Math.max(0,3-G.length)).map(x=>'<span class="tm-t'+(x.done?" done":"")+'">'+(x.time?x.time+" ":"")+esc(x.title)+"</span>"));
  h+='<button class="tm-cell'+(d.slice(0,7)!==k?" other":"")+(d===t?" today":"")+'" data-act="tPickDay" data-v="'+d+'" aria-label="'+longDate(d)+(L.length?", "+L.length+" tareas":"")+(G.length?", "+G.length+" eventos":"")+'"><span class="tm-d">'+parseISO(d).getDate()+"</span>"+shown.join("")+(nT>3?'<span class="tm-more">+'+(nT-3)+" más</span>":"")+"</button>"}
 return h+"</div></div>";
}

/* ================= GOOGLE CALENDAR ================= */
/* Por dispositivo (no se sincroniza): permiso de una hora, calendarios elegidos y copia de los eventos.
   En las tareas, recordatorios y pagos se guarda x.gcal={id,cal} para no duplicar el evento en otro dispositivo. */
const GCK="corcho-gcal";
let gc=(()=>{try{return JSON.parse(localStorage.getItem(GCK)||"{}")||{}}catch(e){return {}}})();
gc.cache=gc.cache||{};gc.queue=gc.queue||[];gc.def=gc.def||{};
const gcSave=()=>{try{localStorage.setItem(GCK,JSON.stringify(gc))}catch(e){}};
const gcOn=()=>!!gc.on;
const gcTokOk=()=>!!gc.tok&&gc.exp>Date.now()+60e3;
const gcBusy={};let gcErrShown=0;
const GC_IC='<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="none" stroke="currentColor" stroke-width="1.9"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="15" r="2.2" fill="#4285F4"/></svg>';
const encC=encodeURIComponent;
function gcErrTxt(e){const m=String(e&&e.message||e||"");
 if(e&&e.code==="login")return "Primero iniciá sesión con Google en Ajustes › Sincronización.";
 if(/has not been used|is disabled|accessNotConfigured/i.test(m))return "Falta habilitar la API de Google Calendar en tu proyecto de Firebase (paso 1 de la guía).";
 if(/insufficient|scope/i.test(m))return "Google no dio permiso para el calendario. Volvé a conectar y marcá las casillas de Calendar.";
 if(/popup-closed|cancelled-popup/i.test(m)||(e&&/popup-closed|cancelled-popup/.test(e.code||"")))return "Cerraste la ventana de Google antes de terminar.";
 if(/popup-blocked/.test(e&&e.code||""))return "El navegador bloqueó la ventana de Google. Permití las ventanas emergentes y probá de nuevo.";
 if(/user-mismatch/.test(e&&e.code||""))return "Elegí la misma cuenta de Google con la que sincronizás Corcho.";
 if(navigator.onLine===false||/network|Failed to fetch/i.test(m))return "No hay conexión a internet.";
 return "Google Calendar: "+m}
function gcFail(e){if(e&&e.code==="token"){render();return}gc.err=gcErrTxt(e);gcSave();if(Date.now()-gcErrShown>8000){gcErrShown=Date.now();toast(gc.err)}}
/* Pide permiso. Tiene que llamarse directo desde un toque (abre la ventana de Google). */
function gcAuth(){const S=window.CorchoSync;
 if(!S||!S.user||!S.gcalAuth)return Promise.reject({code:"login"});
 return S.gcalAuth().then(tok=>{gc.on=true;gc.tok=tok;gc.exp=Date.now()+55*60e3;gc.err=null;gc.email=S.user.email||"";gcSave();return tok})}
async function gcApi(path,opt){
 if(!gcTokOk())throw {code:"token"};
 opt=opt||{};const h={Authorization:"Bearer "+gc.tok};if(opt.body)h["Content-Type"]="application/json";
 const r=await fetch("https://www.googleapis.com/calendar/v3/"+path,{method:opt.method||"GET",headers:h,body:opt.body});
 if(r.status===401){gc.tok=null;gc.exp=0;gcSave();throw {code:"token"}}
 if(r.status===204)return null;
 const j=await r.json().catch(()=>null);
 if(!r.ok){const er=new Error(j&&j.error&&j.error.message||("HTTP "+r.status));er.code=r.status;throw er}
 return j}
async function gcLoadCals(){
 const j=await gcApi("users/me/calendarList?maxResults=250");const old={};(gc.cals||[]).forEach(c=>old[c.id]=c.on);
 gc.cals=(j.items||[]).filter(c=>!c.deleted).map(c=>({id:c.id,name:c.summaryOverride||c.summary||c.id,color:c.backgroundColor||"#8E8E96",primary:!!c.primary,w:c.accessRole==="owner"||c.accessRole==="writer",on:c.id in old?old[c.id]:(!!c.primary||c.selected===true)}))
  .sort((a,b)=>(b.primary-a.primary)||a.name.localeCompare(b.name));
 if(!gc.wcal||!gc.cals.some(c=>c.id===gc.wcal&&c.w)){const p=gc.cals.find(c=>c.primary);gc.wcal=p?p.id:"primary"}
 gcSave()}
function gcNorm(e,c){const ad=!!(e.start&&e.start.date);let date,time="",end="",last;
 if(ad){date=e.start.date;last=e.end&&e.end.date?addDays(e.end.date,-1):date;if(last<date)last=date}
 else{const s=new Date(e.start.dateTime),f=new Date(e.end&&e.end.dateTime||e.start.dateTime);date=isoOf(s);last=date;time=pad2(s.getHours())+":"+pad2(s.getMinutes());end=pad2(f.getHours())+":"+pad2(f.getMinutes());if(isoOf(f)!==date)end+=" ("+fmtDay(isoOf(f)).toLowerCase()+")"}
 return {id:e.id,cal:c.id,calName:c.name,color:c.color,title:e.summary||"(Sin título)",date,last,time,end,ad,loc:e.location||"",desc:String(e.description||"").replace(/<br\s*\/?>/gi,"\n").replace(/<[^>]+>/g,"").slice(0,600),link:e.htmlLink||""}}
async function gcFetchMonth(k){
 if(!gc.cals)await gcLoadCals();
 const [y,m]=k.split("-").map(Number);const a=new Date(y,m-1,1),b=new Date(y,m,1);const ev=[];
 await Promise.all(gc.cals.filter(c=>c.on).map(async c=>{let pt="";do{
  const j=await gcApi("calendars/"+encC(c.id)+"/events?singleEvents=true&orderBy=startTime&maxResults=250&timeMin="+encC(a.toISOString())+"&timeMax="+encC(b.toISOString())+(pt?"&pageToken="+encC(pt):""));
  (j.items||[]).forEach(e=>{if(e.status==="cancelled")return;const pv=e.extendedProperties&&e.extendedProperties.private;if(pv&&pv.corcho)return;ev.push(gcNorm(e,c))});pt=j.nextPageToken}while(pt)}));
 gc.cache[k]={ts:Date.now(),ev};
 const ks=Object.keys(gc.cache).sort((p,q)=>gc.cache[q].ts-gc.cache[p].ts);ks.slice(8).forEach(x=>delete gc.cache[x]);
 gc.err=null;gc.last=Date.now();gcSave()}
/* Trae los meses que hagan falta (si hay permiso vigente) y vuelve a dibujar. */
function gcEnsure(months,force){
 if(!gcOn()||!gcTokOk())return;
 const need=[...new Set(months)].filter(k=>!gcBusy[k]&&(force||!gc.cache[k]||Date.now()-gc.cache[k].ts>10*60e3));
 if(!need.length)return;
 need.forEach(k=>gcBusy[k]=1);
 gcFlushQueue();
 Promise.all(need.map(k=>gcFetchMonth(k))).then(()=>{need.forEach(k=>delete gcBusy[k]);if(!SH&&(view==="hoy"||view==="tareas"||view==="ajustes"))safeRender()},e=>{need.forEach(k=>delete gcBusy[k]);gcFail(e)})}
function gcMap(days){const by={};if(!gcOn())return by;const set=new Set(days);const seen={};
 [...new Set(days.map(d=>d.slice(0,7)))].forEach(k=>{const c=gc.cache[k];if(!c)return;c.ev.forEach(e=>{let d=e.date<days[0]?days[0]:e.date;for(let i=0;i<62&&d<=e.last;i++,d=addDays(d,1)){if(!set.has(d))continue;const key=e.id+"|"+d;if(seen[key])continue;seen[key]=1;(by[d]=by[d]||[]).push(e)}})});
 Object.values(by).forEach(L=>L.sort((a,b)=>(a.ad?"":a.time||"").localeCompare(b.ad?"":b.time||"")));return by}
function gcMonthsNow(){const t=today();if(view!=="tareas")return [t.slice(0,7)];const s=tD||t,w=weekStart(s);return [s.slice(0,7),w.slice(0,7),addDays(w,6).slice(0,7),t.slice(0,7)]}
function gcFind(id){for(const k in gc.cache){const e=gc.cache[k].ev.find(x=>x.id===id);if(e)return e}return null}
function gcStatus(){if(!gcOn())return "";const busy=Object.keys(gcBusy).length;
 if(busy)return '<span class="gc-st small muted">'+GC_IC+" Actualizando…</span>";
 if(!gcTokOk())return '<button class="gc-st btn sm" data-act="gcRefresh" title="Traer los cambios de Google Calendar">'+GC_IC+" Actualizar</button>";
 return '<button class="gc-st linkbtn small" data-act="gcRefresh" title="Volver a traer los eventos">'+GC_IC+" Al día</button>"}
function gcChip(e,d){const tm=e.ad?"":e.time;return '<button class="gchip" data-act="gcEv" data-id="'+esc(e.id)+'" style="--gc:'+esc(e.color)+'" title="'+esc(e.calName)+'">'+(tm?'<span class="num">'+tm+"</span> ":"")+esc(e.title)+"</button>"}
function gcRow(e){return '<li class="gc-row"><button data-act="gcEv" data-id="'+esc(e.id)+'" style="--gc:'+esc(e.color)+'"><i aria-hidden="true"></i><span class="num">'+(e.ad?"Todo el día":e.time)+"</span><b>"+esc(e.title)+"</b></button></li>"}
function gcEvSheet(id){const e=gcFind(id);if(!e)return;
 const when=e.ad?(e.last!==e.date?cap(longDate(e.date))+" al "+longDate(e.last):cap(longDate(e.date))+" · todo el día"):cap(longDate(e.date))+" · "+e.time+" a "+e.end;
 openSheet({title:e.title,html:()=>'<div class="gc-det"><p class="gc-when">'+esc(when)+'</p><p class="small"><span class="gc-dot" style="--gc:'+esc(e.color)+'"></span>'+esc(e.calName)+"</p>"+(e.loc?'<p class="small"><span class="muted">Lugar:</span> '+esc(e.loc)+"</p>":"")+(e.desc?'<p class="small gc-desc">'+esc(e.desc)+"</p>":"")+'<p class="small muted">Este evento es de tu Google Calendar. Para cambiarlo, abrilo ahí.</p><div class="sheet-actions"><button type="button" class="btn" data-act="gcToTask" data-id="'+esc(e.id)+'">Crear tarea con esto</button><span class="grow"></span>'+(e.link?'<a class="btn primary" href="'+esc(e.link)+'" target="_blank" rel="noopener">Abrir en Google Calendar</a>':"")+"</div></div>"})}
/* ---- enviar a Google Calendar ---- */
const GC_KIND={tarea:{list:()=>D.tareas,key:"tareas"},rec:{list:()=>D.rec,key:"rec"},pago:{list:()=>D.pagos.items,key:"pagos"}};
const gcItem=(kind,id)=>GC_KIND[kind].list().find(x=>x.id===id);
function localISO(d){return isoOf(d)+"T"+pad2(d.getHours())+":"+pad2(d.getMinutes())+":00"}
function gcBody(kind,x){
 const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"America/Argentina/Buenos_Aires";
 const b={extendedProperties:{private:{corcho:kind}}};
 const timed=(s,min)=>{const e=new Date(s.getTime()+min*60e3);b.start={dateTime:localISO(s),timeZone:tz};b.end={dateTime:localISO(e),timeZone:tz}};
 const allDay=d=>{b.start={date:d};b.end={date:addDays(d,1)}};
 if(kind==="tarea"){if(!x.due)return null;b.summary=(x.done?"✓ ":"")+x.title;b.description=(x.notes?x.notes+"\n\n":"")+"Tarea de Corcho App";if(x.time)timed(new Date(x.due+"T"+x.time),30);else allDay(x.due);b.reminders={useDefault:!!x.time}}
 else if(kind==="rec"){b.summary=x.titulo;b.description="Recordatorio de Corcho App";timed(new Date(x.at),15);b.reminders={useDefault:false,overrides:[{method:"popup",minutes:0}]};const R={diario:"DAILY",semanal:"WEEKLY",mensual:"MONTHLY"}[x.rep];if(R)b.recurrence=["RRULE:FREQ="+R]}
 else if(kind==="pago"){if(x.pagado||!x.fecha)return null;b.summary="Vence: "+x.desc+((+x.monto||0)>0?" · "+money(x.monto):"");b.description="Pago de Corcho App"+(x.forma==="mensual"?" (todos los meses)":"");allDay(x.fecha);b.reminders={useDefault:false,overrides:[{method:"popup",minutes:15*60}]}}
 return b}
/* want=true: crear o actualizar el evento. want=false: borrarlo. */
async function gcPush(kind,id,want){
 const x=gcItem(kind,id);if(!x)return;
 if(!gcTokOk()){gcQueue({kind,id,want});return}
 try{
  const body=want?gcBody(kind,x):null;
  if(!body){if(x.gcal){await gcApi("calendars/"+encC(x.gcal.cal)+"/events/"+encC(x.gcal.id),{method:"DELETE"}).catch(e=>{if(e.code!==404&&e.code!==410)throw e});const y=gcItem(kind,id);if(y){delete y.gcal;put(GC_KIND[kind].key)}}return}
  if(x.gcal){try{await gcApi("calendars/"+encC(x.gcal.cal)+"/events/"+encC(x.gcal.id),{method:"PUT",body:JSON.stringify(body)});return}catch(e){if(e.code!==404&&e.code!==410)throw e}}
  const cal=gc.wcal||"primary";const j=await gcApi("calendars/"+encC(cal)+"/events",{method:"POST",body:JSON.stringify(body)});
  const y=gcItem(kind,id);if(y){y.gcal={id:j.id,cal};put(GC_KIND[kind].key)}
  toast("También quedó en Google Calendar")
 }catch(e){if(e&&e.code==="token")gcQueue({kind,id,want});else gcFail(e)}}
function gcQueue(q){gc.queue=gc.queue.filter(o=>!(o.kind===q.kind&&o.id===q.id));gc.queue.push(q);gcSave()}
function gcFlushQueue(){cierreGcLimpiar();if(!gcTokOk()||!gc.queue.length)return;const Q=gc.queue.slice();gc.queue=[];gcSave();
 Q.forEach(q=>{if(q.del)gcApi("calendars/"+encC(q.cal)+"/events/"+encC(q.ev),{method:"DELETE"}).catch(e=>{if(e&&e.code==="token")gcQueue(q)});else gcPush(q.kind,q.id,q.want)})}
/* Al borrar un elemento de Corcho, borra también su evento. */
function gcForget(x){if(!x||!x.gcal)return;const q={del:true,cal:x.gcal.cal,ev:x.gcal.id,kind:"del",id:x.gcal.id};
 if(gcTokOk())gcApi("calendars/"+encC(q.cal)+"/events/"+encC(q.ev),{method:"DELETE"}).catch(e=>{if(e&&e.code==="token")gcQueue(q)});else gcQueue(q)}
/* Casilla dentro de los formularios. */
function gcField(kind,x,isNew,note){if(!gcOn())return "";const on=x.gcal?true:isNew?!!gc.def[kind]:false;
 return '<label class="gc-opt"><input type="checkbox" name="gcal" value="1"'+(on?" checked":"")+"><span>"+GC_IC+" También en Google Calendar"+(note?'<small class="muted">'+note+"</small>":"")+"</span></label>"}
/* Se llama desde el guardado del formulario (es un toque: puede pedir permiso). */
function gcAfterSave(kind,id,fd,isNew){if(!gcOn())return;const want=!!fd.get("gcal");const x=gcItem(kind,id);if(!x)return;
 if(isNew){gc.def[kind]=want;gcSave()}
 if(!want&&!x.gcal)return;
 if(gcTokOk()){gcPush(kind,id,want);return}
 if(!want){gcPush(kind,id,false);return}
 gcAuth().then(()=>{gcPush(kind,id,true);gcFlushQueue()},e=>{gcQueue({kind,id,want:true});gcFail(e)})}
/* Si cambia algo desde otro lado (completar, pagar), actualiza el evento sin pedir permiso. */
function gcTouch(kind,id){const x=gcItem(kind,id);if(x&&x.gcal&&gcOn())gcPush(kind,id,true)}
function gcCard(){const S=window.CorchoSync;
 let body,foot="";
 if(!S||!S.available||!S.user){body='<p class="small" style="margin:0">Para conectar tu Google Calendar, primero iniciá sesión con Google en <b>Sincronización</b>, acá arriba.</p>'}
 else if(!gcOn()){body='<p class="small" style="margin:0">Mirá tus eventos de Google Calendar dentro del calendario de Tareas y en Hoy, y mandá tareas, recordatorios y vencimientos a tu calendario con un toque.</p>';foot='<button class="btn primary" data-act="gcConnect">'+GOOGLE_G+" Conectar Google Calendar</button>"}
 else{
  body='<div class="sync-row"><span class="sync-dot" data-st="'+(gcTokOk()?"ok":"desconectado")+'"></span><b>'+(gcTokOk()?"Conectado":"Conectado · en pausa")+"</b></div>";
  body+='<p class="small" style="margin:6px 0 0">'+(gcTokOk()?"Tus eventos se actualizan solos durante la próxima hora.":"Por seguridad, Google da permiso por una hora. Tocá <b>Actualizar</b> para traer los cambios (se abre y se cierra una ventana de Google).")+"</p>";
  if(gc.last)body+='<p class="small muted" style="margin:4px 0 0">Última actualización: '+new Date(gc.last).toLocaleString("es-AR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+"</p>";
  if(gc.queue.length)body+='<p class="small" style="margin:4px 0 0">'+gc.queue.length+(gc.queue.length===1?" cambio espera":" cambios esperan")+" para mandarse a Google Calendar.</p>";
  if(gc.cals&&gc.cals.length){body+='<div class="field" style="margin-top:12px"><span class="flabel">Calendarios que se muestran</span><div class="gc-cals">'+gc.cals.map(c=>'<label class="gc-cal"><input type="checkbox" data-gccal="'+esc(c.id)+'"'+(c.on?" checked":"")+'><span class="gc-dot" style="--gc:'+esc(c.color)+'"></span><span>'+esc(c.name)+"</span></label>").join("")+"</div></div>";
   const W=gc.cals.filter(c=>c.w);if(W.length>1)body+='<div class="field"><label for="gc-w">Lo que mandes desde Corcho va a</label><select id="gc-w">'+W.map(c=>'<option value="'+esc(c.id)+'"'+(c.id===gc.wcal?" selected":"")+">"+esc(c.name)+"</option>").join("")+"</select></div>"}
  if(gc.err)body+='<p class="small neg" style="margin:8px 0 0">'+esc(gc.err)+"</p>";
  foot='<button class="btn'+(gcTokOk()?"":" primary")+'" data-act="gcRefresh">Actualizar</button><button class="btn" data-act="gcOff">Desconectar</button>';
 }
 return card("ajustes","Google Calendar","",body,foot)}


/* ================= CIERRE DEL DÍA ================= */
/* D.cfg.cierre={on,hora,gcal:{id,cal},pend}. El aviso dentro de la app se marca por dispositivo. */
const CIERRE_K="corcho-cierre-last";
const cierreCfg=()=>{const c=D.cfg.cierre||(D.cfg.cierre={on:false,hora:"21:30"});if(!c.hora)c.hora="21:30";return c};
function cierreEstado(){const t=today(),di=dayInfo(t);let gas=0;try{const f=FIN(),d=f&&f.data();if(d&&d.key===t.slice(0,7))gas=(d.items||[]).filter(it=>it.fecha===t&&it.tipo!=="ingreso").length}catch(e){}
 return {faltan:di?di.n-di.full:0,gas}}
function cierreTxt(e){const a=[];if(e.faltan)a.push("te "+(e.faltan===1?"falta 1 hábito":"faltan "+e.faltan+" hábitos"));a.push(e.gas?"revisá que estén todos los gastos de hoy ("+e.gas+" cargados)":"todavía no anotaste gastos de hoy");const s=a.join(" y ");return s.charAt(0).toUpperCase()+s.slice(1)+"."}
const cierreActivo=()=>{const c=cierreCfg();if(!c.on)return false;const n=new Date();return pad2(n.getHours())+":"+pad2(n.getMinutes())>=c.hora};
function cierreCheck(){const c=cierreCfg();if(!c.on||!cierreActivo())return;const t=today();let last=null;try{last=localStorage.getItem(CIERRE_K)}catch(e){}if(last===t)return;
 try{localStorage.setItem(CIERRE_K,t)}catch(e){}const e=cierreEstado();notify("Cierre del día",cierreTxt(e),"cierre-"+t)}
/* Al abrir la app: renueva el registro del aviso y borra el evento viejo de Calendar. */
const cierreRenovar=()=>{try{cierreGcLimpiar();const c=D.cfg.cierre;if(c&&c.on&&pushOk()&&Notification.permission==="granted")pushSetup(false).catch(()=>{})}catch(e){}};setTimeout(cierreRenovar,6000);setTimeout(cierreRenovar,20000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)cierreRenovar()});
/* ---- Aviso push: lo manda el servidor de avisos (GitHub Actions) aunque la app esté cerrada ---- */
const VAPID_PUB="BOHmN3CcJ6A1jyqmkL3cv1kU4siwH2T0-qnXVDscjR3U0rMyXt_cXZFfxZbqz9K9Irm6S4RcFp83R-E1NlC0jX8";
const pushOk=()=>"serviceWorker" in navigator&&"PushManager" in window&&canNotify();
const devId=()=>{let d=null;try{d=localStorage.getItem("corcho-dev-id");if(!d){d=uid()+uid();localStorage.setItem("corcho-dev-id",d)}}catch(e){d="x"}return d};
const pushKey=()=>"corcho:push:"+devId();
const pushSaved=()=>{try{return !!localStorage.getItem(pushKey())}catch(e){return false}};
function b64u(s){const p="=".repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,"+").replace(/_/g,"/"));return Uint8Array.from(b,c=>c.charCodeAt(0))}
/* Registra este dispositivo para recibir el aviso. ask=true solo desde un toque (puede pedir permiso). */
async function pushSetup(ask){
 if(!pushOk())return "nosup";
 if(Notification.permission!=="granted"){if(!ask||Notification.permission==="denied")return "perm";const p=await Notification.requestPermission();if(p!=="granted")return "perm"}
 if(!D.cfg.notif){D.cfg.notif=true;put("cfg")}
 const S=window.CorchoSync;if(!S||!S.user)return "login";
 const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
 if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(VAPID_PUB)});
 const j=sub.toJSON(),tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"America/Argentina/Buenos_Aires",k=pushKey();
 let old=null;try{old=JSON.parse(localStorage.getItem(k)||"null")}catch(e){}
 if(!old||old.sub.endpoint!==j.endpoint||old.tz!==tz){try{localStorage.setItem(k,JSON.stringify({sub:j,tz,disp:/Android|iPhone|iPad/i.test(navigator.userAgent)?"teléfono":"computadora",ts:Date.now()}))}catch(e){}S.touch(k)}
 return "ok"}
/* Antes el aviso se creaba como evento de Google Calendar: si quedó uno, lo borra. */
function cierreGcLimpiar(){const c=D.cfg.cierre;if(!c||!c.gcal||!gcTokOk())return;const g=c.gcal;
 gcApi("calendars/"+encC(g.cal)+"/events/"+encC(g.id),{method:"DELETE"}).then(()=>{delete c.gcal;delete c.pend;put("cfg")},e=>{if(e&&(e.code===404||e.code===410)){delete c.gcal;delete c.pend;put("cfg")}})}
function cierreCard(){const c=cierreCfg();const S=window.CorchoSync;const perm=canNotify()?Notification.permission:"no";
 let body='<p class="small" style="margin:0 0 12px">Corcho te manda un aviso al final del día para que anotes tus hábitos y los gastos de hoy, aunque la app esté cerrada.</p>';
 body+='<label class="gc-opt"><input type="checkbox" data-cierre="on"'+(c.on?" checked":"")+'><span>Avisarme todos los días</span></label>';
 let foot="";
 if(c.on){
  body+='<div class="field" style="margin-top:12px"><label for="ci-h">Hora del aviso</label><input type="time" id="ci-h" data-cierre="hora" value="'+esc(c.hora)+'"></div>';
  let st,ok=false;
  if(!pushOk())st="Este navegador no recibe avisos con la app cerrada. En iPhone, primero instalá Corcho en la pantalla de inicio.";
  else if(perm==="denied")st="Bloqueaste las notificaciones de Corcho. Habilitalas en los ajustes del teléfono (Apps › Chrome o Corcho › Notificaciones) y volvé a tildar la casilla.";
  else if(!S||!S.user)st="Iniciá sesión con Google en <b>Sincronización</b> (acá arriba) para que el aviso te llegue con la app cerrada.";
  else if(perm!=="granted"||!pushSaved())st="Falta activar los avisos en este dispositivo.";
  else{ok=true;st="Te llega todos los días a las <b>"+esc(c.hora)+"</b> en este "+(/Android|iPhone|iPad/i.test(navigator.userAgent)?"teléfono":"dispositivo")+", aunque Corcho esté cerrada. Puede demorar unos minutos."}
  body+='<div class="sync-row small ci-st"><span class="sync-dot" data-st="'+(ok?"ok":"desconectado")+'"></span><span>'+st+"</span></div>";
  if(!ok&&pushOk()&&perm!=="denied"&&S&&S.user)foot+='<button class="btn primary" data-act="cierrePush">Activar avisos</button>';
  if(ok)foot+='<button class="btn" data-act="cierreTest">Probar aviso</button>';
 }
 return card("ajustes","Cierre del día","",body,foot)}
function cierreActivar(){pushSetup(true).then(r=>{if(r==="ok")toast("Listo: te aviso todos los días a las "+cierreCfg().hora);else if(r==="perm")toast("Sin permiso para notificaciones no te puedo avisar.");else if(r==="login")toast("Iniciá sesión con Google en Sincronización para recibir el aviso con la app cerrada.");else if(r==="nosup")toast("Este navegador no recibe avisos con la app cerrada.");render()}).catch(e=>{toast("No se pudo activar el aviso: "+(e&&e.message||e));render()})}

/* ================= PAGOS Y VENCIMIENTOS ================= */
D.pagos=Object.assign({items:[],tarjetas:[],hist:[]},load("pagos",{}));KEY.pagos="pagos";
let pMes=null,pSel=null;
function dayIn(y,m,d){return isoOf(new Date(y,m,Math.min(d,new Date(y,m+1,0).getDate())))}
function cierreAround(c,ref,next){const r=parseISO(ref);let y=r.getFullYear(),m=r.getMonth();let ci=dayIn(y,m,c.cierre);if(next){if(ci<=ref){m++;ci=dayIn(y,m,c.cierre)}}else if(ci>ref){m--;ci=dayIn(y,m,c.cierre)}return ci}
function venceFor(c,ci){const d=parseISO(ci);return dayIn(d.getFullYear(),d.getMonth()+(c.vence<=c.cierre?1:0),c.vence)}
function cardInfo(c){const t=today();const lastC=cierreAround(c,t,false),v1=venceFor(c,lastC),nextC=cierreAround(c,t,true);const pend=c.pagado!==v1&&(+c.monto||0)>0?v1:null;return {cierre:nextC,vence:pend||venceFor(c,nextC),pend}}
function pendientes(){const L=D.pagos.items.filter(p=>!p.pagado).map(p=>Object.assign({kind:"pago"},p));D.pagos.tarjetas.forEach(c=>{const i=cardInfo(c);if(i.pend)L.push({id:c.id,kind:"tarjeta",desc:"Tarjeta "+c.nombre,monto:+c.monto||0,fecha:i.pend,forma:"tarjeta",cuenta:c.cuenta||"",cat:"deudas"})});return L.sort((a,b)=>a.fecha.localeCompare(b.fecha))}
function finCfg(){const f=FIN();try{return f?f.cfg():null}catch(e){return null}}
const nameIn=(list,id)=>((list||[]).find(x=>x.id===id)||{}).nombre||"";
const IC_OUT='<svg viewBox="0 0 24 24" class="tx-ic out" aria-label="Gasto" role="img"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const IC_IN='<svg viewBox="0 0 24 24" class="tx-ic in" aria-label="Ingreso" role="img"><path d="M17 7L7 17M15 17H7V9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function kpi(label,value,sub,cls,spark){return '<div class="card kpi"><span class="eyebrow">'+label+'</span><b class="kpi-v num '+(cls||"")+'">'+value+'</b><span class="small muted">'+sub+"</span>"+(spark||"")+"</div>"}
function renderPagos(){
 const el=$("#p-pagos");if(!el)return;const t=today(),L=pendientes(),cfg=finCfg()||{categorias:[],cuentas:[]};
 const sum=a=>a.reduce((s,p)=>s+(+p.monto||0),0);
 const venc=L.filter(p=>p.fecha<t),sem=L.filter(p=>p.fecha>=t&&p.fecha<=addDays(t,7)),mes=L.filter(p=>p.fecha.slice(0,7)<=t.slice(0,7));
 let h='<div class="pg-top"><div><h2 class="sec-h" style="margin:0">Por pagar</h2><span class="small muted">Cuentas, servicios y tarjetas con su vencimiento</span></div><div class="vact"><button class="btn" data-act="pTarjeta">'+ico("plus")+' Tarjeta</button><button class="btn primary" data-act="pNuevo">'+ico("plus")+" Nuevo pago</button></div></div>";
 h+='<div class="kpis">'+kpi("A pagar este mes",money(sum(mes)),mes.length+(mes.length===1?" pago":" pagos"))+kpi("Vencidos",money(sum(venc)),venc.length?venc.length+" sin pagar":"Ninguno",venc.length?"neg":"")+kpi("Próximos 7 días",money(sum(sem)),sem.length+(sem.length===1?" pago":" pagos"))+"</div>";
 // tabla
 let tb='<div class="tablewrap ptw"><table class="ptable"><thead><tr><th>Tipo</th><th>Descripción</th><th>Forma</th><th>Cuenta</th><th>Categoría</th><th>Fecha</th><th class="r">Monto</th><th></th></tr></thead><tbody>';
 tb+=L.length?L.map(p=>'<tr><td>'+IC_OUT+'</td><td><button class="cell-link" data-act="'+(p.kind==="tarjeta"?"pTarjeta":"pEdit")+'" data-id="'+p.id+'">'+esc(p.desc)+"</button></td><td><span class=\"tag\">"+(p.kind==="tarjeta"?"Tarjeta":p.forma==="mensual"?"Mensual":"Puntual")+"</span></td><td>"+esc(nameIn(cfg.cuentas,p.cuenta)||"—")+"</td><td>"+esc(nameIn(cfg.categorias,p.cat)||"—")+'</td><td class="num '+(p.fecha<t?"neg":"")+'">'+(p.fecha<t?"Vencido · ":"")+parseISO(p.fecha).getDate()+" "+MC[parseISO(p.fecha).getMonth()]+'</td><td class="r num neg">−'+money(p.monto)+'</td><td class="r"><button class="btn sm" data-act="pPagar" data-id="'+p.id+'" data-k="'+p.kind+'">Pagar</button></td></tr>').join(""):'<tr><td colspan="8"><p class="empty">No tenés pagos pendientes. Agregá servicios, cuotas o el resumen de tu tarjeta.</p></td></tr>';
 tb+="</tbody></table></div>";
 // calendario
 const k=pMes||t.slice(0,7);const marks={};L.forEach(p=>{marks[p.fecha]=(marks[p.fecha]||0)+(+p.monto||0)});
 const selL=pSel?L.filter(p=>p.fecha===pSel):[];
 let calH=miniCal(k,{act:"pDay",nav:"pMesNav",sel:pSel,marks,title:(d,v)=>"−"+money(v),what:"pagos"});
 calH+=pSel?'<div class="pday"><b>'+cap(longDate(pSel))+"</b>"+(selL.length?selL.map(p=>'<div class="prow"><span>'+esc(p.desc)+'</span><span class="num neg">−'+money(p.monto)+"</span></div>").join(""):'<p class="empty">Sin vencimientos este día.</p>')+"</div>":'<p class="small muted" style="margin:10px 0 0">Los días con punto tienen vencimientos. Tocá uno para ver el detalle.</p>';
 // tarjetas
 let tj='<div class="tablewrap ptw"><table class="ptable"><thead><tr><th>Tarjeta</th><th>Cierre</th><th>Vencimiento</th><th class="r">Monto</th></tr></thead><tbody>';
 tj+=D.pagos.tarjetas.length?D.pagos.tarjetas.map(c=>{const i=cardInfo(c);return '<tr><td><button class="cell-link" data-act="pTarjeta" data-id="'+c.id+'">'+esc(c.nombre)+'</button></td><td class="num">'+fmtDay(i.cierre)+'</td><td class="num">'+fmtDay(i.vence)+'</td><td class="r num '+((+c.monto||0)>0?"warn-t":"muted")+'">'+((+c.monto||0)>0?"−"+money(c.monto):"Pagada")+"</td></tr>"}).join(""):'<tr><td colspan="4"><p class="empty">Agregá tus tarjetas con su día de cierre y vencimiento.</p></td></tr>';
 tj+="</tbody></table></div>";
 // mayores a pagar
 const top=L.slice().sort((a,b)=>b.monto-a.monto).slice(0,5);
 const may=top.length?chartSlot((w,hh)=>{const H=190,pb=34,pt=22,mx=Math.max(...top.map(p=>+p.monto||0),1),bw=Math.min(70,(w-20)/top.length*.62),gap=(w-bw*top.length)/(top.length+1);let s='<svg class="mbars" width="'+w+'" height="'+H+'" viewBox="0 0 '+w+" "+H+'" role="img" aria-label="Mayores pagos pendientes">';top.forEach((p,i)=>{const x=gap+i*(bw+gap),bh=(H-pb-pt)*(+p.monto||0)/mx,y=H-pb-bh;s+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(2,bh).toFixed(1)+'" rx="4" class="'+(i===0?"top":"")+'"/><text class="mb-v" x="'+(x+bw/2).toFixed(1)+'" y="'+(y-6).toFixed(1)+'" text-anchor="middle">'+kfmt(p.monto)+'</text><text class="mb-l" x="'+(x+bw/2).toFixed(1)+'" y="'+(H-12)+'" text-anchor="middle">'+esc(p.desc.length>12?p.desc.slice(0,11)+"…":p.desc)+"</text>"});return s+"</svg>"},190):'<p class="empty">Cuando cargues pagos, acá vas a ver los más grandes.</p>';
 const hist=(D.pagos.hist||[]).slice(-6).reverse();
 h+='<div class="pg-grid"><article class="card pg-main"><header class="card-head"><h2>'+ico("pagos")+'Por pagar</h2><span class="small muted">'+L.length+' pendientes</span></header>'+tb+'</article><article class="card pg-cal"><header class="card-head"><h2>'+ico("calendario")+'Vencimientos</h2></header>'+calH+"</article>";
 h+='<article class="card pg-tj"><header class="card-head"><h2>'+ico("finanzas")+'Facturas de tarjeta</h2></header>'+tj+'</article><article class="card pg-may"><header class="card-head"><h2>Mayores a pagar</h2></header>'+may+"</article></div>";
 if(hist.length)h+='<article class="card" style="margin-top:14px"><header class="card-head"><h2>'+ico("check")+'Pagados recientemente</h2></header>'+hist.map(x=>'<div class="prow"><span>'+esc(x.desc)+' <span class="small muted">· '+fmtDay(x.fecha)+'</span></span><span class="num">−'+money(x.monto)+"</span></div>").join("")+"</article>";
 el.innerHTML=h;drawCharts(el);
}
function pagar(id,kind){
 const f=FIN(),t=today();let it=null;
 if(kind==="tarjeta"){const c=D.pagos.tarjetas.find(x=>x.id===id);if(!c)return;const i=cardInfo(c);it={desc:"Pago tarjeta "+c.nombre,monto:+c.monto||0,cat:"deudas",cuenta:c.cuenta};c.pagado=i.pend;c.monto=0}
 else{const p=D.pagos.items.find(x=>x.id===id);if(!p)return;it={desc:p.desc,monto:+p.monto||0,cat:p.cat,cuenta:p.cuenta};if(p.forma==="mensual"){p.fecha=addMonths(p.fecha,1);p.avisado=null}else{p.pagado=true;p.pagadoEn=t}gcTouch("pago",p.id)}
 D.pagos.hist.push({desc:it.desc,monto:it.monto,fecha:t});if(D.pagos.hist.length>200)D.pagos.hist=D.pagos.hist.slice(-200);put("pagos");
 let reg=false;if(f&&it.monto>0){try{const cfg=f.cfg();const cat=cfg.categorias.some(c=>c.id===it.cat)?it.cat:f.classify(it.desc);f.addItems([{id:uid(),fecha:t,concepto:it.desc,monto:it.monto,tipo:"gasto",cat,cuenta:it.cuenta||cfg.cuentaDefault}]);reg=true}catch(e){}}
 toast("Pagado: "+it.desc+(reg?". Lo sumé a tus gastos del mes.":""));renderPagos();badges();if(view==="hoy")render();
}
function pagoSheet(id){
 const cfg=finCfg()||{categorias:[],cuentas:[]};const p=id?D.pagos.items.find(x=>x.id===id):{desc:"",monto:"",fecha:addDays(today(),7),forma:"puntual",cat:"",cuenta:cfg.cuentaDefault||""};if(!p)return;
 openSheet({title:id?"Editar pago":"Nuevo pago",html:()=>'<form class="form" id="sfPago" autocomplete="off"><div class="field"><label for="pg-d">Descripción</label><input id="pg-d" name="desc" required maxlength="80" value="'+esc(p.desc)+'" placeholder="Ej.: Plan de celular, Expensas, Cuota auto" autofocus></div><div class="frow"><div class="field"><label for="pg-m">Monto</label><input type="number" id="pg-m" name="monto" min="0" step="any" inputmode="decimal" required value="'+esc(p.monto)+'"></div><div class="field"><label for="pg-f">Vence</label><input type="date" id="pg-f" name="fecha" required value="'+p.fecha+'"></div></div><div class="field"><span class="flabel">Forma</span><div class="chips"><label><input type="radio" name="forma" value="puntual"'+(p.forma!=="mensual"?" checked":"")+'><span>Una vez</span></label><label><input type="radio" name="forma" value="mensual"'+(p.forma==="mensual"?" checked":"")+'><span>Todos los meses</span></label></div></div><div class="frow"><div class="field"><label for="pg-c">Categoría</label><select id="pg-c" name="cat"><option value="">Automática</option>'+cfg.categorias.filter(c=>!c.ahorro).map(c=>'<option value="'+esc(c.id)+'"'+(c.id===p.cat?" selected":"")+">"+esc(c.nombre)+"</option>").join("")+'</select></div><div class="field"><label for="pg-a">Cuenta</label><select id="pg-a" name="cuenta">'+cfg.cuentas.map(c=>'<option value="'+esc(c.id)+'"'+(c.id===p.cuenta?" selected":"")+">"+esc(c.nombre)+"</option>").join("")+'</select></div></div><p class="small muted" style="margin:0">Cuando lo marques como pagado, se suma solo a tus gastos del mes. Si es mensual, pasa al mes siguiente.</p>'+gcField("pago",p,!id)+'<div class="sheet-actions">'+(id?delBtn("pago",id):"")+'<span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>',
 forms:{sfPago(fd){const o={desc:String(fd.get("desc")).trim(),monto:Math.max(0,+fd.get("monto")||0),fecha:fd.get("fecha"),forma:fd.get("forma")||"puntual",cat:fd.get("cat")||"",cuenta:fd.get("cuenta")||""};if(!o.desc||!o.fecha)return;let nid=id;if(id){if(o.fecha!==p.fecha)p.avisado=null;Object.assign(p,o)}else{nid=uid();D.pagos.items.push(Object.assign({id:nid,pagado:false},o))}put("pagos");closeSheet();renderPagos();toast(id?"Pago guardado":"Pago agregado");gcAfterSave("pago",nid,fd,!id)}}});
}
function tarjetaSheet(id){
 const cfg=finCfg()||{cuentas:[]};const c=id?D.pagos.tarjetas.find(x=>x.id===id):{nombre:"",cierre:25,vence:5,monto:"",cuenta:cfg.cuentaDefault||""};if(!c)return;
 openSheet({title:id?c.nombre:"Nueva tarjeta",html:()=>'<form class="form" id="sfTj" autocomplete="off"><div class="field"><label for="tj-n">Nombre</label><input id="tj-n" name="nombre" required maxlength="40" value="'+esc(c.nombre)+'" placeholder="Ej.: Visa Galicia, Nu, Mastercard"'+(id?"":" autofocus")+'></div><div class="frow"><div class="field"><label for="tj-c">Día de cierre</label><input type="number" id="tj-c" name="cierre" min="1" max="31" required value="'+c.cierre+'"></div><div class="field"><label for="tj-v">Día de vencimiento</label><input type="number" id="tj-v" name="vence" min="1" max="31" required value="'+c.vence+'"></div></div><div class="field"><label for="tj-m">Monto del resumen a pagar</label><input type="number" id="tj-m" name="monto" min="0" step="any" inputmode="decimal" value="'+esc(c.monto)+'" placeholder="0 si ya está pagada"></div><div class="field"><label for="tj-a">Se paga desde</label><select id="tj-a" name="cuenta">'+(cfg.cuentas||[]).map(x=>'<option value="'+esc(x.id)+'"'+(x.id===c.cuenta?" selected":"")+">"+esc(x.nombre)+"</option>").join("")+'</select></div><p class="small muted" style="margin:0">Cada mes, cuando llegue el resumen, actualizá el monto. Al pagarlo vuelve a cero.</p><div class="sheet-actions">'+(id?delBtn("tarjeta",id):"")+'<span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>',
 forms:{sfTj(fd){const o={nombre:String(fd.get("nombre")).trim(),cierre:Math.max(1,Math.min(31,Math.round(+fd.get("cierre")||1))),vence:Math.max(1,Math.min(31,Math.round(+fd.get("vence")||1))),monto:Math.max(0,+fd.get("monto")||0),cuenta:fd.get("cuenta")||""};if(!o.nombre)return;if(id){if(o.monto>0&&o.monto!==+c.monto)c.pagado=null;Object.assign(c,o)}else D.pagos.tarjetas.push(Object.assign({id:uid(),pagado:null},o));put("pagos");closeSheet();renderPagos();toast("Tarjeta guardada")}}});
}

/* ================= FINANZAS (panel superior) ================= */
let fdPrev={k:null,items:null,loading:false};
const GREYS=["#FFFFFF","#B9B9C1","#86868F","#5E5E66","#45454C","#323238"];
function periodSvg(cur,prev,n,W,H){
 const pl=44,pr=10,pt=14,pb=26;const all=cur.concat(prev||[]).concat([0]);let mn=Math.min(...all),mx=Math.max(...all);if(mx===mn){mx+=1;mn-=1}const pad=(mx-mn)*.1;mx+=pad;mn-=pad;
 const X=i=>pl+(W-pl-pr)*(n<=1?.5:i/(n-1)),Y=v=>pt+(H-pt-pb)*(1-(v-mn)/(mx-mn)),y0=Y(0);const P=a=>"M"+a.map((v,i)=>X(i).toFixed(1)+" "+Y(v).toFixed(1)).join("L");
 const id="pc"+(++chN);let s='<svg class="psvg" width="'+W+'" height="'+H+'" viewBox="0 0 '+W+" "+H+'" role="img" aria-label="Balance acumulado del mes contra el mes anterior"><defs><clipPath id="'+id+'u"><rect x="0" y="0" width="'+W+'" height="'+y0.toFixed(1)+'"/></clipPath><clipPath id="'+id+'d"><rect x="0" y="'+y0.toFixed(1)+'" width="'+W+'" height="'+(H-y0).toFixed(1)+'"/></clipPath></defs>';
 for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4,y=Y(v);s+='<line class="mc-grid" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y.toFixed(1)+'" y2="'+y.toFixed(1)+'"/><text class="mc-ax" x="'+(pl-6)+'" y="'+(y+3.5).toFixed(1)+'" text-anchor="end">'+kfmt(v)+"</text>"}
 s+='<line class="ps-zero" x1="'+pl+'" x2="'+(W-pr)+'" y1="'+y0.toFixed(1)+'" y2="'+y0.toFixed(1)+'"/>';
 if(cur.length>1){const a=P(cur)+"L"+X(cur.length-1).toFixed(1)+" "+y0.toFixed(1)+"L"+X(0).toFixed(1)+" "+y0.toFixed(1)+"Z";s+='<path d="'+a+'" class="ps-up" clip-path="url(#'+id+'u)"/><path d="'+a+'" class="ps-dn" clip-path="url(#'+id+'d)"/>'}
 if(prev&&prev.length>1)s+='<path class="ps-prev" d="'+P(prev.slice(0,n))+'"/>';
 if(cur.length)s+='<path class="ps-cur" d="'+P(cur)+'"/><circle class="ls-dot" cx="'+X(cur.length-1).toFixed(1)+'" cy="'+Y(cur[cur.length-1]).toFixed(1)+'" r="3.5"/>';
 [1,5,10,15,20,25,n].filter((v,i,a)=>v<=n&&a.indexOf(v)===i).forEach(d=>{s+='<text class="mc-ax" x="'+X(d-1).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+d+"</text>"});
 return s+"</svg>";
}
function donutSvg(parts,total,size){const r=size/2-12,c=2*Math.PI*r,cx=size/2;let off=0,s='<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+" "+size+'" aria-hidden="true"><circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="#18181B" stroke-width="20"/>';parts.forEach((p,i)=>{const len=total?c*p.v/total:0;if(len<=0)return;s+='<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="'+GREYS[i%GREYS.length]+'" stroke-width="20" stroke-dasharray="'+Math.max(0,len-1.5).toFixed(2)+" "+(c-Math.max(0,len-1.5)).toFixed(2)+'" stroke-dashoffset="'+(-off).toFixed(2)+'" transform="rotate(-90 '+cx+" "+cx+')"/>';off+=len});return s+"</svg>"}
function renderFinDash(){
 const el=$("#finDash");const f=FIN();if(!el||!f)return;let d;try{d=f.data()}catch(e){return}
 const k=d.key,t=today(),isCur=k===t.slice(0,7),n=monthDays(k),last=isCur?parseISO(t).getDate():n;
 const [yy,mm]=k.split("-").map(Number);
 const prevK=addMonths(k+"-01",-1).slice(0,7);
 if(fdPrev.k!==prevK&&!fdPrev.loading){fdPrev={k:prevK,items:null,loading:true};Promise.resolve(f.getMonth(prevK)).then(m=>{fdPrev={k:prevK,items:(m&&m.items)||[],loading:false};renderFinDash()}).catch(()=>{fdPrev={k:prevK,items:[],loading:false}})}
 const pItems=fdPrev.k===prevK?fdPrev.items:null;
 const isAh=it=>{const c=d.cfg.categorias.find(c=>c.id===it.cat);return c&&c.ahorro};
 const cum=(items,len,fn)=>{const by={};(items||[]).forEach(it=>{const dd=+String(it.fecha).slice(8,10);by[dd]=(by[dd]||0)+fn(it)});const o=[];let a=0;for(let i=1;i<=len;i++){a+=by[i]||0;o.push(a)}return o};
 const fIng=it=>it.tipo==="ingreso"?it.monto:0,fGas=it=>it.tipo!=="ingreso"&&!isAh(it)?it.monto:0,fAho=it=>it.tipo!=="ingreso"&&isAh(it)?it.monto:0,fNet=it=>it.tipo==="ingreso"?it.monto:-it.monto;
 const tot=(items,fn)=>(items||[]).reduce((s,it)=>s+fn(it),0);
 const vs=(a,b,inv)=>{if(pItems==null||!b)return "";const p=Math.round((a-b)/Math.abs(b)*100);if(!p)return '<span class="fh-vs">= '+MC[(mm+10)%12]+"</span>";const good=inv?p<0:p>0;return '<span class="fh-vs '+(good?"pos":"neg")+'">'+(p>0?"+":"−")+Math.abs(p)+"% vs "+MC[(mm+10)%12]+"</span>"};
 const ing=tot(d.items,fIng),gas=tot(d.items,fGas),aho=tot(d.items,fAho),net=ing-gas-aho;
 const pI=tot(pItems,fIng),pG=tot(pItems,fGas);
 const sgn=v=>(v>0?"+":v<0?"−":"")+money(Math.abs(v));
 /* ---- tarjeta principal ---- */
 const cfg=d.cfg,o=cfg.objetivo||{};
 const fijos=(cfg.ingresos||[]).filter(i=>i.tipo==="fijo").reduce((s,i)=>s+(+i.monto||0),0),ingRef=Math.max(ing,fijos);
 const left=isCur?n-last+1:0;
 const ahPct=ing>0?Math.round(net/ing*100):null;
 let tip="",goal="";
 if(o.tipo==="ahorro"){
  const meta=ingRef*(+o.pct||0)/100,tope=ingRef-meta,rest=tope-gas,actual=ing-gas,p=meta>0?Math.max(0,Math.min(1,actual/meta)):0;
  if(isCur&&ingRef>0)tip=rest>0?"Podés gastar <b class=\"num\">"+money(rest/left)+"</b> por día hasta fin de mes sin tocar tu meta de ahorro.":"Ya usaste todo el margen del mes: cada gasto extra sale de tu meta de ahorro.";
  if(meta>0)goal='<div class="fh-goal"><div class="fh-goal-h"><span class="eyebrow">Meta de ahorro · '+(+o.pct||0)+'%</span><span class="num">'+Math.round(p*100)+"% · "+money(Math.max(0,actual))+" / "+money(meta)+'</span></div><div class="fh-bar"><i style="width:'+(p*100).toFixed(1)+'%"></i></div></div>';
 }else{
  const isF=o.tipo==="fondo",meta=+o.meta||0,extra=isF?aho:tot(d.items,it=>it.tipo!=="ingreso"&&it.cat==="deudas"?it.monto:0),acum=(+o.acumulado||0)+extra,p=meta>0?Math.min(1,acum/meta):0;
  if(isCur&&d.disp>0)tip="Podés gastar <b class=\"num\">"+money(d.disp/left)+"</b> por día hasta fin de mes sin quedar en negativo.";else if(isCur&&d.disp<=0)tip="Tu balance está en cero o negativo: frená los gastos que no sean urgentes.";
  if(meta>0)goal='<div class="fh-goal"><div class="fh-goal-h"><span class="eyebrow">'+(isF?"Fondo de emergencia":"Deudas pagadas")+'</span><span class="num">'+Math.round(p*100)+"% · "+money(acum)+" / "+money(meta)+'</span></div><div class="fh-bar"><i style="width:'+(p*100).toFixed(1)+'%"></i></div></div>';
 }
 let h='<article class="card fh"><header class="fh-head"><span class="eyebrow">Tu mes · '+cap(MESES[mm-1])+'</span><div class="fh-add"><button class="btn sm" data-act="movNuevo" data-v="ingreso" aria-label="Cargar un ingreso">'+ico("plus",2.2)+'Ingreso</button><button class="btn sm primary" data-act="movNuevo" data-v="gasto" aria-label="Cargar un gasto">'+ico("plus",2.2)+"Gasto</button></div></header>";
 h+='<div class="fh-tiles"><div class="fh-tile"><span class="eyebrow">Ingresos</span><b class="num">'+money(ing)+"</b>"+vs(ing,pI)+'</div><div class="fh-tile"><span class="eyebrow">Gastos</span><b class="num neg">'+money(gas)+"</b>"+vs(gas,pG,true)+"</div></div>";
 h+='<div class="fh-bal"><span class="eyebrow">Balance del mes</span>'+(ahPct!=null&&net>0?'<span class="fh-chip">ahorrás el '+ahPct+"%</span>":ahPct!=null&&net<0?'<span class="fh-chip neg">gastás más de lo que entra</span>':"")+'<b class="num '+(net<0?"neg":net>0?"pos":"")+'">'+sgn(net)+"</b></div>";
 if(aho>0)h+='<p class="fh-note">Separaste <b class="num">'+money(aho)+"</b> para ahorro o inversión este mes.</p>";
 if(tip)h+='<p class="fh-note">'+tip+"</p>";
 h+=goal+"</article>";
 el.innerHTML=h;
 /* ---- movimientos del mes ---- */
 const allM=(d.items||[]).slice().sort((a,b)=>b.fecha.localeCompare(a.fecha)||0);const lastM=allM.slice(0,7);
 const mv=$("#fdMovs");
 if(mv)mv.innerHTML='<article class="card fm"><header class="card-head"><h2>Movimientos <span class="muted">· '+cap(MESES[mm-1])+'</span></h2><button class="linkbtn" data-act="finMovs">Ver todos'+(allM.length>7?" ("+allM.length+")":"")+" →</button></header>"+(lastM.length?'<div class="fm-head" aria-hidden="true"><span>Fecha</span><span>Descripción</span><span>Monto</span></div><ul class="fm-list">'+lastM.map(it=>{const inn=it.tipo==="ingreso";const dt=parseISO(it.fecha);return '<li><button data-act="movEdit" data-id="'+esc(it.id)+'"><span class="fm-d num">'+pad2(dt.getDate())+"/"+pad2(dt.getMonth()+1)+'</span><span class="fm-c"><b>'+esc(it.concepto)+"</b><small>"+esc(inn?"Ingreso":nameIn(cfg.categorias,it.cat)||"Sin categoría")+(nameIn(cfg.cuentas,it.cuenta)?" · "+esc(nameIn(cfg.cuentas,it.cuenta)):"")+'</small></span><span class="fm-m num '+(inn?"pos":"")+'">'+(inn?"+":"−")+money(it.monto)+"</span></button></li>"}).join("")+"</ul>":'<p class="empty">Todavía no cargaste movimientos este mes. Tocá <b>+ Gasto</b> arriba para empezar.</p>')+"</article>";
 /* ---- anillo y evolución ---- */
 const dn=$("#fdDon");if(dn)dn.innerHTML=donutCard(d);
 const cur=cum(d.items,last,fNet),prev=pItems?cum(pItems,monthDays(prevK),fNet):null;
 const pr=$("#fdPer");if(pr)pr.innerHTML='<article class="card fd-bal"><header class="card-head"><h2>Evolución del balance</h2><span class="legend"><i class="lg-cur"></i>Este mes <i class="lg-prev"></i>Anterior</span></header>'+chartSlot(w=>periodSvg(cur,prev,n,w,190),190)+"</article>";
 const pa=$("#p-resumen");if(pa&&pa.offsetParent)drawCharts(pa);
}
window.CorchoFinHook=()=>{try{renderFinDash()}catch(e){}try{const pf=$("#p-fijos");if(pf&&!pf.hidden)renderFijos()}catch(e){}};
window.CorchoPagosRender=()=>{try{renderPagos()}catch(e){}};


/* ================= FINANZAS: anillo por categoría ================= */
let donTipo="gasto",donSel=null;
const DON_COLORS=["#D65A8C","#4A7BD0","#5BC24A","#E0473A","#7FB257","#2F56A6","#8A2BC2","#D9822B","#3B8FF6","#E83E9C","#26B5A8","#F2C14E","#9B6BDB","#C0392B"];
function catColor(list,id){const i=(list||[]).findIndex(c=>c.id===id);if(i>=0&&list[i].color)return list[i].color;if(i<0){let h=0;String(id).split("").forEach(ch=>h=(h*31+ch.charCodeAt(0))>>>0);return DON_COLORS[h%DON_COLORS.length]}return DON_COLORS[i%DON_COLORS.length]}
function shortMoney(v){const a=Math.abs(v),sg=v<0?"−":"";if(a>=1e6)return sg+(a/1e6).toFixed(2).replace(".",",")+" M$";if(a>=1e4)return sg+Math.round(a/1e3)+" k$";return sg+Math.round(a).toLocaleString("es-AR")+" $"}
function donutParts(d,tipo){
 const isAh=it=>{const c=d.cfg.categorias.find(c=>c.id===it.cat);return c&&c.ahorro};
 const by={};(d.items||[]).forEach(it=>{const inn=it.tipo==="ingreso";if(tipo==="ingreso"?!inn:inn)return;const k=it.cat||"otros";by[k]=(by[k]||0)+(+it.monto||0)});
 const list=tipo==="ingreso"?(d.cfg.ingresos||[]):d.cfg.categorias;
 return Object.entries(by).filter(([,v])=>v>0).map(([id,v])=>({id,v,label:nameIn(list,id)||(tipo==="ingreso"?"Otros ingresos":"Otros"),color:catColor(list,id),ahorro:tipo==="gasto"&&!!(d.cfg.categorias.find(c=>c.id===id)||{}).ahorro})).sort((a,b)=>b.v-a.v);
}
function ringSvg(parts,total,S,sel){
 const cx=S/2,cy=S/2,r1=S/2-4,r0=r1*.66,gap=Math.max(3,S*.012);
 const P=(r,a)=>(cx+r*Math.sin(a)).toFixed(2)+" "+(cy-r*Math.cos(a)).toFixed(2);
 let s='<svg class="ring-don" width="'+S+'" height="'+S+'" viewBox="0 0 '+S+" "+S+'" role="img" aria-label="Distribución por categoría">';
 if(!parts.length||!total)s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+((r0+r1)/2).toFixed(1)+'" fill="none" stroke="#1C1C20" stroke-width="'+(r1-r0).toFixed(1)+'"/>';
 else if(parts.length===1)s+='<path class="seg on" d="M'+P(r1,0)+"A"+r1+" "+r1+" 0 1 1 "+P(r1,Math.PI)+"A"+r1+" "+r1+" 0 1 1 "+P(r1,2*Math.PI-1e-4)+"L"+P(r0,2*Math.PI-1e-4)+"A"+r0+" "+r0+" 0 1 0 "+P(r0,Math.PI)+"A"+r0+" "+r0+" 0 1 0 "+P(r0,0)+'Z" fill="'+parts[0].color+'" data-act="donSel" data-i="0"/>';
 else{let a=0;parts.forEach((p,i)=>{const sw=2*Math.PI*p.v/total;const a0=a,a1=a+sw;a=a1;const go=Math.min(gap/2/r1,sw*.3),gi=Math.min(gap/2/r0,sw*.3);const o0=a0+go,o1=a1-go,i0=a0+gi,i1=a1-gi;const lg=(o1-o0)>Math.PI?1:0;
  const dim=sel!=null&&sel!==i;const grow=sel===i?4:0;const R1=r1+grow-4*(sel!=null&&sel!==i?0:0);
  s+='<path class="seg'+(dim?" dim":"")+(sel===i?" on":"")+'" d="M'+P(R1,o0)+"A"+R1+" "+R1+" 0 "+lg+" 1 "+P(R1,o1)+"L"+P(r0,i1)+"A"+r0+" "+r0+" 0 "+lg+" 0 "+P(r0,i0)+'Z" fill="'+p.color+'" data-act="donSel" data-i="'+i+'"><title>'+esc(p.label)+": "+esc(money(p.v))+"</title></path>"})}
 s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(r0-S*.045).toFixed(1)+'" fill="none" stroke="#4A4A50" stroke-width="'+Math.max(2.5,S*.012).toFixed(1)+'" stroke-dasharray="'+(S*.03).toFixed(1)+" "+(S*.022).toFixed(1)+'"/>';
 return s+"</svg>";
}
function donutCard(d){
 const parts=donutParts(d,donTipo),total=parts.reduce((s,p)=>s+p.v,0);if(donSel!=null&&donSel>=parts.length)donSel=null;
 const sp=donSel!=null?parts[donSel]:null;const [yy,mm]=d.key.split("-").map(Number);
 const center=sp?'<span class="dc-cat">'+esc(sp.label)+'</span><b class="num">'+shortMoney(sp.v)+'</b><span class="dc-pct num">'+Math.round(sp.v/total*100)+"%</span>":'<b class="num">'+shortMoney(total)+'</b><span class="dc-cat">'+(donTipo==="ingreso"?"Ingresos":"Gastos")+"</span>";
 let h='<article class="card fd-cat don-card"><header class="card-head"><h2>Por categoría</h2><button class="linkbtn" data-act="catsMgr">'+ico("ajustes")+' Categorías y límites</button></header>';
 h+='<div class="seg don-seg"><button data-act="donTipo" data-v="gasto" aria-selected="'+(donTipo==="gasto")+'">Gastos</button><button data-act="donTipo" data-v="ingreso" aria-selected="'+(donTipo==="ingreso")+'">Ingresos</button></div>';
 h+='<div class="don-wrap">'+chartSlot(w=>ringSvg(parts,total,Math.min(300,w),donSel),Math.min(300,Math.round(((($("#fdDon")||{}).clientWidth||340)-40)*.9)),"don-slot")+'<div class="don-center">'+center+'</div><button class="don-fab" data-act="movNuevo" data-v="'+donTipo+'" aria-label="Cargar '+(donTipo==="ingreso"?"un ingreso":"un gasto")+'">'+ico("plus",2.4)+"</button></div>";
 h+=parts.length?'<ul class="don-legend">'+parts.map((p,i)=>'<li><button data-act="catVer" data-id="'+esc(p.id)+'" data-tipo="'+donTipo+'" data-i="'+i+'" class="'+(donSel===i?"on":"")+'"><i style="background:'+p.color+'"></i><span>'+esc(p.label)+(p.ahorro?' <small class="muted">· ahorro</small>':"")+'</span><b class="num">'+money(p.v)+'</b><em class="num">'+Math.round(p.v/total*100)+"%</em></button></li>").join("")+"</ul>":'<p class="empty" style="text-align:center">'+(donTipo==="ingreso"?"No hay ingresos cargados este mes.":"No hay gastos cargados este mes.")+"</p>";
 h+="</article>";
 return h;
}
function movSheet(tipo,id){
 const f=FIN();if(!f)return;const cfg=f.cfg();const d=f.data();const t=today();const def=d.key===t.slice(0,7)?t:d.key+"-01";
 const ex=id?(d.items||[]).find(x=>x.id===id):null;if(id&&!ex)return;
 const o=ex?{tipo:ex.tipo==="ingreso"?"ingreso":"gasto",monto:ex.monto,concepto:ex.concepto,cat:ex.cat,cuenta:ex.cuenta,fecha:ex.fecha}:{tipo:tipo||"gasto",monto:"",concepto:"",cat:"",cuenta:cfg.cuentaDefault||"",fecha:def};
 openSheet({title:ex?"Editar movimiento":"Nuevo movimiento",html:()=>{const cats=o.tipo==="ingreso"?(cfg.ingresos||[]):cfg.categorias;return '<form class="form" id="sfMov" autocomplete="off"><div class="seg don-seg" style="margin:0"><button type="button" data-act="movTipo" data-v="gasto" aria-selected="'+(o.tipo==="gasto")+'">Gasto</button><button type="button" data-act="movTipo" data-v="ingreso" aria-selected="'+(o.tipo==="ingreso")+'">Ingreso</button></div><div class="frow"><div class="field"><label for="mv-m">Monto</label><input type="number" id="mv-m" name="monto" min="0" step="any" inputmode="decimal" required value="'+esc(o.monto)+'" autofocus></div><div class="field"><label for="mv-f">Fecha</label><input type="date" id="mv-f" name="fecha" required value="'+o.fecha+'"></div></div><div class="field"><label for="mv-c">Concepto</label><input id="mv-c" name="concepto" maxlength="80" value="'+esc(o.concepto)+'" placeholder="'+(o.tipo==="ingreso"?"Ej.: Sueldo, Freelance":"Ej.: Coto, Uber, Netflix")+'"></div><div class="frow"><div class="field"><label for="mv-k">Categoría</label><select id="mv-k" name="cat"><option value="">Automática</option>'+cats.map(c=>'<option value="'+esc(c.id)+'"'+(c.id===o.cat?" selected":"")+">"+esc(c.nombre)+"</option>").join("")+'</select></div><div class="field"><label for="mv-a">Cuenta</label><select id="mv-a" name="cuenta">'+cfg.cuentas.map(c=>'<option value="'+esc(c.id)+'"'+(c.id===o.cuenta?" selected":"")+">"+esc(c.nombre)+"</option>").join("")+'</select></div></div><div class="sheet-actions">'+(ex?delBtn("mov",id):"")+'<span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">'+(ex?"Guardar cambios":"Guardar "+(o.tipo==="ingreso"?"ingreso":"gasto"))+"</button></div></form>"},
  keep:o,
  forms:{sfMov(fd){const monto=+fd.get("monto");if(!(monto>0)){toast("Ingresá un monto mayor a cero.");return}const concepto=String(fd.get("concepto")||"").trim()||(o.tipo==="ingreso"?"Ingreso":"Gasto");let cat=fd.get("cat")||"";
   if(!cat){if(o.tipo==="gasto")cat=f.classify(concepto);else{const n=norm(concepto);const src=(cfg.ingresos||[]).find(x=>norm(x.nombre)&&n.includes(norm(x.nombre))||String(x.claves||"").split(",").some(k=>k.trim()&&n.includes(norm(k))));cat=src?src.id:"ingreso"}}
   const item={fecha:fd.get("fecha")||def,concepto,monto:Math.round(monto*100)/100,tipo:o.tipo,cat,cuenta:fd.get("cuenta")||cfg.cuentaDefault};
   if(ex){if(!fd.get("cat")&&ex.cat&&o.tipo===(ex.tipo==="ingreso"?"ingreso":"gasto")&&concepto===ex.concepto)item.cat=ex.cat;f.updateItem(id,item).then(()=>renderFinDash());closeSheet();toast(item.fecha.slice(0,7)!==d.key?"Movimiento guardado y movido a "+cap(MESES[+item.fecha.slice(5,7)-1]):"Movimiento actualizado");return}
   f.addItems([Object.assign({id:uid()},item)]);donTipo=o.tipo;donSel=null;closeSheet();toast((o.tipo==="ingreso"?"Ingreso":"Gasto")+" guardado: "+money(monto))}}});
}


/* ================= FINANZAS: categorías y límites ================= */
function cfgCopy(){const f=FIN();if(!f)return null;const nc=JSON.parse(JSON.stringify(f.cfg()));nc.categorias.forEach((c,i)=>{if(!c.color)c.color=DON_COLORS[i%DON_COLORS.length]});return nc}
function catSpent(id){const f=FIN();if(!f)return 0;try{return (f.data().items||[]).filter(it=>it.tipo!=="ingreso"&&it.cat===id).reduce((s,it)=>s+(+it.monto||0),0)}catch(e){return 0}}
function catsSheet(){
 const f=FIN();if(!f)return;
 openSheet({title:"Categorías y límites",html:()=>{const cfg=f.cfg();const ing=(cfg.ingresos||[]).reduce((s,i)=>s+(+i.monto||0),0);const lim=cfg.categorias.reduce((s,c)=>s+(c.ahorro?0:(+c.limite||0)),0);
  return '<p class="small muted" style="margin-top:0">Tocá una categoría para cambiar su nombre, su límite mensual o las palabras con las que se reconoce. Los límites son por mes.</p>'+
  '<div class="cm-sum"><span>Presupuestado <b class="num">'+money(lim)+'</b></span><span>Ingresos esperados <b class="num">'+money(ing)+'</b></span><span>Margen <b class="num '+(ing-lim<0?"neg":"pos")+'">'+money(ing-lim)+"</b></span></div>"+
  '<ul class="cm-list">'+cfg.categorias.map((c,i)=>{const sp=catSpent(c.id),l=+c.limite||0,p=l?Math.min(1,sp/l):0;return '<li><button data-act="catEdit" data-id="'+esc(c.id)+'" data-from="mgr"><i style="background:'+catColor(cfg.categorias,c.id)+'"></i><span class="cm-n">'+esc(c.nombre)+(c.ahorro?' <small class="muted">· ahorro</small>':"")+'<span class="cm-bar"><em style="width:'+(p*100).toFixed(0)+"%;background:"+(l&&sp>l?"var(--crit)":"var(--ink)")+'"></em></span></span><span class="cm-l num">'+(c.ahorro?"—":l?money(sp)+" / "+money(l):"Sin límite")+"</span></button></li>"}).join("")+"</ul>"+
  '<div class="sheet-actions"><button class="btn primary" data-act="catEdit" data-id="" data-from="mgr">'+ico("plus")+' Nueva categoría</button><span class="grow"></span><button type="button" class="btn" data-act="close">Listo</button></div>'}});
}
function catSheet(id,fromMgr){
 const f=FIN();if(!f)return;const cfg=f.cfg();const c=id?cfg.categorias.find(x=>x.id===id):{nombre:"",limite:"",claves:"",ahorro:false};if(!c)return;
 const sp=id?catSpent(id):0;
 openSheet({title:id?c.nombre:"Nueva categoría",html:()=>'<form class="form" id="sfCat" autocomplete="off"><div class="field"><label for="ct-n">Nombre</label><input id="ct-n" name="nombre" required maxlength="40" value="'+esc(c.nombre)+'" placeholder="Ej.: Mascotas, Educación, Regalos"'+(id?"":" autofocus")+'></div>'+
  '<div class="field"><label for="ct-l">Límite mensual</label><input type="number" id="ct-l" name="limite" min="0" step="any" inputmode="decimal" value="'+esc(c.limite||"")+'" placeholder="0 = sin límite"'+(id?" autofocus":"")+'>'+(id?'<span class="small muted">Este mes llevás gastado '+money(sp)+".</span>":"")+"</div>"+
  (id==="otros"?"":'<div class="field"><label for="ct-k">Palabras que la identifican</label><textarea id="ct-k" name="claves" rows="3" placeholder="Separadas por coma. Ej.: veterinaria, alimento perro, petshop">'+esc(c.claves||"")+'</textarea><span class="small muted">Cuando un movimiento tiene alguna de estas palabras, va solo a esta categoría.</span></div>')+
  '<div class="chips"><label><input type="checkbox" name="ahorro" value="1"'+(c.ahorro?" checked":"")+'><span>Es ahorro o inversión (no cuenta como gasto)</span></label></div>'+
  '<div class="sheet-actions">'+(id&&id!=="otros"?delBtn("cat",id,"Eliminar",' data-from="'+(fromMgr?"mgr":"")+'"'):"")+'<span class="grow"></span><button type="button" class="btn" data-act="'+(fromMgr?"catsMgr":"close")+'">'+(fromMgr?"Volver":"Cancelar")+'</button><button class="btn primary">Guardar</button></div></form>',
 forms:{sfCat(fd){const nombre=String(fd.get("nombre")||"").trim();if(!nombre){toast("Poné un nombre.");return}const nc=cfgCopy();const lim=Math.max(0,+fd.get("limite")||0);
  const dup=nc.categorias.find(x=>norm(x.nombre)===norm(nombre)&&x.id!==id);if(dup){toast("Ya existe una categoría con ese nombre.");return}
  const o={nombre,limite:lim,ahorro:!!fd.get("ahorro")};if(id!=="otros")o.claves=String(fd.get("claves")||"").trim();
  if(id){Object.assign(nc.categorias.find(x=>x.id===id),o)}else{const nid="c"+uid();const used=nc.categorias.map(x=>x.color);o.color=DON_COLORS.find(x=>!used.includes(x))||DON_COLORS[nc.categorias.length%DON_COLORS.length];const k=nc.categorias.findIndex(x=>x.id==="otros");nc.categorias.splice(k<0?nc.categorias.length:k,0,Object.assign({id:nid,claves:""},o))}
  f.saveCfg(nc);toast(id?"Categoría guardada":"Categoría creada");if(fromMgr)catsSheet();else closeSheet();renderFinDash()}}});
}


/* ================= FINANZAS: gastos fijos del mes (checklist) ================= */
const FIJOS_GRUPOS=[["fijos","Gastos fijos"],["cuotas","Cuotas"],["subs","Suscripciones"],["variables","Variables"]];
function fijosSeed(){let n=0;const it=(nombre,grupo,cat,cuota)=>({id:"f"+(++n),nombre,grupo,cat,monto:null,cuota:cuota||null});
 return {registrar:true,meses:{},items:[it("Moto","fijos","transporte"),it("Obra social","fijos","salud"),it("Facultad","fijos","otros"),it("Gimnasio","fijos","salud"),it("Gato","fijos","otros"),it("Psicóloga","fijos","salud"),it("Teléfono","fijos","servicios"),
  it("Monitor","cuotas","deudas",{total:6,inicio:"2026-06"}),it("Remera","cuotas","deudas",{total:3,inicio:"2026-09"}),it("Yogurtera","cuotas","deudas",{total:6,inicio:"2026-10"}),
  it("Amazon","subs","subs"),it("Gemini","subs","subs"),it("Google","subs","subs"),it("YouTube","subs","subs"),it("Claude","subs","subs"),it("Salidas","variables","ocio")]}}
D.fijos=load("fijos",null)||fijosSeed();KEY.fijos="fijos";
const monthDiff=(a,b)=>{const [y1,m1]=a.split("-").map(Number),[y2,m2]=b.split("-").map(Number);return (y2-y1)*12+(m2-m1)};
function cuotaN(it,k){if(!it.cuota)return null;return monthDiff(it.cuota.inicio,k)+1}
function fijosDelMes(k){return D.fijos.items.filter(it=>{if(!it.cuota)return true;const n=cuotaN(it,k);return n>=1&&n<=it.cuota.total})}
function fijosKey(){const f=FIN();try{return f?f.data().key:today().slice(0,7)}catch(e){return today().slice(0,7)}}
function renderFijos(){
 const el=$("#p-fijos");if(!el)return;const k=fijosKey();const [yy,mm]=k.split("-").map(Number);const mes=D.fijos.meses[k]||{pagado:{}};
 const L=fijosDelMes(k);const pag=L.filter(it=>mes.pagado[it.id]);
 const tot=L.reduce((s,it)=>s+(+it.monto||0),0),pagT=pag.reduce((s,it)=>s+(+(mes.pagado[it.id].monto??it.monto)||0),0);const sinMonto=L.filter(it=>!(+it.monto>0)).length;
 let h='<div class="pg-top"><div><h2 class="sec-h" style="margin:0">Gastos fijos de '+MESES[mm-1]+'</h2><span class="small muted">Completá los montos una vez y tildá cada uno cuando lo pagues. Los montos quedan para los meses siguientes.</span></div><div class="vact"><button class="btn primary" data-act="fijoNuevo">'+ico("plus")+" Agregar</button></div></div>";
 h+='<div class="card fx-sum"><div class="fx-top"><div><span class="eyebrow">Pagado</span><b class="num">'+pag.length+" de "+L.length+'</b></div><div><span class="eyebrow">Total del mes</span><b class="num">'+money(tot)+'</b></div><div><span class="eyebrow">Ya pagaste</span><b class="num pos">'+money(pagT)+'</b></div><div><span class="eyebrow">Falta pagar</span><b class="num'+(tot-pagT>0?" neg":"")+'">'+money(Math.max(0,tot-pagT))+'</b></div></div><div class="tr-bar"><i style="width:'+(L.length?pag.length/L.length*100:0).toFixed(1)+'%"></i></div>'+
  (sinMonto?'<p class="small muted" style="margin:8px 0 0">'+sinMonto+(sinMonto===1?" gasto todavía no tiene monto.":" gastos todavía no tienen monto.")+"</p>":"")+
  '<label class="fx-reg"><input type="checkbox" id="fxReg"'+(D.fijos.registrar?" checked":"")+'> Al tildar, sumarlo a mis gastos del mes</label></div>';
 FIJOS_GRUPOS.forEach(([g,gl])=>{const items=L.filter(it=>(it.grupo||"fijos")===g);if(!items.length)return;const gt=items.reduce((s,it)=>s+(+it.monto||0),0),gp=items.filter(it=>mes.pagado[it.id]).length;
  h+='<article class="card fx-group"><header class="card-head"><h2>'+gl+'</h2><span class="small muted num">'+gp+"/"+items.length+(gt?" · "+money(gt):"")+'</span></header><ul class="fx-list">'+items.map(it=>{const p=mes.pagado[it.id];const n=cuotaN(it,k);
   return '<li class="fx-row'+(p?" done":"")+'"><button class="chk'+(p?" on":"")+'" data-act="fijoCheck" data-id="'+it.id+'" aria-pressed="'+(!!p)+'" aria-label="'+(p?"Marcar como no pagado":"Marcar como pagado")+": "+esc(it.nombre)+'">'+ico("check",3)+'</button><button class="fx-name" data-act="fijoEdit" data-id="'+it.id+'"><span>'+esc(it.nombre)+"</span>"+(n?'<small class="num">Cuota '+n+"/"+it.cuota.total+(n===it.cuota.total?" · última":"")+"</small>":"")+(p&&p.fecha?'<small>Pagado '+fmtDay(p.fecha).toLowerCase()+"</small>":"")+'</button><label class="fx-amt"><span class="sr">Monto de '+esc(it.nombre)+'</span><input type="number" inputmode="decimal" min="0" step="any" id="fx-'+it.id+'" data-fijo="'+it.id+'" value="'+(it.monto??"")+'" placeholder="Monto"></label></li>'}).join("")+"</ul></article>"});
 if(!L.length)h+='<p class="empty">No hay gastos fijos para este mes. Agregá el primero con el botón de arriba.</p>';
 el.innerHTML=h;
}
function fijoCheck(id){
 const k=fijosKey(),it=D.fijos.items.find(x=>x.id===id);if(!it)return;const mes=D.fijos.meses[k]=D.fijos.meses[k]||{pagado:{}};const f=FIN();
 if(mes.pagado[id]){const p=mes.pagado[id];delete mes.pagado[id];if(p.movId&&f){f.deleteItem(p.movId).catch(()=>{})}put("fijos");renderFijos();toast(it.nombre+": marcado como no pagado"+(p.movId?" y quitado de tus gastos":""));return}
 const t=today(),last=k+"-"+pad2(monthDays(k));const fecha=k===t.slice(0,7)?t:(k<t.slice(0,7)?last:k+"-01");
 const p={fecha,monto:+it.monto||0};
 if(D.fijos.registrar&&f&&p.monto>0){const n=cuotaN(it,k);const mid=uid();try{const cfg=f.cfg();const cat=cfg.categorias.some(c=>c.id===it.cat)?it.cat:f.classify(it.nombre);f.addItems([{id:mid,fecha,concepto:it.nombre+(n?" (cuota "+n+"/"+it.cuota.total+")":""),monto:p.monto,tipo:"gasto",cat,cuenta:cfg.cuentaDefault}]);p.movId=mid}catch(e){}}
 mes.pagado[id]=p;put("fijos");renderFijos();const L=fijosDelMes(k);const done=L.filter(x=>mes.pagado[x.id]).length;
 toast(done===L.length?"¡Pagaste todos los gastos fijos del mes!":it.nombre+" pagado"+(p.movId?". Lo sumé a tus gastos.":!(p.monto>0)?". Cargale el monto para que se sume a tus gastos.":""));
}
function fijoSheet(id){
 const f=FIN();const cfg=f?f.cfg():{categorias:[]};const it=id?D.fijos.items.find(x=>x.id===id):{nombre:"",grupo:"fijos",cat:"",monto:null,cuota:null};if(!it)return;const k=fijosKey();const n=cuotaN(it,k);
 openSheet({title:id?it.nombre:"Nuevo gasto fijo",html:()=>'<form class="form" id="sfFijo" autocomplete="off"><div class="field"><label for="fx-n">Nombre</label><input id="fx-n" name="nombre" required maxlength="50" value="'+esc(it.nombre)+'" placeholder="Ej.: Internet, Alquiler, Seguro"'+(id?"":" autofocus")+'></div>'+
  '<div class="frow"><div class="field"><label for="fx-m">Monto mensual</label><input type="number" id="fx-m" name="monto" min="0" step="any" inputmode="decimal" value="'+(it.monto??"")+'"></div><div class="field"><label for="fx-c">Categoría</label><select id="fx-c" name="cat"><option value="">Automática</option>'+cfg.categorias.filter(c=>!c.ahorro).map(c=>'<option value="'+esc(c.id)+'"'+(c.id===it.cat?" selected":"")+">"+esc(c.nombre)+"</option>").join("")+"</select></div></div>"+
  '<div class="field"><span class="flabel">Grupo</span><div class="chips">'+FIJOS_GRUPOS.map(([g,l])=>'<label><input type="radio" name="grupo" value="'+g+'"'+((it.grupo||"fijos")===g?" checked":"")+"><span>"+l+"</span></label>").join("")+"</div></div>"+
  '<div class="frow f-cuo"><div class="field"><label for="fx-cn">Cuota de este mes</label><input type="number" id="fx-cn" name="cn" min="1" max="120" value="'+(n||1)+'"></div><div class="field"><label for="fx-ct">Total de cuotas</label><input type="number" id="fx-ct" name="ct" min="1" max="120" value="'+(it.cuota?it.cuota.total:6)+'"></div></div>'+
  '<p class="small muted f-cuo" style="margin:0">Cada mes avanza sola una cuota. Cuando termina, deja de aparecer.</p>'+
  '<div class="sheet-actions">'+(id?delBtn("fijo",id):"")+'<span class="grow"></span><button type="button" class="btn" data-act="close">Cancelar</button><button class="btn primary">Guardar</button></div></form>',
 forms:{sfFijo(fd){const nombre=String(fd.get("nombre")||"").trim();if(!nombre)return;const grupo=fd.get("grupo")||"fijos";const m=fd.get("monto");
  const o={nombre,grupo,cat:fd.get("cat")||"",monto:m===""||m==null?null:Math.max(0,+m||0),cuota:null};
  if(grupo==="cuotas"){const cn=Math.max(1,Math.round(+fd.get("cn")||1)),ct=Math.max(cn,Math.round(+fd.get("ct")||cn));o.cuota={total:ct,inicio:addMonths(k+"-01",-(cn-1)).slice(0,7)}}
  if(id)Object.assign(it,o);else D.fijos.items.push(Object.assign({id:"f"+uid()},o));put("fijos");closeSheet();renderFijos();toast(id?"Guardado":"Gasto fijo agregado")}}});
}
window.CorchoFijosRender=()=>{try{renderFijos()}catch(e){}};


/* ================= FINANZAS: detalle de una categoría en el mes ================= */
function catDetail(id,tipo){
 const f=FIN();if(!f)return;const d=f.data();const cfg=d.cfg;tipo=tipo==="ingreso"?"ingreso":"gasto";
 const list=tipo==="ingreso"?(cfg.ingresos||[]):cfg.categorias;const c=list.find(x=>x.id===id)||{id,nombre:tipo==="ingreso"?"Otros ingresos":"Otros"};
 const [yy,mm]=d.key.split("-").map(Number);const n=monthDays(d.key);const t=today();const cur=d.key===t.slice(0,7);
 openSheet({title:c.nombre,html:()=>{
  const dd=f.data();const its=(dd.items||[]).filter(it=>(tipo==="ingreso"?it.tipo==="ingreso":it.tipo!=="ingreso")&&(it.cat||"otros")===id).sort((a,b)=>b.fecha.localeCompare(a.fecha)||String(b.id).localeCompare(String(a.id)));
  const tot=its.reduce((s,it)=>s+(+it.monto||0),0),lim=tipo==="gasto"?(+c.limite||0):0;const col=catColor(list,id);
  const byDay=Array(n).fill(0);its.forEach(it=>{const k=+it.fecha.slice(8,10);if(k>=1&&k<=n)byDay[k-1]+=+it.monto||0});const mx=Math.max(1,...byDay);
  const W=320,H=74,bw=W/n;let svg='<svg class="cd-bars" viewBox="0 0 '+W+" "+H+'" preserveAspectRatio="none" role="img" aria-label="'+(tipo==="ingreso"?"Ingresos":"Gastos")+' por día del mes">';
  byDay.forEach((v,i)=>{const h=v?Math.max(3,(H-14)*v/mx):0;svg+='<rect x="'+(i*bw+bw*.18).toFixed(2)+'" y="'+(H-12-h).toFixed(2)+'" width="'+(bw*.64).toFixed(2)+'" height="'+h.toFixed(2)+'" rx="1.2" fill="'+col+'"'+(cur&&i+1>parseISO(t).getDate()?' opacity=".3"':"")+"/>"});
  svg+='<line x1="0" x2="'+W+'" y1="'+(H-12)+'" y2="'+(H-12)+'" stroke="#26262B" stroke-width="1"/>';
  [1,10,20,n].forEach(dd2=>{svg+='<text x="'+((dd2-.5)*bw).toFixed(1)+'" y="'+(H-2)+'" text-anchor="middle" class="cd-ax">'+dd2+"</text>"});svg+="</svg>";
  let h='<p class="small muted" style="margin:-4px 0 12px">'+cap(MESES[mm-1])+" "+yy+" · "+(tipo==="ingreso"?"ingresos":"gastos")+"</p>";
  h+='<div class="cd-top"><div><span class="eyebrow">Total</span><b class="num">'+money(tot)+'</b></div><div><span class="eyebrow">Movimientos</span><b class="num">'+its.length+'</b></div><div><span class="eyebrow">Promedio</span><b class="num">'+(its.length?money(tot/its.length):"—")+"</b></div></div>";
  if(lim){const p=tot/lim;h+='<div class="cd-lim"><div class="tr-bar"><i style="width:'+Math.min(100,p*100).toFixed(1)+"%;background:"+(p>1?"var(--crit)":p>=.8?"var(--warn)":"var(--ink)")+'"></i></div><span class="small '+(p>1?"neg":"muted")+'">'+(p>1?"Te pasaste "+money(tot-lim)+" del límite de "+money(lim):"Te quedan "+money(lim-tot)+" de "+money(lim)+" ("+Math.round(p*100)+"% usado)")+"</span></div>"}
  h+='<div class="cd-chart"><span class="eyebrow">Día por día</span>'+svg+"</div>";
  if(!its.length)h+='<p class="empty">No hay '+(tipo==="ingreso"?"ingresos":"gastos")+" en esta categoría este mes.</p>";
  else{let curD=null;h+='<ul class="cd-list">';its.forEach(it=>{if(it.fecha!==curD){curD=it.fecha;const sum=its.filter(x=>x.fecha===curD).reduce((s,x)=>s+(+x.monto||0),0);h+='<li class="cd-day"><span>'+cap(fmtDay(curD))+'</span><span class="num">'+money(sum)+"</span></li>"}
   h+='<li><button class="cd-row" data-act="movEdit" data-id="'+esc(it.id)+'"><span class="cd-c">'+esc(it.concepto)+'<small>'+esc(nameIn(cfg.cuentas,it.cuenta)||"")+'</small></span><span class="num '+(tipo==="ingreso"?"pos":"")+'">'+(tipo==="ingreso"?"+":"−")+money(it.monto)+"</span></button></li>"});h+="</ul>"}
  h+='<div class="sheet-actions" style="margin-top:14px">'+(tipo==="gasto"?'<button class="btn" data-act="catEdit" data-id="'+esc(id)+'">'+ico("ajustes")+" Editar categoría y límite</button>":"")+'<span class="grow"></span><button class="btn primary" data-act="close">Listo</button></div>';
  return h}});
}

/* ================= render general ================= */
const R={hoy:renderHoy,tareas:renderTareas,habitos:renderHabitos,enfoque:renderEnfoque,entreno:renderEntreno,estudio:renderEstudio,recordatorios:renderRecordatorios,ajustes:renderAjustes};
let pending=false;
function render(){pending=false;badges();if(R[view])R[view]()}
function safeRender(){const a=document.activeElement;if(SH){badges();return}if(a&&a.closest&&a.closest(".view")&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)){pending=true;badges();return}render()}
document.addEventListener("focusout",()=>setTimeout(()=>{if(pending&&!SH){const a=document.activeElement;if(!(a&&a.closest&&a.closest(".view")&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)))render()}},50));

/* ================= acciones ================= */
const ACT={
 cierrePush:()=>cierreActivar(),
 cierreTest:()=>{const e=cierreEstado();notify("Cierre del día",cierreTxt(e),"cierre-prueba")},
 hyTm:()=>taskSheet(null,{due:addDays(today(),1)}),
 gcConnect:()=>{gcAuth().then(()=>gcLoadCals()).then(()=>{toast("Google Calendar conectado");gcFlushQueue();gcEnsure(gcMonthsNow(),true);render()}).catch(gcFail)},
 gcRefresh:()=>{(gcTokOk()?Promise.resolve():gcAuth()).then(()=>gcLoadCals()).then(()=>{gcFlushQueue();gcEnsure(gcMonthsNow(),true);render()}).catch(gcFail)},
 gcOff:b=>{if(!armed(b))return;gc={cache:{},queue:[],def:{}};gcSave();render();toast("Google Calendar desconectado")},
 gcEv:b=>gcEvSheet(b.dataset.id),
 gcToTask:b=>{const e=gcFind(b.dataset.id);if(!e)return;SH=null;taskSheet(null,{title:e.title,due:e.date,time:e.ad?"":e.time,notes:e.loc||""})},
 close:()=>closeSheet(),
 fijoCheck:b=>fijoCheck(b.dataset.id),
 fijoEdit:b=>fijoSheet(b.dataset.id),
 fijoNuevo:()=>fijoSheet(),
 catsMgr:()=>catsSheet(),
 catEdit:b=>catSheet(b.dataset.id||null,b.dataset.from==="mgr"),
 catVer:b=>{if(b.dataset.i!=null&&b.closest(".don-legend")){donSel=+b.dataset.i}catDetail(b.dataset.id,b.dataset.tipo||"gasto");if(b.closest(".don-legend"))renderFinDash()},
 donTipo:b=>{donTipo=b.dataset.v;donSel=null;renderFinDash()},
 donSel:b=>{const i=+b.dataset.i;donSel=donSel===i?null:i;renderFinDash()},
 donMes:b=>{const btn=$(+b.dataset.v<0?"#prevM":"#nextM");donSel=null;if(btn)btn.click()},
 movNuevo:b=>movSheet(b.dataset.v),
 movEdit:b=>movSheet(null,b.dataset.id),
 movTipo:b=>{if(!SH||!SH.keep)return;const fm=$("#sfMov");if(fm){const fd=new FormData(fm);SH.keep.monto=fd.get("monto")||"";SH.keep.concepto=fd.get("concepto")||"";SH.keep.fecha=fd.get("fecha")||SH.keep.fecha;SH.keep.cuenta=fd.get("cuenta")||SH.keep.cuenta}SH.keep.tipo=b.dataset.v;SH.keep.cat="";SH.title="Nuevo movimiento";drawSheet()},
 syncIn:()=>{window.CorchoSync&&window.CorchoSync.signIn()},
 syncOut:b=>{if(!armed(b))return;window.CorchoSync&&window.CorchoSync.signOut();toast("Sesión cerrada. Tus datos quedan en este dispositivo.")},
 syncNow:()=>{const S=window.CorchoSync;if(S)S.syncNow().then(()=>toast("Sincronizado"))},
 syncChoice:b=>{const S=window.CorchoSync;if(S&&S.chooseFirst){S.chooseFirst(b.dataset.v);closeSheet();toast(b.dataset.v==="nube"?"Usando los datos de la nube":"Subiendo los datos de este dispositivo")}},
 syncLater:()=>{try{localStorage.setItem("corcho-sync-later",today())}catch(e){}render()},
 tVista:b=>{tV=b.dataset.v;render()},
 tNav:b=>{const v=+b.dataset.v;if(!v){tD=null;tMini=null}else{const cur=tD||today(),m=tView();tD=m==="mes"?addMonths(cur,v):addDays(cur,m==="semana"?7*v:v);tMini=null}render()},
 tPick:b=>{tD=b.dataset.v;tMini=null;if(tView()==="lista"||tView()==="mes")tV="dia";render()},
 tPickDay:b=>{tD=b.dataset.v;tV="dia";render()},
 tMiniNav:b=>{const base=(tMini||(tD||today()).slice(0,7))+"-01";tMini=addMonths(base,+b.dataset.v).slice(0,7);render()},
 tPanel:b=>{tPanel=b.dataset.v;render()},
 tSlot:b=>taskSheet(null,{due:b.dataset.v,time:b.dataset.h||""}),
 pNuevo:()=>pagoSheet(),
 pEdit:b=>pagoSheet(b.dataset.id),
 pTarjeta:b=>tarjetaSheet(b.dataset.id),
 pPagar:b=>pagar(b.dataset.id,b.dataset.k),
 pDay:b=>{pSel=pSel===b.dataset.v?null:b.dataset.v;renderPagos()},
 pMesNav:b=>{const base=(pMes||today().slice(0,7))+"-01";pMes=addMonths(base,+b.dataset.v).slice(0,7);renderPagos()},
 goPagos:()=>{go("finanzas");const tb=$("#t-pagos");if(tb)tb.click()},
 finMovs:()=>{const tb=$("#t-movs");if(tb)tb.click()},
 menu:()=>{document.body.classList.contains("drawer-open")?closeDrawer():openDrawer()},
 menuClose:()=>closeDrawer(),
 tNew:()=>taskSheet(),
 tEdit:b=>taskSheet(b.dataset.id),
 tFilter:b=>{tF=b.dataset.v;render()},
 tToggle:b=>{const x=D.tareas.find(t=>t.id===b.dataset.id);if(!x)return;x.done=!x.done;x.doneAt=x.done?today():null;x.doneTs=x.done?Date.now():null;put("tareas");render();gcTouch("tarea",x.id);if(x.done)toast("Completaste: "+x.title)},
 hNew:()=>habitSheet(),
 hQuick:b=>habitSheet(null,b.dataset.v),
 hOpen:b=>habitSheet(b.dataset.id),
 hTap:b=>hTap(b.dataset.id),
 hDay:b=>hTap(b.dataset.id,b.dataset.v),
 hTrack:b=>hTap(b.dataset.id,b.dataset.v,true),
 hCell:b=>{const x=D.habitos.find(h=>h.id===b.dataset.id);if(!x)return;const d=b.dataset.v;if(d<(x.creado||d))x.creado=d;hTap(x.id,d,true)},
 hMes:b=>{const cur=today().slice(0,7);const k=hMes||cur;const [y,m]=k.split("-").map(Number);const dt=new Date(y,m-1+(+b.dataset.v),1);let nk=dt.getFullYear()+"-"+pad2(dt.getMonth()+1);if(nk>=cur)nk=null;hMes=nk;render()},
 hCat:()=>catalogSheet(),
 hDayNav:b=>{const v=+b.dataset.v,t=today();if(!v){hSel=null}else{const cur=hSel||t;let n=addDays(cur,v);if(n>=t)n=null;else if(n<addDays(t,-60))n=addDays(t,-60);hSel=n}render()},
 fMode:b=>{const T=D.enfoque.timer;T.mode=b.dataset.v;T.endAt=null;T.left=null;put("enfoque");render()},
 fMain:()=>{D.enfoque.timer.endAt?fPause():fStart();timerUI()},
 fReset:()=>{const T=D.enfoque.timer;T.endAt=null;T.left=null;put("enfoque");timerUI()},
 fSkip:()=>{const T=D.enfoque.timer;T.mode=T.mode==="work"?"short":"work";T.endAt=null;T.left=null;put("enfoque");render()},
 fCfg:()=>focusCfgSheet(),
 fQuick:()=>{const T=D.enfoque.timer;T.mode="work";T.left=null;fStart();go("enfoque")},
 ePomo:b=>{const T=D.enfoque.timer;if(b.dataset.id)T.label="m:"+b.dataset.id;else if(!(T.label||"").startsWith("m:")&&D.estudio.materias[0])T.label="m:"+D.estudio.materias[0].id;if(!T.endAt){T.mode="work";T.left=null}put("enfoque");if(SH){$("#sheet").hidden=true;document.body.classList.remove("noscroll");SH=null}go("enfoque")},
 gStart:b=>gStart(b.dataset.id),
 gRut:b=>routineSheet(b.dataset.id),
 gCardio:()=>cardioSheet(),
 gLog:b=>logSheet(b.dataset.id),
 gOk:b=>{const s=D.gym.activo.ejercicios[+b.dataset.i].series[+b.dataset.j];s.ok=!s.ok;put("gym");b.classList.toggle("on",s.ok);if(s.ok&&!restEnd){restEnd=Date.now()+90e3;gymUI()}},
 gAddSet:b=>{const e=D.gym.activo.ejercicios[+b.dataset.i];const l=e.series[e.series.length-1]||{reps:10,kg:""};e.series.push({reps:l.reps,kg:l.kg,ok:false});put("gym");render()},
 gDelSet:b=>{const e=D.gym.activo.ejercicios[+b.dataset.i];e.series.splice(+b.dataset.j,1);put("gym");render()},
 gRest:b=>{restEnd=Date.now()+(+b.dataset.v)*1000;restDone=0;gymUI()},
 gFinish:()=>gFinish(),
 eMat:()=>materiaSheet(),
 eOpen:b=>materiaSheet(b.dataset.id),
 eSes:b=>sesionSheet(b.dataset.id),
 eEx:b=>examenSheet(b.dataset.id),
 eTema:b=>{const m=materia(b.dataset.id);const x=m&&(m.temas||[]).find(t=>t.id===b.dataset.v);if(!x)return;x.ok=!x.ok;put("estudio");drawSheet()},
 rNew:()=>remSheet(),
 rEdit:b=>remSheet(b.dataset.id),
 rDone:b=>{const r=D.rec.find(x=>x.id===b.dataset.id);if(!r)return;r.hecho=!r.hecho;if(!r.hecho&&new Date(r.at).getTime()>Date.now())r.avisado=false;put("rec");render()},
 rPerm:()=>{if(!canNotify())return;try{Notification.requestPermission().then(p=>{if(p==="granted"){D.cfg.notif=true;put("cfg");toast("Notificaciones activadas")}else toast("No se activaron. Si estás en iPhone, primero instalá la app en la pantalla de inicio.");render()}).catch(()=>{toast("Este navegador no permite notificaciones acá.");render()})}catch(e){toast("Este navegador no permite notificaciones acá.")}},
 rOff:()=>{D.cfg.notif=false;put("cfg");render()},
 rTest:()=>notify("Así se ve un aviso de Corcho","Todo listo","test"),
 aTema:b=>{D.cfg.tema=b.dataset.v;put("cfg");applyTheme();render()},
 aExport:()=>exportAll(),
 kill:b=>{if(!armed(b))return;const w=b.dataset.what,id=b.dataset.id;
  if(w==="tarea"||w==="rec"||w==="pago")gcForget(gcItem(w,id));
  if(w==="tarea"){D.tareas=D.tareas.filter(x=>x.id!==id);put("tareas");closeSheet();toast("Tarea eliminada")}
  else if(w==="tareasHechas"){D.tareas=D.tareas.filter(x=>!x.done);put("tareas");render();toast("Tareas hechas borradas")}
  else if(w==="habito"){D.habitos=D.habitos.filter(x=>x.id!==id);put("habitos");closeSheet();toast("Hábito eliminado")}
  else if(w==="rutina"){D.gym.rutinas=D.gym.rutinas.filter(x=>x.id!==id);put("gym");closeSheet();toast("Rutina eliminada")}
  else if(w==="log"){D.gym.logs=D.gym.logs.filter(x=>x.id!==id);put("gym");closeSheet();toast("Registro eliminado")}
  else if(w==="gCancel"){D.gym.activo=null;restEnd=null;put("gym");render();toast("Entreno descartado")}
  else if(w==="gEx"){D.gym.activo.ejercicios.splice(+id,1);put("gym");render()}
  else if(w==="materia"){D.estudio.materias=D.estudio.materias.filter(x=>x.id!==id);D.estudio.examenes=D.estudio.examenes.filter(x=>x.materiaId!==id);D.estudio.sesiones=D.estudio.sesiones.filter(x=>x.materiaId!==id);put("estudio");closeSheet();toast("Materia eliminada")}
  else if(w==="examen"){D.estudio.examenes=D.estudio.examenes.filter(x=>x.id!==id);D.rec=D.rec.filter(r=>r.examenId!==id);put("estudio","rec");SH?drawSheet():render()}
  else if(w==="sesion"){D.estudio.sesiones=D.estudio.sesiones.filter(x=>x.id!==id);put("estudio");SH?drawSheet():render()}
  else if(w==="tema"){const m=materia(b.dataset.m);if(m){m.temas=m.temas.filter(x=>x.id!==id);put("estudio");drawSheet()}}
  else if(w==="pago"){D.pagos.items=D.pagos.items.filter(x=>x.id!==id);put("pagos");closeSheet();renderPagos();toast("Pago eliminado")}
  else if(w==="tarjeta"){D.pagos.tarjetas=D.pagos.tarjetas.filter(x=>x.id!==id);put("pagos");closeSheet();renderPagos();toast("Tarjeta eliminada")}
  else if(w==="cat"){const f=FIN();if(f){const nc=cfgCopy();nc.categorias=nc.categorias.filter(x=>x.id!==id);f.saveCfg(nc);toast("Categoría eliminada. Sus movimientos pasan a Otros.");if(b.dataset.from==="mgr")catsSheet();else closeSheet();renderFinDash()}}
  else if(w==="mov"){const f=FIN();if(f){f.deleteItem(id).then(()=>renderFinDash());closeSheet();toast("Movimiento borrado")}}
  else if(w==="fijo"){D.fijos.items=D.fijos.items.filter(x=>x.id!==id);put("fijos");closeSheet();renderFijos();toast("Gasto fijo eliminado")}
  else if(w==="rec"){D.rec=D.rec.filter(x=>x.id!==id);put("rec");closeSheet();toast("Recordatorio eliminado")}
  else if(w==="remHechos"){D.rec=D.rec.filter(x=>!x.hecho);put("rec");render()}
  else if(w==="todo"){const SY=window.CorchoSync;const done=()=>{try{Object.keys(localStorage).filter(k=>k.indexOf("corcho:")===0||k.indexOf("ldc:")===0).forEach(k=>localStorage.removeItem(k))}catch(e){}toast("Datos borrados. Recargando…");setTimeout(()=>location.reload(),800)};if(SY&&SY.user)SY.wipeRemote().then(done,done);else done()}
 }
};
const FORMS={
 hyQ(fd){const title=String(fd.get("title")||"").trim();if(!title){taskSheet(null,{due:today()});return}D.tareas.push({id:uid(),title,notes:"",due:today(),time:"",prio:3,area:"",done:false,created:today()});put("tareas");render();const i=$("#hyQt");if(i)i.focus();toast("Tarea agregada para hoy")},
 tqSF(fd){const title=String(fd.get("title")||"").trim();if(!title)return;D.tareas.push({id:uid(),title,notes:"",due:"",time:"",prio:3,area:"",done:false,created:today()});put("tareas");tPanel="sinfecha";render();const i=$("#tqSFt");if(i)i.focus();toast("Tarea agregada sin fecha")},
 tqForm(fd,f){const title=String(fd.get("title")||"").trim();if(!title){taskSheet();return}const d=fd.get("due");D.tareas.push({id:uid(),title,notes:"",due:d==="hoy"?today():d==="manana"?addDays(today(),1):"",time:"",prio:3,area:"",done:false,created:today()});put("tareas");render();const i=$("#tqTitle");if(i)i.focus();toast("Tarea agregada")},
 gAddExForm(fd){const n=String(fd.get("ex")||"").trim();if(!n)return;const last=lastFor(n);D.gym.activo.ejercicios.push({nombre:n,series:(last||[{reps:10,kg:""},{reps:10,kg:""},{reps:10,kg:""}]).map(s=>({reps:s.reps,kg:s.kg,ok:false}))});put("gym");render();const i=$("#gNewEx");if(i)i.focus()},
 rqForm(fd){const titulo=String(fd.get("titulo")||"").trim(),at=fd.get("at");if(!titulo){remSheet();return}if(!at){toast("Elegí fecha y hora.");return}D.rec.push({id:uid(),titulo,at,rep:"no",hecho:false,avisado:false});put("rec");checkRem();render();toast("Te aviso "+fmtDay(at.slice(0,10)).toLowerCase()+" a las "+at.slice(11,16))}
};
document.addEventListener("click",e=>{
 if(e.target.id==="sheet"){closeSheet();return}
 const b=e.target.closest("[data-go],[data-act]");if(!b)return;
 if(b.dataset.go){if(SH){$("#sheet").hidden=true;document.body.classList.remove("noscroll");SH=null}go(b.dataset.go);return}
 const f=ACT[b.dataset.act];if(f){e.preventDefault();f(b,e)}
});
document.addEventListener("submit",e=>{const f=e.target;if(SH&&SH.forms&&SH.forms[f.id]){e.preventDefault();SH.forms[f.id](new FormData(f),f);return}if(FORMS[f.id]){e.preventDefault();FORMS[f.id](new FormData(f),f)}});
document.addEventListener("keydown",e=>{const rb=e.target.closest&&e.target.closest('[role="button"][data-act]');if(rb&&(e.key==="Enter"||e.key===" ")){e.preventDefault();rb.click();return}if(e.key!=="Escape")return;if(SH)closeSheet();else closeDrawer()});
document.addEventListener("input",e=>{
 const el=e.target;
 if(el.dataset.gx!==undefined&&D.gym.activo){const ex=D.gym.activo.ejercicios[+el.dataset.gx];if(!ex)return;if(el.dataset.gs!==undefined){const s=ex.series[+el.dataset.gs];if(s)s[el.dataset.gf]=el.value}else ex[el.dataset.gf]=el.value;gymSaveSoon()}
});
document.addEventListener("change",e=>{
 const el=e.target;
 if(el.dataset&&el.dataset.cierre){const c=cierreCfg();if(el.dataset.cierre==="on"){c.on=el.checked;put("cfg");if(c.on)cierreActivar();else{toast("Aviso de cierre desactivado");render()}}else if(el.value){c.hora=el.value;put("cfg");try{localStorage.removeItem(CIERRE_K)}catch(x){}render();toast("Hora del aviso: "+c.hora)}return}
 if(el.dataset&&el.dataset.gccal!=null){const c=(gc.cals||[]).find(x=>x.id===el.dataset.gccal);if(c){c.on=el.checked;gc.cache={};gcSave();gcEnsure(gcMonthsNow(),true);render()}return}
 if(el.id==="gc-w"){gc.wcal=el.value;gcSave();toast("Guardado");return}
 if(el.dataset&&el.dataset.fijo){const it=D.fijos.items.find(x=>x.id===el.dataset.fijo);if(it){const v=el.value;it.monto=v===""?null:Math.max(0,+v||0);put("fijos");renderFijos()}return}
 if(el.id==="fxReg"){D.fijos.registrar=el.checked;put("fijos");toast(el.checked?"Al tildar se suman a tus gastos":"Al tildar solo se marcan como pagados");return}
 if(el.id==="fLabel"){D.enfoque.timer.label=el.value;put("enfoque");return}
 if(el.dataset.cfg){let v=el.value;if(el.dataset.n){v=Math.max(+el.min||0,Math.min(+el.max||999,Math.round(+v||0)))}D.cfg[el.dataset.cfg]=v;put("cfg");toast("Guardado");return}
 if(el.id==="aImport"&&el.files&&el.files[0]){importAll(el.files[0]);el.value=""}
});

/* ================= arranque ================= */
let lastDay=today();
setInterval(()=>{
 const T=D.enfoque.timer;if(T.endAt&&Date.now()>=T.endAt)fComplete();
 timerUI();gymUI();
 if(today()!==lastDay){lastDay=today();safeRender()}
},1000);
setInterval(checkRem,15000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden){checkRem();const T=D.enfoque.timer;if(T.endAt&&Date.now()>=T.endAt)fComplete();safeRender()}});
window.matchMedia("(prefers-color-scheme: dark)").addEventListener&&window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",applyTheme);
window.addEventListener("hashchange",()=>{const h=(location.hash||"").slice(1);if(VIEWS.includes(h)&&h!==view)go(h)});
function reloadData(){D.cfg=Object.assign(clone(DEF_CFG),load("ajustes",{}));D.tareas=load("tareas",[]);D.habitos=load("habitos",[]);const ef=load("enfoque",null);if(ef){const tm=D.enfoque.timer;D.enfoque=ef;if(tm&&tm.endAt&&!(ef.timer&&ef.timer.endAt))D.enfoque.timer=tm}D.gym=load("entreno",{rutinas:SEED_RUT,logs:[],activo:null});D.estudio=load("estudio",{materias:[],examenes:[],sesiones:[]});D.rec=load("recordatorios",[]);D.pagos=Object.assign({items:[],tarjetas:[],hist:[]},load("pagos",{}));D.fijos=load("fijos",null)||D.fijos;try{window.CorchoFin&&window.CorchoFin.reload()}catch(e){}if(SH){badges();return}safeRender();if(view==="finanzas"&&$("#p-pagos")&&!$("#p-pagos").hidden)renderPagos();if(view==="finanzas"&&$("#p-fijos")&&!$("#p-fijos").hidden)renderFijos()}
window.CorchoApp={go,render,reloadData};
/* estado de sincronización en la interfaz */
const SYNC_TXT={"sin-config":"Sin configurar","cargando":"Conectando…","desconectado":"Sin iniciar sesión","conectando":"Iniciando sesión…","sincronizando":"Sincronizando…","ok":"Sincronizado","error":"Error","sin-conexion":"Sin conexión"};
function syncIcon(){const S=window.CorchoSync;const st=S?S.state:"sin-config";$$(".sync-ic").forEach(b=>{b.dataset.st=st;b.title="Sincronización: "+(SYNC_TXT[st]||st);b.setAttribute("aria-label",b.title)})}
function syncCard(){const S=window.CorchoSync;
 if(!S||!S.available)return card("ajustes","Sincronización","",'<p class="small" style="margin:0">La sincronización todavía no está configurada. Por ahora tus datos se guardan solo en este dispositivo.</p>');
 const st=S.state,u=S.user;let body='<div class="sync-row"><span class="sync-dot" data-st="'+st+'"></span><b>'+(SYNC_TXT[st]||st)+"</b></div>";
 if(u)body+='<p class="small" style="margin:6px 0 0">Conectado como <b>'+esc(u.email||u.name||"tu cuenta")+'</b>. Lo que cargues acá aparece en todos tus dispositivos donde inicies sesión con esta cuenta.</p>'+(S.lastSync?'<p class="small muted" style="margin:4px 0 0">Última sincronización: '+new Date(S.lastSync).toLocaleString("es-AR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})+"</p>":"");
 else body+='<p class="small" style="margin:6px 0 0">Iniciá sesión con Google para guardar tus datos en la nube y verlos igual en el teléfono y en la computadora.</p>';
 if(S.error)body+='<p class="small neg" style="margin:8px 0 0">'+esc(S.error)+"</p>";
 const foot=u?'<button class="btn" data-act="syncNow">Sincronizar ahora</button><button class="btn" data-act="syncOut">Cerrar sesión</button>':(st==="cargando"||st==="sin-conexion"?"":'<button class="btn primary" data-act="syncIn">'+GOOGLE_G+" Iniciar sesión con Google</button>");
 return card("ajustes","Sincronización","",body,foot);}
const GOOGLE_G='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9h-4v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.8l4-3z"/><path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"/></svg>';
function syncChoiceSheet(){openSheet({title:"Ya tenés datos en la nube",html:()=>'<p style="margin-top:0">Tu cuenta ya tiene datos guardados de otro dispositivo, y este dispositivo también tiene datos propios. ¿Con cuáles querés quedarte?</p><p class="small muted">Si no estás seguro, primero descargá una copia de este dispositivo desde Ajustes.</p><div class="form"><button class="btn primary lg" data-act="syncChoice" data-v="nube">Usar los datos de la nube</button><button class="btn lg" data-act="syncChoice" data-v="dispositivo">Usar los datos de este dispositivo</button></div><p class="small muted" style="margin-bottom:0">Los datos que no elijas se reemplazan.</p>'})}
let syncPrevSt=null;
function onSyncChange(S){syncIcon();if(S.chooseFirst&&!(SH&&SH.title==="Ya tenés datos en la nube"))syncChoiceSheet();if(view==="ajustes"&&!SH)renderAjustes();if(view==="hoy"&&syncPrevSt!==S.state&&!SH)renderHoy();if(S.state==="ok"&&syncPrevSt==="conectando")toast("Sesión iniciada. Tus datos se sincronizan solos.");syncPrevSt=S.state}
if(window.CorchoSync)window.CorchoSync.onChange(onSyncChange);
syncIcon();
applyTheme();buildNav();
const h0=(location.hash||"").replace("#","");
go(VIEWS.includes(h0)?h0:"hoy");
checkRem();
const spl=$("#splash");if(spl){const wait=Math.max(0,1100-(performance.now?performance.now():0));setTimeout(()=>{spl.classList.add("out");setTimeout(()=>spl.remove(),600)},wait)}
})();
