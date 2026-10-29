# ApostasD20

Mesa de apostas online para RPG (jogo do 21 com dados d10), feita para jogar com o grupo durante as sessões no Roll20. O mestre cria a mesa, e jogadores e audiência entram pelo código (e senha, se houver).

Não precisa instalar nada nem ter servidor: é só HTML, CSS e JavaScript. A conexão entre as pessoas usa PeerJS (WebRTC), e o navegador do mestre funciona como servidor da mesa.

## Estrutura

```
ApostasD20/
├── index.html        Corpo da página (HTML) e os modelos de tela (<template>)
├── css/
│   └── style.css     Aparência (cores, mesa, cartas, botões)
└── js/               Comportamento (JavaScript), em ordem de carregamento
    ├── 01-estado.js      Estado da mesa (S), variáveis globais e utilitários
    ├── 02-jogos.js       Lista de jogos / abas (21, Pôquer, ...)
    ├── 03-tela-mesa.js   Desenho da mesa: show(), build21(), render()
    ├── 04-regras.js      Regras do 21, apostas, trapaça, acusação
    ├── 05-rede.js        Conexão online: startHost(), startPlayer(), viewFor(), commit()
    ├── 06-entrada.js     Telas de entrada: menu, criar mesa, ingressar
    ├── 07-eventos.js     O que cada botão e campo faz (data-a="...")
    └── 08-iniciar.js     Abre a tela inicial
```

## Onde mexer para...

| Quero mudar... | Arquivo |
|---|---|
| Cores, fontes, tamanho das cartas | `css/style.css` (seção 1 = cores) |
| Texto de uma tela de entrada (menu, criar, ingressar) | `index.html`, dentro dos `<template>` |
| Texto ou layout da mesa e dos painéis | `js/03-tela-mesa.js` (função `render`) e o `<template id="tpl-mesa21">` |
| Regras do 21 (limite, pagamento, banca) | `js/04-regras.js` |
| Trapaça (roubar), acusação, fim de jogo | `js/04-regras.js` (`stealOp`, `boost`, `endGame`) |
| O que cada jogador pode ver (cartas escondidas) | `js/05-rede.js` (`viewFor`) e `seeX` em `js/03-tela-mesa.js` |
| Senha, código da sala, entrada de jogadores | `js/05-rede.js` e `js/06-entrada.js` |
| Ação de um botão | `js/07-eventos.js` (cada botão tem `data-a="nome"`) |

## Como as peças conversam

1. O mestre clica em **Criar mesa** e vira o servidor (`startHost`). O estado completo da mesa fica na variável `S`.
2. Jogadores e audiência conectam (`startPlayer`) e enviam **pedidos** (pedir carta, parar, aumentar aposta, roubar). Só o mestre executa as regras (`proc` em `04-regras.js`).
3. A cada mudança, `commit()` salva a mesa no navegador do mestre, redesenha a tela e envia a cada pessoa uma **cópia filtrada** do estado (`viewFor`): ninguém recebe as cartas que não pode ver nem as anotações do mestre.
4. `render()` desenha a tela de acordo com o papel de quem está olhando: mestre, visão da mesa, jogador ou audiência.

## Adicionar um jogo novo (ex.: Pôquer)

1. Em `js/02-jogos.js`, troque o item do jogo para `{id:'poker', name:'Pôquer', build:()=>buildPoker()}`.
2. Crie os arquivos do jogo (por exemplo `js/09-poker.js`) com a tela e as regras e inclua o `<script>` no `index.html`, **depois** dos arquivos existentes.
3. O estado do novo jogo pode ficar em campos novos dentro de `S`, para ser salvo e enviado pela rede como o do 21.

## Observações importantes

- **Os scripts compartilham as mesmas variáveis globais.** A ordem das tags `<script>` no `index.html` importa: não mude sem testar.
- Não abra o `index.html` direto do computador para testar o online. O link da mesa depende do endereço do site. Use o GitHub Pages ou rode `python3 -m http.server` na pasta e abra `http://localhost:8000`.
- Depois de atualizar arquivos no GitHub, force a recarga no navegador (Ctrl+F5).

## Publicar no GitHub Pages

1. Envie todos os arquivos e pastas deste projeto para o repositório (`index.html` na raiz, mais as pastas `css` e `js`).
2. Em **Settings → Pages**, escolha **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
3. Em 1 ou 2 minutos o site abre em `https://SEU-USUARIO.github.io/NOME-DO-REPOSITORIO/`.
