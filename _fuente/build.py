import re,os,shutil
src=open('/home/claude/libro-de-caja.html').read()
style=re.search(r'<style>(.*?)</style>',src,re.S).group(1)
fin_css=style[style.index('.month-nav{'):style.index('#toast{')]
a=src.index('<div class="banner" id="setupBanner"'); b=src.index('</div>\n<div id="toast"')
fin_html=src[a:b]
fin_html=fin_html.replace('<section id="p-resumen">','<section id="p-resumen">\n<div id="finDash"></div>',1)
fin_html=fin_html.replace('<button class="btn" data-goto="ajustes">Ir a Ajustes</button>','<button class="btn" data-goto="ajustes">Configurar presupuesto</button>')
fin_html=fin_html.replace('Ingresos, límites y cuentas son un punto de partida. Cargá los tuyos para que las alertas sean precisas.','Ingresos, límites y cuentas son un punto de partida. Cargá los tuyos en Presupuesto para que las alertas sean precisas.')
fin_js=re.search(r'<script>(.*)</script>',src,re.S).group(1)
reps=[('document.querySelectorAll("nav.tabs button")','document.querySelectorAll("#finTabs button")'),
 ('return \'<div class="cat"><div class="cat-name">\'','return \'<div class="cat" data-act="catEdit" data-id="\'+esc(b.c.id)+\'" role="button" tabindex="0" aria-label="Editar \'+esc(b.c.nombre)+\'"><div class="cat-name">\''),
 ('["resumen","movs","ajustes"].forEach(p=>$("#p-"+p).hidden=p!==t);','["resumen","movs","ajustes","pagos"].forEach(p=>$("#p-"+p).hidden=p!==t);if(t==="pagos"&&window.CorchoPagosRender)window.CorchoPagosRender();if(t==="resumen"&&window.CorchoFinHook)window.CorchoFinHook();'),
 ('function lsSet(k,v){mem[k]=clone(v);try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}','function lsSet(k,v){mem[k]=clone(v);try{localStorage.setItem(k,JSON.stringify(v));window.CorchoSync&&window.CorchoSync.touch(k)}catch(e){}}'),
 ('  if(S.tab==="ajustes"&&!S.dirty)renderSettings();\n}','  if(S.tab==="ajustes"&&!S.dirty)renderSettings();\n  try{window.CorchoFinHook&&window.CorchoFinHook()}catch(e){}\n}'),('"ldc:config"','"corcho:fin:config"'),('"ldc:mes:"','"corcho:fin:mes:"'),('Pegalos en Resumen → Cargar movimientos','Pegalos en Resumen, en Cargar movimientos')]
for o,n in reps:
    assert o in fin_js,o; fin_js=fin_js.replace(o,n)
i=fin_js.rindex('})();')
fin_js=fin_js[:i]+'window.CorchoFin={fmt,saveCfg(c){S.cfg=c;S.cfgSaved=true;S.dirty=false;Store.saveConfig(S.cfg);renderAll();if(S.tab==="ajustes")renderSettings()},reload(){watchConfig();watchMonth();loadPrev(S.key)},cfg(){return S.cfg},classify,getMonth(k){return Store.getMonth(k)},data(){const r=calc();return {key:S.key,label:keyLabel(S.key),items:S.month.items||[],sa:saldoAnt(),cfg:S.cfg,disp:r.disp,gas:r.gas,ing:r.ing,alertas:alerts(r).length}},async addItems(arr){const g={};arr.forEach(p=>{const k=p.fecha.slice(0,7);(g[k]=g[k]||[]).push(p)});for(const k of Object.keys(g)){if(k===S.key){S.month.items=(S.month.items||[]).concat(g[k]);await saveMonth()}else{const d=(await Store.getMonth(k))||{saldoAnterior:null,items:[]};d.items=(d.items||[]).concat(g[k]);await Store.saveMonth(k,d)}}renderAll()},summary(){const r=calc();const A=alerts(r);return {disp:r.disp,ing:r.ing,gas:r.gas,mes:keyLabel(S.key),alertas:A.length,crit:A.filter(a=>a.k==="crit").length,top:A[0]?A[0].t:"",fmt}},refresh(){renderAll()}};\n'+fin_js[i:]
css=open('/home/claude/corcho-src/app.css').read().replace('/*FIN_CSS*/',fin_css)
js=open('/home/claude/corcho-src/app.js').read()
shell=open('/home/claude/corcho-src/shell.html').read()
out=shell.replace('/*SYNC_JS*/',open('/home/claude/corcho-src/sync.js').read()).replace('/*APP_CSS*/',css).replace('<!--FIN_HTML-->',fin_html).replace('/*FIN_JS*/',fin_js).replace('/*APP_JS*/',js)
os.makedirs('/home/claude/corcho-app',exist_ok=True)
open('/home/claude/corcho-app/index.html','w').write(out)
# vista previa para Claude: sin esqueleto propio ni archivos relativos
pv=out
pv=re.sub(r'^.*?<head>\s*','',pv,flags=re.S)
pv=pv.replace('</head>\n<body>\n','')
pv=re.sub(r'<meta charset[^>]*>\s*','',pv); pv=re.sub(r'<meta name="viewport"[^>]*>\s*','',pv)
pv=re.sub(r'<link rel="(manifest|icon|apple-touch-icon)"[^>]*>\s*','',pv)
pv=re.sub(r'<script>if\("serviceWorker".*?</script>\s*','',pv,flags=re.S)
pv=re.sub(r'<script src="firebase-config.js"></script>\s*','',pv)
pv=pv.replace('</body>\n</html>\n','')
pv=pv.replace('<title>Corcho App</title>','<title>Corcho App</title>\n<meta name="claude:viewport-fit-sides" content="cover">',1)
open('/home/claude/corcho-preview.html','w').write(pv)
print(len(out),len(pv))
