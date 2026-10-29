/* ============================================================
   07 · EVENTOS (CLIQUES, CAMPOS, FORMULÁRIOS)
   Cada botão tem data-a="ação". Aqui está o que cada ação faz.
   ============================================================ */

document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,i=b.dataset.i;
 if(a==='L'){L(i);return}
 if(a==='tab'){TAB=i;show();return}
 if(a==='view'){VIEW=b.dataset.v;render();return}
 if(a==='copylink'){navigator.clipboard.writeText(link).then(()=>msg('Link copiado.'),()=>msg('Selecione e copie o link.'));return}
 if(a==='logx'){LOGX=!LOGX;render();return}
 if(a==='peek'){PEEK=true;render();clearTimeout(pt);pt=setTimeout(()=>{PEEK=false;render()},4000);return}
 if(a==='copy'){navigator.clipboard.writeText(S.log.slice(0,12).reverse().join('\n')).then(()=>msg('Copiado. Cole no chat do Roll20.'),()=>msg('Não foi possível copiar. Selecione o texto do diário.'));return}
 if(!isGM){
  if(a==='join')rq('join',{name:($('#jn').value.trim()||'Jogador')});
  else if(a==='raise')rq('raise',{v:+$('#rv').value,item:($('#ri').value||'').trim()});
  else if(a==='steal')rq('steal');
  else if(a==='d20')rq('d20',{v:+$('#d20').value});
  else if(a==='rename')rq('rename',{name:$('#nm').value.trim()});
  else if(['hit','stand','dhit','dstand'].includes(a))rq(a);
  return}
 const t=i==='d'?'d':+i,g=n=>{const el=document.querySelector(`[data-s="${n}"]`);return el?+el.value||0:0};
 if(a==='deal')deal();else if(a==='hit')hit();else if(a==='stand')stand();else if(a==='again')again();
 else if(a==='manual'){const v=+$('#mv').value;if(Number.isInteger(v)&&v>=1&&v<=10)hit(v);else return msg('Informe um valor de 1 a 10.')}
 else if(a==='del'){if(S.players[t].id===S.cru)S.cru='';S.players.splice(t,1)}
 else if(a==='turn')S.turn=t;
 else if(a==='give')give(t,g('g'+t));
 else if(a==='take')take(t);
 else if(a==='show')tg(t).show=!tg(t).show;
 else if(a==='raise')raise(t,g('r'+t));
 else if(a==='sdc')stealOp(t,'dc',+(document.querySelector('[data-s="dc'+t+'"]')||{}).value);else if(a==='sno')stealOp(t,'no');else if(a==='sok')stealOp(t,'ok');else if(a==='sfail')stealOp(t,'fail');else if(a==='scatch')stealOp(t,'catch');
 else if(a==='clear')S.log=[];
 else if(a==='acuse'){const p=S.players[t];if(S.acc===p.id)S.acc='';else{S.acc=p.id;lg(`${p.name} foi acusado de trapaça. Justifique-se!`)}}
 else if(a==='pardon'){const p=S.players.find(p=>p.id===S.acc);S.acc='';if(p)lg(`${p.name} se justificou. O jogo continua.`)}
 else if(a==='end')endGame();
 else if(a==='newgame')newGame();
 else return;
 commit()});
document.addEventListener('change',e=>{const t=e.target,f=t.dataset.f,i=+t.dataset.i;if(!isGM||!f)return;
 const between=S.phase==='setup'||S.phase==='reveal';
 if(f==='bet')S.players[i].bet=Math.max(1,Math.floor(+t.value)||1);
 else if(f==='note')S.players[i].note=t.value;
 else if(f==='chips')S.players[i].chips=Math.max(0,Math.floor(+t.value)||0);
 else if(f==='claim')S.players[i].claim=t.value===''?null:Math.max(0,Math.floor(+t.value)||0);
 else if(f==='auto')S.auto=t.checked;
 else if(f==='pass')S.passw=t.value.trim();
 else if(f==='coin')S.coin=(t.value.trim()||'Ouro').slice(0,16);
 else if(f==='max'){if(between)S.max=Math.min(99,Math.max(10,Math.floor(+t.value)||21));else msg('Só dá para mudar o limite entre rodadas.')}
 else if(f==='sig')S.sigilo=t.checked;
 else if(f==='banca'||f==='cru'){
  if(!between)msg('Só dá para mudar entre rodadas.');
  else{if(f==='banca')S.banca=t.checked;else S.cru=t.value;
   if(!S.banca)S.cru='';S.players.forEach(p=>{p.out=!!S.cru&&p.id===S.cru})}}
 commit()});
document.addEventListener('submit',e=>{e.preventDefault();const f=e.target;if(f.id!=='add'||!isGM)return;
 const n=f.n.value.trim();if(!n)return;
 addP(n,null,true);f.n.value='';commit()});
