/* ============================================================
   03 · TELA DA MESA DE 21 (DESENHO)
   show(): troca de aba.  build21(): coloca o HTML do template #tpl-mesa21.
   render(): redesenha mesa, controles, opções e diário conforme o papel de quem está vendo.
   ============================================================ */

function show(){
 $('#tabs').innerHTML=GAMES.map(g=>`<button role="tab" aria-selected="${g.id===TAB}" data-a="tab" data-i="${g.id}">${g.name}${g.soon?' <small>(em breve)</small>':''}</button>`).join('');
 const g=GAMES.find(g=>g.id===TAB)||GAMES[0];
 if(g.build){g.build();render()}
 else $('#game').innerHTML=`<div class="panel"><h2>${g.name}</h2><p>${g.soon}</p><p>Este jogo ainda não tem regras. Jogadores, fichas e conexão online já são compartilhados entre as abas.</p></div>`}

function build21(){
$('#game').innerHTML=document.getElementById('tpl-mesa21').innerHTML}

function render(){
if(TAB!=='21')return;
if(!ready){$('#table').innerHTML='<p>Conectando à mesa…</p>';$('#ctrl').innerHTML='';return}
const R=role(),P=S.players,D=S.dealer,rv=S.phase==='reveal';
document.body.className='r-'+R;
if(!isGM&&!loaded){$('#table').innerHTML='<p>Aguardando o mestre abrir a mesa…</p>';$('#ctrl').innerHTML='';return}
const me=P.findIndex(p=>p.uid&&p.uid===uid),inRound=['turn','dealer'].includes(S.phase);
const pubv=(d,i)=>rv||!(S.sigilo||(d&&i===1&&S.phase!=='dealer'));
const seeX=(x,i,d)=>R==='gm'||x.show||pubv(d,i)||(R==='audience'&&i===0)||(R==='player'&&PEEK&&x.uid&&x.uid===uid);
const card=(x,v,i,d)=>{const s=seeX(x,i,d),pub=x.show||pubv(d,i);return`<div class="card${s?(R==='gm'&&!pub?' secret':''):' hid'}"><b>${s?v:''}</b></div>`};
const hand=(x,d)=>({html:x.cards.map((v,i)=>card(x,v,i,d)).join(''),tot:!x.cards.length?'':x.cards.every((_,i)=>seeX(x,i,d))?sum(x.cards):'?'});
const lab=(x,d,act)=>{
 if(rv&&!d)return{win:'Venceu',lose:'Perdeu',push:S.banca?'Empate':'Devolvido'}[x.res]||'';
 if(x.st==='play')return d?(S.phase==='dealer'?'Jogando':'Aguardando'):act?'Jogando':'Aguardando';
 if(['stand','bust','21'].includes(x.st))return(!rv&&!x.cards.every((_,i)=>seeX(x,i,d)))?'Terminou':(x.st==='stand'?'Parou':x.st==='bust'?'Estourou':'Fez '+S.max);
 return''};
const ops=t=>`<div class="ops"><select data-s="g${t}" aria-label="Valor da carta"><option value="">Sorteio</option>${Array.from({length:10},(_,n)=>`<option>${n+1}</option>`).join('')}</select><button class="btn" data-a="give" data-i="${t}">Dar carta</button><button class="btn" data-a="take" data-i="${t}">Tirar última</button><button class="btn" data-a="show" data-i="${t}">${tg(t).show?'Esconder':'Mostrar à mesa'}</button></div>`;
const ed=S.phase==='setup'||rv;
const seat=(p,i)=>{const act=S.phase==='turn'&&S.turn===i,h=hand(p,false),own=R==='player'&&p.uid===uid;
 return`<div class="seat${act?' on':''}"><div class="sh"><span>${esc(p.name)}${own?' (você)':''}${p.npc?' <small class="mute">NPC</small>':''}${S.acc===p.id?' <small>(acusado)</small>':''}</span>${R==='gm'&&ed?`<button class="x" data-a="del" data-i="${i}" aria-label="Remover ${esc(p.name)}">×</button>`:''}</div>
${p.out?'<div class="hand mute">Crupiê da mesa</div>':`<div class="hand">${h.html||'<span class="mute">sem cartas</span>'}</div><div class="info"><span class="tot">${h.tot}</span><span>${lab(p,false,act)}</span></div>`}
<div>${esc(S.coin)} ${p.claim!=null?p.claim:p.chips}${R==='gm'&&p.claim!=null?` <small class="mute">(de fato ${p.chips})</small>`:''}</div>${R==='gm'?`<div class="ops"><label>${esc(S.coin)} <input type="number" min="0" value="${p.chips}" data-f="chips" data-i="${i}"></label><label>Diz ter <input type="number" min="0" value="${p.claim!=null?p.claim:''}" placeholder="igual" data-f="claim" data-i="${i}"></label></div>`:''}
${p.out?'':`<div>Aposta ${R==='gm'&&ed?`<input type="number" min="1" value="${p.bet}" data-f="bet" data-i="${i}" aria-label="Aposta de ${esc(p.name)}">`:p.bet}${p.item?' + <em>'+esc(p.item)+'</em>':''}</div>`}${own&&!p.out?`<div class="ops"><input id="rv" type="number" min="0" value="10" aria-label="Valor da aposta"><input id="ri" type="text" placeholder="Item (opcional)" maxlength="60" aria-label="Item apostado" style="flex:1 1 100px"><button class="btn" data-a="raise" ${S.phase==='setup'||act?'':'disabled'}>Aumentar aposta</button></div>${S.phase==='setup'||act?'':'<small class="mute">Dá para aumentar antes da distribuição e na sua vez.</small>'}`:''}
${R==='gm'?`${!p.out&&S.phase==='turn'?`<div class="ops"><input type="number" min="1" value="10" data-s="r${i}" aria-label="Valor a aumentar"><button class="btn" data-a="raise" data-i="${i}">Aumentar aposta</button></div>`:''}${!p.out&&inRound?ops(i):''}<input class="note" placeholder="Anotação secreta do mestre" value="${esc(p.note||'')}" data-f="note" data-i="${i}" aria-label="Anotação sobre ${esc(p.name)}">${p.cheat?`<small>Trapaças: ${p.cheat}</small>`:''}<div class="ops"><button class="btn" data-a="acuse" data-i="${i}">${S.acc===p.id?'Retirar acusação':'Acusar de trapaça'}</button></div>${S.phase==='turn'&&p.st==='play'&&!act?`<button class="btn" data-a="turn" data-i="${i}">Dar a vez</button>`:''}`:''}</div>`};
const dh=hand(D,true),cn=(P.find(p=>p.id===S.cru)||{}).name;
$('#table').innerHTML=(S.banca?`<div class="dealer"><div class="sh" style="justify-content:center"><span>Banca${cn?' (crupiê: '+esc(cn)+')':''}</span></div><div class="hand">${dh.html||'<span class="mute">sem cartas</span>'}</div><div class="info" style="justify-content:center"><span class="tot">${dh.tot}</span><span>${lab(D,true)}</span></div>${R==='gm'&&inRound?ops('d'):''}</div>`:'<p style="text-align:center">Sem banca: jogador contra jogador.</p>')+`<div class="seats">${P.map(seat).join('')||'<p>Nenhum jogador. Sente alguém à mesa para começar.</p>'}</div>`;

let c='';
if(R==='mesa'){}else if(R==='player'){
 const p=P[me],mine=S.phase==='turn'&&me>=0&&S.turn===me;
 if(me<0)c=`<p class="now">Sente-se à mesa</p><p>Escreva o nome do seu personagem.${ed?'':' Você joga a partir da próxima rodada.'}</p><div class="row"><input id="jn" placeholder="Nome do personagem" aria-label="Nome do personagem" maxlength="24"><button class="btn pri" data-a="join">Sentar à mesa</button></div>`;
 else{
  c=`<p class="now">${p.out?'Você é o crupiê':mine?'É a sua vez':S.phase==='dealer'?'Vez da banca':rv?'Rodada encerrada':S.phase==='setup'?'Aguardando o mestre distribuir':'Aguarde a sua vez'}</p>`;
  if(!p.out)c+=`<div class="row"><button class="btn pri" data-a="hit" ${mine?'':'disabled'}>Pedir +1d10</button><button class="btn" data-a="stand" ${mine?'':'disabled'}>Parar</button></div>`;
  else c+=`<div class="row"><button class="btn pri" data-a="dhit" ${S.phase==='dealer'?'':'disabled'}>Banca pede +1d10</button><button class="btn" data-a="dstand" ${S.phase==='dealer'?'':'disabled'}>Banca para</button></div>`;
  if(!p.out){const s=p.steal&&p.steal.st;
   c+=!s?`<div class="row"><button class="btn" data-a="steal" ${inRound&&p.cards.length?'':'disabled'}>Roubar (avisar o mestre)</button><small class="mute">Fale com o mestre antes de trapacear.</small></div>`
   :s==='ask'?'<p class="mute">Você avisou o mestre. Aguarde ele definir o desafio.</p>'
   :s==='dc'?`<div class="row"><label>Resultado do D20 (Roll20) <input id="d20" type="number" min="1" max="20"></label><button class="btn" data-a="d20">Informar ao mestre</button></div>`
   :'<p class="mute">Resultado enviado. O mestre decide se ninguém percebeu.</p>'}
  c+=`${p.cards.length&&S.sigilo&&!rv&&!p.out?`<div class="row"><button class="btn" data-a="peek">${PEEK?'Escondendo em instantes…':'Espiar minhas cartas (4 s)'}</button><small class="mute">Só você vê.</small></div>`:''}<div class="row"><label>Seu nome <input id="nm" value="${esc(p.name)}" maxlength="24"></label><button class="btn" data-a="rename">Salvar nome</button></div>`}
}else if(R==='audience'){c='<p class="now">Você está assistindo</p><p class="mute">Você vê a mesa como os jogadores, sem agir.</p>'}else{
 if(S.phase==='setup')c=`<p>Defina as apostas nas cadeiras. Cada jogador recebe 2d10 ao distribuir.</p><button class="btn pri" data-a="deal" ${P.some(p=>!p.out)?'':'disabled'}>Distribuir 2d10</button>`;
 else if(inRound){const d=S.phase==='dealer';
  c=`<p class="now">${d?'Vez da banca':'Vez de '+esc((P[S.turn]||{}).name||'')}</p><div class="row"><button class="btn pri" data-a="hit">Pedir +1d10</button><button class="btn" data-a="stand">Parar</button></div>
<div class="row"><label>Valor rolado no Roll20 <input id="mv" type="number" min="1" max="10"></label><button class="btn" data-a="manual">Somar valor</button></div>`}
 else c=`<p>Rodada encerrada. Tudo acertado (${esc(S.coin)}).${S.auto?' Uma nova rodada começa sozinha em instantes.':''}</p><button class="btn pri" data-a="again">Nova rodada</button>`;
}
const stealH=R!=='gm'?'':P.map((p,i)=>{const s=p.steal;if(!s)return'';
 const h=s.st==='ask'?`<div class="row"><b>${esc(p.name)}</b> quer roubar. Desafio (CD) <input type="number" min="1" max="30" value="12" data-s="dc${i}" aria-label="CD"><button class="btn pri" data-a="sdc" data-i="${i}">Definir</button><button class="btn" data-a="sno" data-i="${i}">Negar</button></div>`
 :s.st==='dc'?`<p><b>${esc(p.name)}</b>: CD ${s.dc}. Aguardando o D20 dele.</p>`
 :`<p><b>${esc(p.name)}</b> tirou ${s.d20} contra CD ${s.dc}: ${s.d20>=s.dc?'sucesso':'falha'}.</p><div class="row"><button class="btn pri" data-a="sok" data-i="${i}">Funcionou: garantir ${S.max-1} ou ${S.max}</button><button class="btn" data-a="sfail" data-i="${i}">Falhou</button><button class="btn" data-a="scatch" data-i="${i}">Pego!</button></div>`;
 return`<div class="panel" style="margin:0 0 10px;background:var(--bg)">${h}</div>`}).join(''),
ac=P.find(p=>p.id===S.acc),ov=`<p class="now">Jogo encerrado</p><p>${esc(S.over||'')}</p>${R==='gm'?'<button class="btn pri" data-a="newgame">Nova partida</button>':''}`;
$('#ctrl').innerHTML=(ac&&S.phase!=='over'?`<p class="now">${esc(ac.name)} foi acusado de trapaça. Justifique-se!</p>${R==='gm'?'<div class="row"><button class="btn" data-a="pardon">Aceitar justificativa</button><button class="btn pri" data-a="end">Encerrar o jogo</button></div>':''}`:'')+stealH+(S.phase==='over'?ov:c)+(R==='gm'&&S.secret&&S.secret.length?`<details open><summary>Trapaças (só o mestre vê)</summary>${S.secret.map(x=>`<p>${esc(x)}</p>`).join('')}</details>`:'');
{const k=$('#ctrl');k.style.display=k.innerHTML.trim()?'':'none'}
if(R==='gm'||R==='mesa'){
 $('#opts').innerHTML=`<div class="seg"><button class="btn" data-a="view" data-v="gm" aria-pressed="${VIEW==='gm'}">Visão do mestre</button><button class="btn" data-a="view" data-v="mesa" aria-pressed="${VIEW==='mesa'}">Visão da mesa</button></div>
${R==='gm'?`<label class="chk"><input type="checkbox" data-f="sig" ${S.sigilo?'checked':''}> Cartas em sigilo (cada um vê só as suas; o mestre libera)</label>
<label class="chk"><input type="checkbox" data-f="banca" ${S.banca?'checked':''}> Banca ativa (jogadores contra a banca)</label><label class="chk"><input type="checkbox" data-f="auto" ${S.auto?'checked':''}> Reiniciar sozinho após cada rodada</label><label class="chk">Senha da mesa <input type="text" data-f="pass" value="${esc(S.passw||'')}" placeholder="sem senha" maxlength="40" style="width:130px"></label><label class="chk">Nome da moeda <input type="text" data-f="coin" value="${esc(S.coin)}" maxlength="16" style="width:130px"></label><label class="chk">Limite da mesa (21 é o padrão) <input type="number" data-f="max" min="10" max="99" value="${S.max}" style="width:80px"></label>
${S.banca?`<label class="chk">Quem conduz a banca <select data-f="cru"><option value="">Mestre</option>${P.map(p=>`<option value="${p.id}"${p.id===S.cru?' selected':''}>${esc(p.name)}</option>`).join('')}</select></label>`:''}`:''}`}
if(R==='gm'||R==='mesa'){const lk=$('#lk');if(lk)lk.innerHTML=link?`<p style="font-size:13px;margin-bottom:4px">Código da mesa: <b>${esc(code)}</b>${S.passw?' (com senha)':' (pública)'}. Conexão: ${peer&&peer.open?'ativa':'reconectando…'}. Link para jogadores e audiência. Mantenha esta aba aberta: ela é a mesa.</p><p class=\"mute\" style=\"font-size:13px;margin:0 0 4px\">Online: ${conns.filter(c=>c.open&&c.role==='player').length} jogadores, ${conns.filter(c=>c.open&&c.role==='audience').length} na audiência.</p><div class="row" style="margin-top:0"><input type="text" readonly value="${esc(link)}" aria-label="Link para os jogadores" style="flex:1"><button class="btn" data-a="copylink">Copiar link</button></div>`:'<p class="mute" style="font-size:13px">Conectando ao servidor da sessão…</p>'}
const L2=LOGX?S.log:S.log.slice(0,6);$('#lx').textContent=LOGX?'Ver menos':'Ver mais';$('#log').style.maxHeight=LOGX?'300px':'none';
$('#log').innerHTML=L2.map(l=>`<p>${esc(l)}</p>`).join('')||'<p>Nada aconteceu ainda.</p>';
}
