/**
 * Servidor estático sem dependências (apenas Node.js nativo).
 *
 * Serve os arquivos desta pasta. Feito para plataformas que hospedam
 * processos (Discloud, Render, Railway, Fly.io) — todas injetam a porta
 * pela variável de ambiente PORT.
 *
 *   node server.js
 */

'use strict';

const http = require('node:http');
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { pipeline } = require('node:stream/promises');

const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

// Nomes que nunca devem ser servidos. A comparacao e feita em minusculas
// porque Windows e macOS tem sistema de arquivos insensivel a caixa: sem isso,
// /SERVER.JS escaparia da lista e entregaria o codigo-fonte.
const BLOCKED_NAMES = new Set([
  'server.js', 'discloud.config', 'package.json', 'package-lock.json',
  'node_modules', 'dockerfile', 'procfile',
]);

// Todo arquivo ou pasta iniciado por ponto e bloqueado por regra, o que cobre
// .git, .env, .gitignore e qualquer outro que apareca depois — enumerar um a um
// deixaria brechas. Excecao para .well-known, padrao de verificacao de dominio.
const DOTFILE_PERMITIDO = new Set(['.well-known']);

/** Bloqueia se QUALQUER segmento do caminho for proibido, nao apenas o primeiro. */
function isBlocked(relative) {
  return relative.split(path.sep).some(function (segmento) {
    const nome = segmento.toLowerCase();
    if (nome.startsWith('.') && !DOTFILE_PERMITIDO.has(nome)) return true;
    return BLOCKED_NAMES.has(nome);
  });
}

/**
 * Converte a URL recebida em um caminho absoluto seguro dentro de ROOT.
 * Retorna null se a requisição tentar escapar da pasta (path traversal).
 */
function resolveSafePath(requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  } catch {
    return null; // percent-encoding inválido
  }

  if (pathname.includes('\0')) return null;
  if (pathname.endsWith('/')) pathname += 'index.html';

  const absolute = path.resolve(ROOT, '.' + pathname);
  const relative = path.relative(ROOT, absolute);

  // Fora da raiz, ou subindo com "..": rejeita.
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;

  if (isBlocked(relative)) return null;

  return absolute;
}

// "no-cache" nao significa "nao cacheie" — significa "cacheie, mas revalide
// sempre". Com o ETag, a revalidacao custa um 304 vazio.
//
// Vale para TUDO, inclusive imagens. O padrao seria cachear imagem por dias,
// mas isso pressupoe nomes versionados (logo.a1b2c3.png), que um site sem
// build nao tem. Sem isso, trocar o logotipo deixaria visitantes recorrentes
// vendo o antigo ate o cache expirar. A pagina carrega duas imagens — o
// monograma (33 KB) e a assinatura do rodape do tema vigente (77 ou 50 KB):
// pagar dois 304 por visita e mais barato que servir conteudo velho.
function cacheControlFor() {
  return 'no-cache';
}

function sendError(res, status, message) {
  // Cores espelham os tokens de styles.css (tema escuro). Se a paleta mudar,
  // atualize aqui: esta pagina e autonoma e nao carrega o CSS do site.
  const body = `<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<title>${status}</title>
<body style="font:16px/1.6 system-ui,sans-serif;background:#08090d;color:#f2f2f3;
display:grid;place-items:center;height:100vh;margin:0;text-align:center">
<div><h1 style="font-size:3rem;margin:0 0 .5rem">${status}</h1>
<p style="color:#a4aab8">${message}</p>
<p><a href="/" style="color:#767ffd">Voltar ao início</a></p></div>`;

  res.writeHead(status, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

async function handle(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }

  const filePath = resolveSafePath(req.url);
  if (!filePath) return sendError(res, 403, 'Acesso negado.');

  let stats;
  try {
    stats = await fsp.stat(filePath);
  } catch {
    return sendError(res, 404, 'Página não encontrada.');
  }

  // Diretório sem barra final: redireciona para a versão canônica.
  if (stats.isDirectory()) {
    const location = new URL(req.url, 'http://localhost').pathname + '/';
    res.writeHead(301, { Location: location });
    return res.end();
  }

  const ext = path.extname(filePath).toLowerCase();
  const etag = `W/"${stats.size}-${stats.mtimeMs}"`;

  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304);
    return res.end();
  }

  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': stats.size,
    'Cache-Control': cacheControlFor(),
    ETag: etag,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });

  if (req.method === 'HEAD') return res.end();

  try {
    await pipeline(fs.createReadStream(filePath), res);
  } catch {
    res.destroy(); // cliente desconectou no meio do envio
  }
}

const server = http.createServer(function (req, res) {
  handle(req, res).catch(function (err) {
    console.error('Erro ao processar %s: %s', req.url, err.message);
    if (!res.headersSent) sendError(res, 500, 'Erro interno.');
    else res.destroy();
  });
});

server.listen(PORT, HOST, function () {
  console.log('Servindo %s em http://%s:%d', ROOT, HOST, PORT);
});

// Encerramento limpo — evita que a plataforma mate o processo à força.
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, function () {
    console.log('%s recebido, encerrando...', signal);
    server.close(function () { process.exit(0); });
  });
}
