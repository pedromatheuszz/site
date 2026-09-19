# Landing Page — Pedro Matheus da Silva Machado

Landing page pessoal de desenvolvedor web / engenheiro de software.
HTML, CSS e JavaScript puros — **sem build, sem dependências, sem node_modules**.

---

## Rodando localmente

Abrir o `index.html` direto no navegador funciona, mas o ideal é servir por HTTP
(o botão "copiar e-mail" usa a Clipboard API, que exige contexto seguro):

```bash
python -m http.server 4321
```

Depois acesse `http://localhost:4321`.

---

## Estrutura

```
.
├── index.html                      marcação, dividida por seções comentadas
├── server.js                       servidor estático, sem dependências
├── favicon.png                     ícone da aba
├── apple-touch-icon.png            ícone da tela inicial no iOS
└── assets/
    ├── css/styles.css              tokens, componentes, seções, breakpoints
    ├── js/script.js                tema, menu, scrollspy, reveal, form
    └── img/
        ├── logo-mark.png           monograma da nav
        ├── logo-wordmark.png       assinatura do rodapé, tema escuro
        ├── logo-wordmark-light.png assinatura do rodapé, tema claro
        ├── og-image.png            prévia ao compartilhar o link
        └── source/                 arquivos-fonte, não usados pela página
            ├── logo.png
            └── logo-original.png
```

**Três arquivos ficam na raiz de propósito:**

- `index.html` — é o entrypoint que a hospedagem procura;
- `server.js` — usa `ROOT = __dirname` e é iniciado com `node server.js`. Movê-lo
  para uma subpasta faria o servidor passar a servir **só aquela subpasta**;
- `favicon.png` e `apple-touch-icon.png` — as tags `<link>` apontam para eles,
  mas navegadores e o iOS ainda sondam `/favicon.ico` e `/apple-touch-icon.png`
  direto na raiz quando a tag falta ou falha. Custa pouco deixá-los lá.

A pasta `assets/img/source/` guarda os originais de 1,2 MB que a página não
carrega. Eles continuam **sendo publicados** junto com o resto — não há etapa de
build que os exclua. Se isso incomodar, acrescente `source` a `BLOCKED_NAMES` no
`server.js`, mas lembre que isso só vale para o `server.js`: numa hospedagem
estática como o Vercel, a pasta segue acessível.

---

## Projetos

A seção `<section id="projetos">` lista três projetos reais, com descrições
escritas a partir do que está nos repositórios:

| Card | Repositório |
|------|-------------|
| Adri Poltronas | `pedromatheuszz/Adri-Poltronas` |
| Routine | `pedromatheuszz/Routine` |
| pedromatheus.dev | `pedromatheuszz/pedromatheus-dev` |

Para adicionar um projeto, duplique o bloco `<article class="work">` inteiro —
o grid se ajusta sozinho. As capas usam três variantes de cor:
`work__cover--a` (azul da marca), `--b` (azure) e `--c` (indigo).

Todos os links de projeto abrem em nova aba e precisam de `rel="noopener"`.

---

## ⚠️ O que revisar antes de publicar

### 1. Domínio

`canonical`, `og:url` e `og:image` apontam para
`https://pedromatheus-dev-three.vercel.app/`. Se registrar um domínio próprio,
troque **os três** no `<head>` — o `og:image` é fácil de esquecer porque o
caminho dele mudou para `/assets/img/og-image.png` quando os arquivos foram
organizados em pastas. Ele precisa ser absoluto: crawlers de WhatsApp e
LinkedIn não resolvem caminho relativo.

### 2. Conferir os textos

Bio, serviços e processo foram escritos com base nas informações fornecidas.
Revise o tom e ajuste o que não corresponder à sua realidade — principalmente a
seção **Serviços**, que descreve o que você se propõe a entregar.

---

## WhatsApp

Número configurado: **(47) 99648-2391** → `+55 47 99648-2391` → `wa.me/5547996482391`.

Aparece em três lugares, **todos com a mesma URL**:

1. Botão principal na seção de contato (`.wa`)
2. Linha "WhatsApp" da ficha técnica, na seção Sobre
3. Botão flutuante, que surge após o hero e some quando o botão principal
   entra na tela

### Mensagem pré-preenchida

O parâmetro `?text=` é o que o **visitante envia para você** — não é uma
mensagem sua para ele. Por isso está escrita na voz do cliente:

> Olá, Pedro! Vi seu portfólio e gostei do seu trabalho. Tenho um projeto em
> mente e gostaria de conversar sobre ele.

Ela é curta de propósito: mensagens longas o visitante apaga antes de enviar.

Para mudar o texto, gere a URL codificada (não escreva os acentos direto no
`href`):

```bash
node -e "console.log(encodeURIComponent('Sua nova mensagem aqui'))"
```

Cole o resultado depois de `?text=` **nas três ocorrências** em `index.html`.
Elas precisam continuar idênticas.

### Trocar o número

Substitua `5547996482391` nos três links e o `telephone` no bloco JSON-LD.
O formato é país + DDD + número, só dígitos, sem `+` nem espaços.

> Publicar o número expõe ele a coleta automatizada e spam. É o padrão para
> quem vende serviço, mas vale saber.

---

## Formulário de contato

O envio abre o cliente de e-mail do visitante (`mailto:`) com assunto e corpo
já preenchidos. **Não há back-end** — nada é armazenado nem enviado a terceiros.

Se quiser recebimento direto na caixa de entrada sem depender do cliente de
e-mail do visitante, troque a lógica em `initForm()` (`script.js`) por um POST
para um serviço como Formspree, Web3Forms ou Resend.

O destinatário está em `script.js`:

```js
var DESTINATARIO = 'pedromatheusdasilva123@gmail.com';
```

---

## Identidade visual

### Arquivos gerados a partir do logotipo

| Arquivo | Tamanho | Onde é usado |
|---------|---------|--------------|
| `logo-mark.png` | 192×192 | Monograma no topo |
| `logo-wordmark.png` | 640×497 | Assinatura no rodapé, tema escuro |
| `logo-wordmark-light.png` | 640×497 | Assinatura no rodapé, tema claro |
| `logo.png` | 986×766 | Logotipo completo, para reuso |
| `og-image.png` | 1200×630 | Prévia ao compartilhar o link |
| `apple-touch-icon.png` | 180×180 | Ícone ao salvar na tela inicial |
| `favicon.png` | 64×64 | Ícone da aba |
| `logo-original.png` | 1254×1254 | Arquivo-fonte, não usado pela página |

O monograma é exibido a 36px e tem 192px justamente para não pesar: uma versão
512px ficava com 201 KB, mais que HTML, CSS e JS somados.

Todos foram recortados de `logo-original.png` (1254×1254). Para regerá-los
depois de alterar o logotipo, os recortes usados foram: monograma em
`x 320, y 223, 622×571` e logotipo completo em `x 137, y 227, 986×766`.
O recorte do monograma para propositalmente antes do texto, que começa em
`y ≈ 800`.

O monograma mantém o fundo escuro do logotipo **nos dois temas**. Isso é
intencional: o "P" é branco e sumiria sobre o papel claro. No tema claro ele
funciona como um selo.

#### Assinatura do rodapé

O rodapé traz o logotipo completo, e ali a saída do selo não serve: um bloco
preto de 260px no fim de uma página clara pesa demais. Por isso são **dois
arquivos**, trocados por CSS conforme o tema. Só um renderiza, então o `alt`
não se repete para quem usa leitor de tela.

Ambos têm fundo transparente. O `logo.png` de origem é opaco sobre preto, ou
seja, vem pré-multiplicado (`exibido = cor × alfa`); o alfa foi recuperado pelo
canal mais forte de cada pixel e a cor, dividida por ele. Recortar o preto por
limiar em vez disso deixaria franja escura nas bordas suavizadas.

Na variante clara, os pixels com saturação abaixo de 0.30 — o branco do nome e
do "P" — foram remapeados para a tinta `#0f1116`, e o azul, para o `#333dcf` do
tema claro. Os dois saem a 640px (2× do tamanho exibido) e quantizados em 128
cores: 77 KB e 50 KB, contra 528 KB do `logo.png` original.

### Paleta

As cores vieram dos pixels do próprio logotipo:

| Origem | Valor |
|--------|-------|
| Fundo do logotipo | `#000000` |
| Branco do logotipo | `#f2f2f3` |
| Azul da marca | `#3c48fc` |
| Gradiente do "M" | `#4f3afc` → `#3467f9` |

Os tokens ficam no topo do `styles.css`:

```css
[data-theme="dark"]  { --a1: #3c48fc; --a1-text: #767ffd; }
[data-theme="light"] { --a1: #333dcf; --a1-text: #333dcf; }
```

**Por que dois tokens de azul.** O azul da marca rende apenas 3.34:1 sobre o
fundo escuro, abaixo do mínimo de 4.5:1 da WCAG AA. `--a1` é usado em
preenchimentos (botões, ícones, o ponto das etapas), onde a exigência é menor;
`--a1-text` é uma variação clareada da mesma cor, com 5.90:1, usada em todo
texto. Se trocar um, ajuste o outro e remeça o contraste.

**Os três eixos vêm todos da logo.** `--a1` é o azul da marca, `--a2` o azure
e `--a3` o indigo — os extremos do gradiente do "M", amostrados dos pixels:
indigo `#483dfa` → azul `#4148fa` → azure `#316df9`.

Essa faixa cobre só ~25° de matiz, então três tons dentro dela encostam uns nos
outros. No tom puro, `--a3` ficava a ΔE 9.4 de `--a1` no tema escuro, perto
demais para separar as categorias das tags. `--a3-text` foi então clareado para
`#b3a3fe`, abrindo a distância pela luminosidade em vez do matiz: os três pares
passam de ΔE 20 sem sair da família da marca. **Ao mexer em um dos três, remeça
o ΔE entre todos os pares, não só o contraste.**

`--warn` (âmbar) e `--ok` (verde) ficam **de fora** da paleta da marca de
propósito. São cores semânticas: se o erro do formulário usasse o mesmo azul
dos acentos, a cor deixaria de sinalizar qualquer coisa.

`--brand-grad` é o gradiente do logotipo, reservado aos poucos elementos que
carregam a marca — botão primário e as réguas de seção. No tema escuro a parada
mais clara deixa o texto branco em 4.71:1, passando raspando no AA; no tema
claro as três paradas são escurecidas para 6.42:1.

O tema inicial segue a preferência do sistema operacional e é persistido em
`localStorage` sob a chave `pm-theme`. A meta tag `theme-color` lê `--bg` do
CSS em tempo de execução, então não precisa ser atualizada à mão.

---

## Cache

O `server.js` envia `Cache-Control: no-cache` em **tudo**, inclusive imagens.
Isso não desliga o cache: manda o navegador revalidar, e o ETag responde com um
304 vazio quando nada mudou.

O padrão da indústria seria cachear imagem por dias, mas isso pressupõe nomes
versionados (`logo.a1b2c3.png`), que um site sem build não tem. Sem isso, trocar
o logotipo deixaria quem já visitou vendo o antigo até o cache expirar.

Se publicar em GitHub Pages, Netlify ou Cloudflare, quem manda é a política
**deles**, não este arquivo. Nessas plataformas, a forma confiável de forçar
atualização de uma imagem é renomear o arquivo.

---

## Publicando

Por ser um site estático, qualquer uma destas opções serve — todas gratuitas:

- **GitHub Pages** — suba os arquivos num repositório e ative Pages em Settings;
- **Netlify / Vercel** — arraste a pasta na interface, ou conecte o repositório;
- **Cloudflare Pages** — conecte o repositório, sem build command.

Nenhuma exige etapa de build.

---

## Acessibilidade e SEO já implementados

- Estrutura semântica com landmarks (`header`, `main`, `section`, `footer`)
- Skip link para o conteúdo principal
- Estados de foco visíveis em todos os elementos interativos
- `aria-expanded`, `aria-pressed`, `aria-invalid` e `role="alert"` nos erros
- `prefers-reduced-motion` desativa animações e o scroll suave
- Progressive enhancement: as animações de entrada só escondem o conteúdo se a
  classe `.js` existir no `<html>`. Se o `script.js` não carregar ou o JS estiver
  desativado, a página aparece inteira. Há ainda um timeout de 2s que revela tudo
  caso o `IntersectionObserver` não dispare (aba aberta em segundo plano)
- Meta description, Open Graph, Twitter Card e JSON-LD (`schema.org/Person`)
- `lang="pt-BR"` e estilo de impressão dedicado

---

## Navegadores

Chrome, Edge, Firefox e Safari em versões recentes. Usa `color-mix()`,
`IntersectionObserver` e `backdrop-filter`; em navegadores antigos a página
continua legível, apenas sem os refinamentos visuais.
