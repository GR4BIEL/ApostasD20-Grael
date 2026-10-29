/* ============================================================
   06 · TELAS DE ENTRADA
   Menu, criar mesa, ingressar (código + senha), escolher jogador/audiência.
   O HTML dessas telas fica nos <template> do index.html.
   ============================================================ */

/* ---- telas de entrada ---- */
const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,20);
const HP='apostasd20-';
function showL(s){
 $('#tabs').style.display='none';
 $('#game').innerHTML='<div class="panel tela-entrada">'+document.getElementById('tpl-'+s).innerHTML+'<p class="tela-msg"><span id="msg" role="status"></span></p></div>';
 if(s==='mk')$('#mc').value=LS('mesaCode')||rid();
 if(s==='join')$('#jc').value=code;
 if(s==='who')$('#qcode').textContent=code;
 if(!window.Peer)msg('Não foi possível carregar a conexão online. Recarregue a página.')}
function create(){
 const cd=clean($('#mc').value),pw=($('#mp').value||'').trim(),fresh=$('#mf').checked;
 if(cd.length<3)return msg('O código precisa ter pelo menos 3 letras ou números.');
 code=cd;HID=HP+code;MYPW=pw;MYFRESH=fresh;LS('mesaCode',code);if(fresh)LS('mesaState:'+code,'');
 MYROLE='gm';tries=0;msg('Criando a mesa…');startHost()}
function checkMesa(){
 const cd=clean($('#jc').value),pw=($('#jp').value||'').trim(),NF='Mesa não encontrada. Confira o código ou espere o mestre criar a mesa.';
 if(cd.length<3)return msg('Digite o código da mesa.');
 code=cd;HID=HP+code;MYPW=pw;msg('Procurando a mesa…');
 const b=$('#jb');b.disabled=true;let done=false,opened=false;const pp=new Peer();
 const fin=(ok,t)=>{if(done)return;done=true;clearTimeout(to);try{pp.destroy()}catch(e){}if(ok)showL('who');else{msg(t);b.disabled=false}};
 const to=setTimeout(()=>fin(false,opened?'A mesa existe, mas não consegui conectar com o mestre. Pode ser bloqueio da rede, VPN ou antivírus (WebRTC). Tente outra rede, como 4G, e peça ao mestre para manter a aba aberta.':'Não consegui falar com o servidor de conexão. Confira a internet e recarregue a página.'),12000);
 pp.on('open',()=>{opened=true;const c=pp.connect(HID,{reliable:true});
  c.on('open',()=>c.send({t:'check',pass:pw}));
  c.on('data',m=>fin(!!m&&m.t==='ok','Senha incorreta.'))});
 pp.on('error',e=>fin(false,e.type==='peer-unavailable'?NF:'Falha de conexão: '+e.type))}
function pickRole(r){
 const n=($('#pn').value||'').trim();
 if(r==='player'&&!n)return msg('Digite o nome do seu personagem para entrar.');
 MYROLE=r;MYNAME=n;isGM=false;uid='me';enter();startPlayer()}
function L(i){
 if(i==='menu'||i==='mk'||i==='join')return showL(i);
 if(i==='create')return create();
 if(i==='check')return checkMesa();
 pickRole(i)}
function init(){
 const q=new URLSearchParams(location.search),c0=clean(q.get('sala')||(location.hash.match(/sala=([a-z0-9]+)/i)||[])[1]||'');
 if(c0){code=c0;HID=HP+code;showL('join')}else showL('menu')}
