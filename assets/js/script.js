/**
 * Pedro Matheus da Silva Machado — Landing Page
 * Sem dependências. Cada bloco é independente e falha de forma silenciosa
 * apenas se o elemento correspondente não existir na página.
 */

(function () {
  'use strict';

  var THEME_KEY = 'pm-theme';
  var REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Tema (claro / escuro) — persistido em localStorage
     --------------------------------------------------------------------- */

  function readStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (err) {
      return null; // modo privado / storage bloqueado
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      /* preferência não persiste — comportamento aceitável */
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    var toggle = document.getElementById('theme-toggle');
    if (toggle) toggle.setAttribute('aria-pressed', String(theme === 'light'));

    // Lê a cor do próprio CSS em vez de repeti-la aqui: a paleta tem uma única
    // fonte de verdade, e mudar os tokens não deixa esta meta tag para trás.
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    var bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    if (bg) meta.setAttribute('content', bg);
  }

  function initTheme() {
    var stored = readStoredTheme();
    var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(stored || (prefersLight ? 'light' : 'dark'));

    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      storeTheme(next);

      // A assinatura do rodapé tem uma imagem por tema, e a do tema inativo
      // nasce em display:none. Uma <img loading="lazy"> escondida assim nunca
      // entra no cálculo de viewport do navegador: quando o CSS a revela, ela
      // continua sem carregar, e nem rolar a página depois a traz — fica um
      // buraco no rodapé. Trocar para eager dispara o download.
      //
      // Só aqui, e não em applyTheme: applyTheme também roda na carga inicial,
      // e ali a imagem do tema vigente já está visível desde o parse, com o
      // lazy-load funcionando normalmente. Marcá-la eager na carga faria o
      // rodapé baixar antes mesmo de o visitante rolar a página.
      var assinatura = document.querySelector('.footer__wordmark--' + next);
      if (assinatura) assinatura.loading = 'eager';
    });
  }

  /* ---------------------------------------------------------------------
     Menu mobile
     --------------------------------------------------------------------- */

  function initMenu() {
    var burger = document.getElementById('burger');
    var menu = document.getElementById('menu');
    if (!burger || !menu) return;

    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        burger.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860) setOpen(false);
    });
  }

  /* ---------------------------------------------------------------------
     Estado da navbar ao rolar
     --------------------------------------------------------------------- */

  function initNavState() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    var ticking = false;

    function update() {
      nav.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* ---------------------------------------------------------------------
     Link ativo conforme a seção visível
     --------------------------------------------------------------------- */

  function initScrollSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    var byId = {};
    var sections = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      byId[id] = link;
      sections.push(section);
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) { link.classList.remove('is-active'); });
        var active = byId[entry.target.id];
        if (active) active.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------------------------------------------------------------------
     Revelação progressiva ao entrar na viewport
     --------------------------------------------------------------------- */

  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    items.forEach(function (item) {
      item.style.setProperty('--reveal-delay', item.getAttribute('data-reveal-delay') || '0');
    });

    function revealAll() {
      items.forEach(function (item) { item.classList.add('is-visible'); });
    }

    if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
      revealAll();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    items.forEach(function (item) { observer.observe(item); });

    // Rede de segurança: se o observer não disparar em 2s (aba aberta em
    // segundo plano, renderizador ocioso), mostra tudo. Sem isso, a página
    // ficaria em branco. Só age se nada tiver sido revelado ainda, para não
    // atropelar a animação no caminho normal.
    window.setTimeout(function () {
      if (!document.querySelector('[data-reveal].is-visible')) revealAll();
    }, 2000);
  }

  /* ---------------------------------------------------------------------
     Atalho flutuante do WhatsApp
     Aparece após o hero e se esconde na seção de contato, onde o botão
     principal já está na tela.
     --------------------------------------------------------------------- */

  function initWhatsAppFloat() {
    var float = document.getElementById('wa-float');
    if (!float) return;

    var hero = document.getElementById('inicio');
    // O alvo é o botão de WhatsApp da seção de contato, não a seção inteira:
    // o flutuante só é redundante quando o botão real está na tela.
    var ctaPrincipal = document.querySelector('.wa');

    function update() {
      var passouDoHero = hero ? hero.getBoundingClientRect().bottom < 80 : true;
      var ctaNaTela = false;

      if (ctaPrincipal) {
        var rect = ctaPrincipal.getBoundingClientRect();
        ctaNaTela = rect.top < window.innerHeight && rect.bottom > 0;
      }

      float.classList.toggle('is-shown', passouDoHero && !ctaNaTela);
    }

    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        update();
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener('resize', update);
    update();
  }

  /* ---------------------------------------------------------------------
     Copiar e-mail
     --------------------------------------------------------------------- */

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    // Fallback para file:// e contextos não seguros
    return new Promise(function (resolve, reject) {
      var field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();

      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (err) {
        ok = false;
      }
      document.body.removeChild(field);
      ok ? resolve() : reject(new Error('Cópia não suportada neste navegador'));
    });
  }

  function initCopyEmail() {
    var button = document.getElementById('copy-email');
    if (!button) return;

    var label = button.querySelector('.copy-btn__text');
    var timer = null;

    button.addEventListener('click', function () {
      copyToClipboard(button.getAttribute('data-email'))
        .then(function () { feedback('Copiado', true); })
        .catch(function () { feedback('Copie manualmente', false); });
    });

    function feedback(text, success) {
      if (label) label.textContent = text;
      button.classList.toggle('is-done', success);
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        if (label) label.textContent = 'Copiar';
        button.classList.remove('is-done');
      }, 2200);
    }
  }

  /* ---------------------------------------------------------------------
     Formulário de contato → compõe um e-mail (sem back-end)
     --------------------------------------------------------------------- */

  var DESTINATARIO = 'pedromatheusdasilva123@gmail.com';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setFieldError(field, message) {
    var target = document.querySelector('[data-error-for="' + field.id + '"]');
    if (target) target.textContent = message;
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    return !message;
  }

  function validate(form) {
    var nome = form.querySelector('#f-nome');
    var email = form.querySelector('#f-email');
    var mensagem = form.querySelector('#f-msg');

    var okNome = setFieldError(nome, nome.value.trim() ? '' : 'Informe seu nome.');
    var emailValue = email.value.trim();
    var okEmail = setFieldError(
      email,
      !emailValue ? 'Informe seu e-mail.' : (EMAIL_RE.test(emailValue) ? '' : 'E-mail inválido.')
    );
    var okMsg = setFieldError(
      mensagem,
      mensagem.value.trim().length >= 10 ? '' : 'Escreva ao menos 10 caracteres.'
    );

    var invalid = [okNome, okEmail, okMsg].indexOf(false);
    if (invalid !== -1) [nome, email, mensagem][invalid].focus();

    return okNome && okEmail && okMsg;
  }

  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var status = document.getElementById('form-status');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (status) status.textContent = '';
      if (!validate(form)) return;

      var data = new FormData(form);
      var assunto = 'Contato pelo site — ' + data.get('assunto');
      var corpo = [
        'Nome: ' + data.get('nome'),
        'E-mail: ' + data.get('email'),
        'Tipo de projeto: ' + data.get('assunto'),
        '',
        data.get('mensagem')
      ].join('\n');

      window.location.href =
        'mailto:' + DESTINATARIO +
        '?subject=' + encodeURIComponent(assunto) +
        '&body=' + encodeURIComponent(corpo);

      if (status) status.textContent = '✓ Abrindo seu cliente de e-mail…';
    });

    // Limpa o erro assim que o usuário corrige o campo
    form.addEventListener('input', function (event) {
      var field = event.target;
      if (field.getAttribute('aria-invalid') === 'true') setFieldError(field, '');
    });
  }

  /* ---------------------------------------------------------------------
     Ano do rodapé
     --------------------------------------------------------------------- */

  function initYear() {
    var el = document.getElementById('ano');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------------------
     Bootstrap
     --------------------------------------------------------------------- */

  function init() {
    initTheme();
    initMenu();
    initNavState();
    initScrollSpy();
    initReveal();
    initWhatsAppFloat();
    initCopyEmail();
    initForm();
    initYear();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
