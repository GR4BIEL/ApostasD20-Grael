/* ============================================================
   01 · ESTADO E UTILITÁRIOS
   Variáveis globais e o estado compartilhado da mesa (S).
   S.phase: 'setup' | 'turn' | 'dealer' | 'reveal' | 'over'
   S.players[]: { id, uid, npc, name, chips, claim, bet, item, cards[], st, res, note, out, show, cheat, steal }
   S.dealer: { cards[], st, show }   (a banca)
   Papéis: isGM (mestre) / MYROLE 'player' ou 'audience'; VIEW 'gm' ou 'mesa' (visão do mestre).
   ============================================================ */

const $=s=>document.querySelector(s),d10=()=>1+Math.floor(Math.random()*10),sum=c=>c.reduce((a,b)=>a+b,0);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let S={passw:'',max:21,coin:'Ouro',sigilo:true,banca:true,cru:'',acc:'',auto:true,over:'',secret:[],phase:'setup',turn:0,players:[],dealer:{cards:[],st:'wait'},log:[],seen:{}};
let TAB='21',VIEW='gm',isGM=false,uid=null,MYROLE='',MYNAME='',MYPW='',MYFRESH=false,HID='',code='',ready=false,loaded=false,LOGX=false,PEEK=false,pt=null,timer=null,reqN=Date.now()*1000;
const role=()=>isGM?VIEW:(MYROLE==='audience'?'audience':'player');
const tg=t=>t==='d'?S.dealer:S.players[t];
const lg=t=>S.log.unshift(t),sec=t=>{S.secret=[t,...(S.secret||[])].slice(0,10)};
const msg=t=>{const m=$('#msg');if(!m)return;m.textContent=t;setTimeout(()=>{m.textContent=''},3500)};
