/* ============================================================
   04 · REGRAS DO 21 (SÓ O MESTRE EXECUTA)
   Distribuir, pedir/parar, apostas, revelar e pagar, trapaça (roubar), acusação e fim de jogo.
   proc(): aplica os pedidos que chegam dos jogadores pela rede.
   ============================================================ */

/* ---- regras (só o mestre executa) ---- */
const addP=(name,u,npc)=>S.players.push({id:'p'+Date.now()+Math.random().toString(36).slice(2,6),uid:u||null,npc:!!npc,name,chips:100,claim:null,bet:10,cards:[],st:'wait',res:'',note:'',out:false,show:false,cheat:0});
function deal(){const A=S.players.filter(p=>!p.out);if(!A.length)return;
 S.players.forEach(p=>{p.cards=p.out?[]:[d10(),d10()];p.st=p.out?'wait':'play';p.res='';p.show=false});
 S.dealer={cards:S.banca?[d10(),d10()]:[],st:S.banca?'play':'wait'};
 const stOf=x=>{const s=sum(x.cards);return s>S.max?'bust':s===S.max?'21':'play'};
 S.players.forEach(p=>{if(!p.out)p.st=stOf(p)});if(S.banca)S.dealer.st=stOf(S.dealer);
 S.phase='turn';S.turn=S.players.findIndex(p=>p.st==='play');
 lg(S.banca?'Nova mão: 2d10 para cada jogador e para a banca.':'Nova mão: 2d10 para cada jogador.');
 if(S.turn<0){S.turn=0;next()}}
function again(){S.players.forEach(p=>{p.cards=[];p.st='wait';p.res='';p.show=false;p.item='';p.steal=null});S.dealer={cards:[],st:'wait'};S.phase='setup';lg('Rodada encerrada. Façam suas apostas.')}
function fix(x){const s=sum(x.cards);x.st=s>S.max?'bust':s===S.max?'21':(x.st==='bust'||x.st==='21'?'play':x.st);adv()}
function adv(){
 if(S.phase==='turn'){const c=S.players[S.turn];if(!c||c.st!=='play')next()}
 else if(S.phase==='dealer'&&S.dealer.st!=='play')reveal()}
function next(){
 if(S.phase==='turn'){const n=S.players.length;
  for(let k=1;k<=n;k++){const i=(S.turn+k)%n;if(S.players[i].st==='play'){S.turn=i;return}}
  if(!S.banca||S.players.filter(p=>!p.out&&p.cards.length).every(p=>p.st==='bust'))return reveal();
  S.phase='dealer';lg('Todos jogaram. Agora é a vez da banca.');if(S.dealer.st!=='play')reveal()}
 else reveal()}
function hit(v){if(!['turn','dealer'].includes(S.phase))return;
 const D=S.phase==='dealer',x=D?S.dealer:S.players[S.turn];if(!x)return;const nm=D?'A banca':x.name;
 x.cards.push(v||d10());lg(`${nm} pediu uma carta.`);const s=sum(x.cards);
 if(s>=S.max)lg(S.sigilo?`${nm} terminou a jogada.`:(s>S.max?`${nm} estourou com ${s}.`:`${nm} fez ${S.max}!`));
 fix(x)}
function stand(){if(!['turn','dealer'].includes(S.phase))return;
 const D=S.phase==='dealer',x=D?S.dealer:S.players[S.turn];if(!x)return;
 x.st='stand';lg(`${D?'A banca':x.name} parou.`);adv()}
function give(t,v){const x=tg(t);if(!x||x.out||!['turn','dealer'].includes(S.phase))return msg('Só durante a rodada.');
 x.cards.push(v||d10());lg(`${t==='d'?'A banca':x.name} recebeu uma carta.`);fix(x)}
function take(t){const x=tg(t);if(!x||!x.cards.length||!['turn','dealer'].includes(S.phase))return msg('Nada para tirar agora.');
 x.cards.pop();lg(`${t==='d'?'A banca':x.name} perdeu a última carta.`);fix(x)}
function raise(i,v,item){const p=S.players[i];v=Math.floor(v)||0;item=String(item||'').trim().slice(0,60);if(!p||p.out||!(v>0||item))return;
 if(v>0)p.bet+=v;if(item)p.item=item;
 lg(`${p.name} aumentou a aposta${v>0?` para ${p.bet}`:''}${item?` e colocou na mesa: ${item}`:''}.`)}
function pay(p,d){p.chips+=d;if(p.claim!=null)p.claim+=d;
 if(p.chips<0){lg(`${p.name} perdeu mais do que tinha: o blefe foi descoberto!`);p.chips=0;p.claim=null}
 else if(p.claim!=null&&p.claim<0)p.claim=0}
function reveal(){
 S.phase='reveal';const A=S.players.filter(p=>!p.out&&p.cards.length),tx=p=>`${p.name} fez ${sum(p.cards)}${p.st==='bust'?' e estourou':''}`;
 if(S.banca){const dt=sum(S.dealer.cards),db=dt>S.max;lg(`A banca revela ${dt}${db?' e estourou':''}.`);
  A.forEach(p=>{const t=sum(p.cards),b=+p.bet||0;let r;
   if(p.st==='bust')r='lose';else if(db||t>dt)r='win';else if(t===dt)r='push';else r='lose';
   p.res=r;pay(p,r==='win'?b:r==='lose'?-b:0);
   lg(`${tx(p)}: ${r==='win'?'ganha '+b:r==='lose'?'perde '+b:'empate'}.`)})}
 else{const ok=A.filter(p=>p.st!=='bust'),best=Math.max(0,...ok.map(p=>sum(p.cards))),w=ok.filter(p=>sum(p.cards)===best),pot=A.reduce((s,p)=>s+p.bet,0);
  A.forEach(p=>{p.res=!w.length?'push':w.includes(p)?'win':'lose';
   if(w.length)pay(p,(w.includes(p)?Math.floor(pot/w.length):0)-p.bet);
   lg(`${tx(p)}.`)});
  lg(w.length?`Leva o pote de ${pot}: ${w.map(p=>p.name).join(', ')}.`:'Todos estouraram. As apostas voltam.')}}
function proc(by,r){
 const i=S.players.findIndex(p=>p.uid===by),p=S.players[i];
 if(r.a==='join'){if(!p)addP(String(r.name||'Jogador').slice(0,24),by);return}
 if(S.phase==='over')return;
 if(!p)return;
 if(r.a==='rename'){const n=String(r.name||'').trim().slice(0,24);if(n)p.name=n;return}
 const mine=S.phase==='turn'&&S.turn===i;
 if(r.a==='hit'&&mine)hit();else if(r.a==='stand'&&mine)stand();
 else if(r.a==='raise'&&(S.phase==='setup'||mine))raise(i,+r.v,r.item);
 else if(r.a==='steal'&&!p.out&&!p.steal&&p.cards.length&&['turn','dealer'].includes(S.phase)){p.steal={st:'ask'};sec(`${p.name} quer roubar.`)}
 else if(r.a==='d20'&&p.steal&&p.steal.st==='dc'){const v=Math.floor(+r.v);if(v>=1&&v<=20){p.steal={st:'roll',dc:p.steal.dc,d20:v};sec(`${p.name} tirou ${v} no d20.`)}}
 else if(S.cru===p.id&&S.phase==='dealer'){if(r.a==='dhit')hit();if(r.a==='dstand')stand()}}

/* ---- trapaça e fim de jogo ---- */
function boost(i){const p=S.players[i];if(!p||!['turn','dealer'].includes(S.phase))return msg('Só durante a rodada.');
 const L=S.max,s=sum(p.cards);if(s>=L)return msg('Ele já está no limite.');
 const lo=Math.max(s+1,L-1),alvo=lo+Math.floor(Math.random()*(L-lo+1));let r=alvo-s;
 while(r>0){const v=Math.min(10,r);p.cards.push(v);r-=v}
 lg(`${p.name} pediu uma carta.`);fix(p);if(p.st==='play'){p.st='stand';adv()}}
function stealOp(i,op,dc){const p=S.players[i];if(!p||!p.steal)return;const s=p.steal;
 if(op==='dc'&&s.st==='ask'){p.steal={st:'dc',dc:Math.min(30,Math.max(1,Math.floor(dc)||12))};sec(`${p.name}: desafio definido (CD ${p.steal.dc}).`)}
 else if(op==='ok'&&s.st==='roll'){sec(`${p.name} roubou com sucesso (d20 ${s.d20}, CD ${s.dc}).`);p.cheat=(p.cheat||0)+1;p.steal=null;boost(i)}
 else if(op==='fail'&&s.st==='roll'){sec(`${p.name} falhou ao roubar (d20 ${s.d20}, CD ${s.dc}).`);p.steal=null}
 else if(op==='no'){p.steal=null}
 else if(op==='catch'){sec(`${p.name} foi pego roubando.`);p.steal=null;S.acc=p.id;lg(`${p.name} foi acusado de trapaça. Justifique-se!`)}}
function endGame(){const p=S.players.find(p=>p.id===S.acc);S.phase='over';S.over=`${p?p.name:'Alguém'} foi pego trapaceando e não conseguiu se justificar. Fim de jogo.`;S.acc='';lg(S.over)}
function newGame(){S.players.forEach(p=>{p.cards=[];p.st='wait';p.res='';p.show=false;p.cheat=0;p.item='';p.steal=null});S.dealer={cards:[],st:'wait'};S.phase='setup';S.over='';S.acc='';S.secret=[];lg('Nova partida. Façam suas apostas.')}
