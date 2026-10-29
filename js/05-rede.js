// Substitua todo o trecho de peer.on('connection', c => { ... }) em js/05-rede.js por este:
peer.on('connection', c => {
 c.on('data', m => {
  if(!m || g !== G) return;

  // Tratamento para checagem prévia de senha
  if(m.t === 'check') {
   const badCheck = !!S.passw && m.pass !== S.passw;
   try { c.send({ t: badCheck ? 'deny' : 'ok' }); } catch(e) {}
   return;
  }

  // Tratamento quando o jogador entra de fato
  if(m.t === 'hello' && m.pid) {
   const badHello = !!S.passw && m.pass !== S.passw;
   if(badHello) {
    try { c.send({ t: 'deny' }); } catch(e) {}
    setTimeout(() => { try { c.close(); } catch(e) {} }, 300);
    return;
   }

   c.pid = m.pid;
   c.role = m.role === 'player' ? 'player' : 'audience';
   
   // Remove conexões antigas do mesmo usuário para evitar duplicidade
   conns = conns.filter(x => x.pid !== m.pid && x !== c);
   conns.push(c);

   // Se for jogador e ainda não estiver na lista da mesa, adiciona
   if(c.role === 'player' && !S.players.some(p => p.uid === m.pid)) {
    // Certifique-se de que a função addP existe no seu escopo global ou de regras
    if(typeof addP === 'function') {
     addP(String(m.name || 'Jogador').slice(0, 24), m.pid);
    }
   }
   
   commit();
  }
  else if(m.t === 'req' && c.pid) {
   proc(c.pid, m.r);
   commit();
  }
 });

 c.on('close', () => {
  conns = conns.filter(x => x !== c);
  if(g === G) render();
 });
 c.on('error', () => {});
});