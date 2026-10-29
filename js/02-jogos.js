/* ============================================================
   02 · LISTA DE JOGOS (ABAS)
   Para criar um jogo novo (ex.: Pôquer): adicione um item em GAMES
   com { id, name, build } e escreva a tela/regras em arquivos novos.
   ============================================================ */

/* Registro de jogos: para criar uma aba nova, adicione { id, name, build } (ou soon). */
const GAMES=[
{id:'21',name:'21',build:()=>build21()},
{id:'poker',name:'Pôquer',soon:'Cartas comunitárias, rodadas de aposta e blefe.'},
{id:'dados',name:'Dados de mentiroso',soon:'Copos, lances e o clássico “mentiroso!”.'}];
