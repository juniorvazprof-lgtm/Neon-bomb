# Bomba Neon 84

Jogo de bombas em 3D com estética synthwave, feito para celular em tela vertical e rodando direto no navegador. Você enfrenta 3 robôs numa run de 3 arenas, com roleta de regras, melhorias roguelike, bombas que explodem no compasso da música, chute, arremesso e fantasmas que voltam ao jogo.

## Como rodar

O jogo é só HTML, CSS e JavaScript, sem etapa de build. As bibliotecas (Three.js r128 e o bloom) e as fontes vêm de CDN, então é preciso internet.

- **No computador:** abra a pasta com um servidor local, por exemplo `python3 -m http.server 8000`, e acesse `http://localhost:8000`. Abrir o `index.html` com dois cliques também funciona na maioria dos navegadores.
- **No GitHub Pages:** suba a pasta para um repositório, vá em *Settings → Pages*, escolha a branch `main` e a pasta `/ (root)`. O jogo fica em `https://juniorvazprof-lgtm.github.io/Neon-bomb/`.

## Estrutura

```
index.html        telas e elementos da interface
css/style.css     visual do HUD, menus e controles
js/config.js      regras da roleta, melhorias e textos em PT/EN
js/render.js      cena 3D, texturas, bloom, partículas e efeitos
js/audio.js       as 5 músicas sintetizadas e os efeitos sonoros
js/state.js       estado do jogo e modelos dos personagens
js/arena.js       montagem da arena e posição inicial
js/mechanics.js   bombas, compasso, chute, arremesso, itens, mortes e fantasmas
js/ai.js          inteligência dos robôs
js/entities.js    movimento e animação dos personagens
js/loop.js        loop principal, câmera e qualidade adaptativa
js/ui.js          roleta, escolha de melhorias e fim de run
js/input.js       direcional, botão de bomba e teclado
js/main.js        inicialização
```

Os scripts são carregados em ordem no `index.html` e compartilham o mesmo escopo global, então a ordem importa.

## Onde mexer

| Quero mudar… | Arquivo | O que procurar |
|---|---|---|
| Regras da roleta | `js/config.js` | `MODS` e `MODS_EN` |
| Melhorias entre arenas | `js/config.js` | `UPS` e `UPS_EN` |
| Textos e traduções | `js/config.js` | `I18N` |
| Músicas | `js/audio.js` | `SONGS` (bpm, acordes, padrões) |
| Tempo mínimo até a bomba explodir | `js/mechanics.js` | `nextBoom` (`minA`) |
| Duração do fogo | `js/mechanics.js` | `fireT[i]=` e `spawnFire(` dentro de `explode` |
| Itens dos blocos e chance de cair | `js/render.js` / `js/mechanics.js` | `PU` (pesos `w`) e `dropPU` |
| Dificuldade dos robôs | `js/arena.js` | `react`, `aggr`, `mistake` em `spawnEnts` |
| Morte súbita | `js/loop.js` | `G.time>60` |
| Intensidade do bloom e efeitos | `js/render.js` | `FXB`, `FXP`, `FXF` |
| Tamanho da arena | `js/config.js` | `W` e `H` (use números ímpares) |

## Controles

- **Celular:** direcional em cruz à esquerda, botão BOMBA à direita. Toque de novo na bomba embaixo de você para arremessá-la.
- **Teclado:** setas ou WASD para andar, espaço para bomba.

## Como alterar o código

Os arquivos estão na raiz do repositório, sem precisar extrair um ZIP. Use a tabela **Onde mexer** para localizar a parte do jogo que deseja mudar.

- **Pelo GitHub:** abra o arquivo, clique em **Edit this file** (ícone de lápis), faça as alterações e salve com **Commit changes**.
- **No computador:** clone com `git clone https://github.com/juniorvazprof-lgtm/Neon-bomb.git`, abra a pasta no seu editor e rode o servidor local descrito acima. Depois, registre e envie suas mudanças com Git.
- Para mudanças maiores, use uma branch e um pull request. O histórico de commits permite comparar versões e recuperar alterações anteriores.
