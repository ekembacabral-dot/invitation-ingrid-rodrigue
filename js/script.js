/* ==========================================================================
   Invitation de mariage — comportement du site.
   Vous n'avez rien à modifier ici : tous les textes sont dans js/config.js
   ========================================================================== */
(function () {
  'use strict';

  var C = window.INVITATION;
  if (!C) { return; }

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }

  /* ---------- Données dérivées ---------- */
  var P = C.prenoms || ['Prénom 1', 'Prénom 2'];
  var ini = C.initiales || [P[0].trim().charAt(0).toUpperCase(), P[1].trim().charAt(0).toUpperCase()];
  var m = String(C.dateISO).match(/^(\d{4})-(\d{2})-(\d{2})/);
  var dateLong = '';
  if (m) {
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12));
    dateLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
  }
  var lieuQuery = (C.lieu && C.lieu.recherche) || [C.salle, C.adresse, C.ville].filter(Boolean).join(', ');

  document.title = 'Invitation aux fiançailles et à la dot de ' + P[0] + ' & ' + P[1];

  /* ---------- Enveloppe : textes ---------- */
  $('#cardTop').textContent = (C.enveloppe && C.enveloppe.carteTitre) || 'Vous êtes invités';
  $('#cardN1').textContent = P[0];
  $('#cardN2').textContent = P[1];
  $('#cardDate').textContent = dateLong;
  $('#sealText').textContent = ini[0] + '&' + ini[1];
  $('#openBtn').textContent = (C.enveloppe && C.enveloppe.bouton) || 'Ouvrir notre invitation';

  /* ---------- Construction du site ---------- */
  function head(title, dark) {
    return '<h2 class="h2 words">' + esc(title) + '</h2><div class="orn reveal" aria-hidden="true"><i></i></div>';
  }

  function hero() {
    return '<header class="hero" id="accueil">' +
      '<div class="hero-photo"><img src="' + esc(C.photoAccueil) + '" alt="' + esc(C.photoAccueilAlt || '') + '" fetchpriority="high"></div>' +
      '<div class="hero-main">' +
        '<p class="cap h-in" style="--d:200ms">' + esc(C.accueilTitre) + '</p>' +
        '<h1 class="names h-in" style="--d:500ms" aria-label="' + esc(P[0] + ' et ' + P[1]) + '">' +
          '<span aria-hidden="true">' + esc(P[0]) + '</span>' +
          '<span class="amp" aria-hidden="true">&amp;</span>' +
          '<span aria-hidden="true">' + esc(P[1]) + '</span>' +
        '</h1>' +
        '<p class="hero-date h-in" style="--d:900ms">' + esc(dateLong) + '</p>' +
        '<p class="hero-place h-in" style="--d:1000ms">' + esc([C.salle, C.ville].filter(Boolean).join(', ')) + '</p>' +
        '<p class="hero-phrase h-in" style="--d:1200ms">' + esc(C.accueilPhrase) + '</p>' +
        '<div class="countdown h-in" id="countdown" role="timer" aria-label="Compte à rebours jusqu\'à la cérémonie" style="--d:1500ms">' +
          '<div class="cd"><b id="cdD">00</b><span id="cdDl">jours</span></div>' +
          '<div class="cd"><b id="cdH">00</b><span id="cdHl">heures</span></div>' +
          '<div class="cd"><b id="cdM">00</b><span id="cdMl">minutes</span></div>' +
          '<div class="cd"><b id="cdS">00</b><span id="cdSl">secondes</span></div>' +
        '</div>' +
        '<p class="countdown-done" id="cdDone">' + esc(C.compteAReboursFin || '') + '</p>' +
      '</div>' +
      '<span class="scroll-cue" aria-hidden="true"></span>' +
    '</header>';
  }

  function histoire() {
    var H = C.histoire; if (!H) { return ''; }
    var items = H.etapes.map(function (e) {
      return '<article class="tl-item"><span class="tl-dot" aria-hidden="true"></span>' +
        '<p class="cap">' + esc(e.date) + '</p>' +
        '<h3 class="h3">' + esc(e.titre) + '</h3>' +
        '<p class="tl-text">' + esc(e.texte) + '</p></article>';
    }).join('');
    return '<section class="sec sec--creme" id="histoire"><div class="wrap">' + head(H.titre) +
      '<div class="tl" id="tl"><div class="tl-line" id="tlLine"><div class="tl-fill" id="tlFill"></div></div>' + items + '</div></div></section>';
  }

  function galerie() {
    var G = C.galerie; if (!G) { return ''; }
    var figs = G.photos.map(function (p) {
      return '<figure class="ph-wrap reveal"><div class="ph"><img src="' + esc(p.src) + '" alt="' + esc(p.alt || '') + '" loading="lazy" decoding="async"></div></figure>';
    }).join('');
    return '<section class="sec sec--dark" id="galerie"><div class="wrap--wide">' + head(G.titre) + '<div class="gal" id="gal">' + figs + '</div></div></section>';
  }

  function programme() {
    var G = C.programme; if (!G) { return ''; }
    var li = G.moments.map(function (x, i) {
      return '<li class="reveal" style="--d:' + (i % 2 ? 0 : 0) + 'ms"><time datetime="' + esc(String(x.heure).replace(/h/i, ':')) + '">' + esc(x.heure) + '</time>' +
        '<div><h3 class="cap">' + esc(x.titre) + '</h3><p>' + esc(x.texte) + '</p></div></li>';
    }).join('');
    return '<section class="sec sec--creme" id="programme"><div class="wrap">' + head(G.titre) + '<ol class="prog">' + li + '</ol></div></section>';
  }

  function lieu() {
    var L = C.lieu || {};
    var q = encodeURIComponent(lieuQuery);
    return '<section class="sec sec--creme2" id="lieu"><div class="wrap">' + head(L.titre || 'Le lieu') +
      '<div class="lieu reveal"><p class="salle">' + esc(C.salle) + '</p><address>' + esc(C.adresse) + '<br>' + esc(C.ville) + '</address></div>' +
      '<div class="map reveal"><iframe title="Carte du lieu de la réception" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' + q + '&amp;output=embed"></iframe></div>' +
      '<p class="lieu-cta reveal"><a class="btn btn--solid" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&amp;destination=' + q + '">' + esc(L.bouton || "Ouvrir l'itinéraire") + '</a></p>' +
    '</div></section>';
  }

  function tenue() {
    var T = C.tenue; if (!T) { return ''; }
    var sw = T.couleurs.map(function (c, i) {
      return '<li class="reveal" style="--d:' + (i * 150) + 'ms"><span class="sw" style="background:' + esc(c.hex) + '"></span><span class="cap">' + esc(c.nom) + '</span></li>';
    }).join('');
    return '<section class="sec sec--creme" id="tenue"><div class="wrap">' + head(T.titre) +
      '<p class="tenue-text reveal">' + esc(T.texte) + '</p><ul class="swatches">' + sw + '</ul></div></section>';
  }

  function rsvp() {
    var R = C.rsvp; if (!R) { return ''; }
    var wa = R.whatsapp ? '<a class="btn btn--ghost" target="_blank" rel="noopener" href="https://wa.me/' + esc(R.whatsapp) + '">' + esc(R.boutonWhatsapp || 'Répondre sur WhatsApp') + '</a>' : '';
    return '<section class="sec sec--terra" id="rsvp"><div class="wrap">' + head(R.titre) +
      '<p class="rsvp-text reveal">' + esc(R.texte) + '</p>' +
      '<p class="rsvp-date reveal">Réponse attendue avant le ' + esc(R.dateLimite) + '</p>' +
      '<div class="rsvp-cta reveal">' + (R.lien ? '<a class="btn btn--light" target="_blank" rel="noopener" href="' + esc(R.lien) + '">' + esc(R.bouton) + '</a>' : '') + wa + '</div>' +
    '</div></section>';
  }

  function pied() {
    var F = C.pied || {};
    return '<footer class="foot"><div class="wrap">' +
      '<p class="foot-merci reveal">' + esc(F.merci) + '</p>' +
      '<p class="foot-ini reveal" style="--d:150ms" aria-label="' + esc(ini[0] + ' et ' + ini[1]) + '">' + esc(ini[0]) + ' &amp; ' + esc(ini[1]) + '</p>' +
      '<p class="foot-tag cap reveal" style="--d:300ms">' + esc(F.hashtag) + '</p>' +
    '</div></footer>';
  }

  /* ---------- Invitation personnelle (QR code) ---------- */
  var QR = C.qr || {};
  var KEY = 'invitation-code';
  function lire(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ecrire(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignoré */ } }

  var codeInvite = '';
  if (QR.api) {
    var q = new URLSearchParams(location.search).get('invite');
    codeInvite = String(q || lire(KEY) || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function invitation() {
    if (!codeInvite) { return ''; }
    return '<section class="sec sec--creme2" id="invitation"><div class="wrap">' + head(QR.titre || 'Votre invitation') +
      '<div class="inv reveal" id="invBox" aria-live="polite"><p class="inv-load">Chargement de votre invitation…</p></div></div></section>';
  }

  var site = $('#site');
  site.innerHTML = [hero(), invitation(), histoire(), galerie(), programme(), lieu(), tenue(), rsvp(), pied()].join('');

  /* ---------- Titres : apparition mot par mot ---------- */
  $$('.words').forEach(function (h) {
    var text = h.textContent.trim();
    h.setAttribute('aria-label', text);
    h.textContent = '';
    var words = text.split(/\s+/);
    words.forEach(function (w, i) {
      var outer = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      var inner = document.createElement('span');
      inner.className = 'wi';
      inner.style.setProperty('--i', i);
      inner.textContent = w;
      outer.appendChild(inner);
      h.appendChild(outer);
      if (i < words.length - 1) { h.appendChild(document.createTextNode(' ')); }
    });
  });

  /* ---------- Apparition au défilement ---------- */
  var toReveal = $$('.reveal, .words');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    toReveal.forEach(function (el) { io.observe(el); });
  } else {
    toReveal.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Compte à rebours ---------- */
  var target = new Date(C.dateISO).getTime();
  var cd = { D: $('#cdD'), H: $('#cdH'), M: $('#cdM'), S: $('#cdS'), Dl: $('#cdDl'), Hl: $('#cdHl'), Ml: $('#cdMl'), Sl: $('#cdSl') };
  var heroEl = $('#accueil');
  function tick() {
    var left = Math.floor((target - Date.now()) / 1000);
    if (isNaN(left) || left <= 0) {
      heroEl.classList.add('is-done');
      return;
    }
    var days = Math.floor(left / 86400);
    var h = Math.floor((left % 86400) / 3600);
    var mi = Math.floor((left % 3600) / 60);
    var s = left % 60;
    cd.D.textContent = pad(days); cd.H.textContent = pad(h); cd.M.textContent = pad(mi); cd.S.textContent = pad(s);
    cd.Dl.textContent = days > 1 ? 'jours' : 'jour';
    cd.Hl.textContent = h > 1 ? 'heures' : 'heure';
    cd.Ml.textContent = mi > 1 ? 'minutes' : 'minute';
    cd.Sl.textContent = s > 1 ? 'secondes' : 'seconde';
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Frise : se dessine au défilement ---------- */
  var tl = $('#tl'), tlLine = $('#tlLine'), tlFill = $('#tlFill');
  var tlItems = $$('.tl-item');
  var dotY = [], lineA = 0, lineB = 0;

  function layoutTimeline() {
    if (!tl || !tlItems.length) { return; }
    var base = tl.getBoundingClientRect().top;
    dotY = tlItems.map(function (it) {
      var r = $('.tl-dot', it).getBoundingClientRect();
      return r.top - base + r.height / 2;
    });
    lineA = dotY[0];
    lineB = dotY[dotY.length - 1];
    tlLine.style.top = lineA + 'px';
    tlLine.style.height = Math.max(1, lineB - lineA) + 'px';
  }

  function updateTimeline(vh) {
    if (!tl || !dotY.length) { return; }
    var y = vh * 0.62 - tl.getBoundingClientRect().top;
    var p = reduce ? 1 : clamp((y - lineA) / Math.max(1, lineB - lineA), 0, 1);
    tlFill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
    tlItems.forEach(function (it, i) {
      it.classList.toggle('on', reduce || y >= dotY[i]);
    });
  }

  /* ---------- Galerie : léger effet de profondeur ---------- */
  var wraps = $$('.ph-wrap');
  function updateParallax(vh) {
    if (reduce) { return; }
    wraps.forEach(function (w, i) {
      var r = w.getBoundingClientRect();
      if (r.bottom < -150 || r.top > vh + 150) { return; }
      var t = clamp((r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      $('.ph', w).style.transform = 'translate3d(0,' + (t * (i % 2 ? -16 : 12)).toFixed(1) + 'px,0)';
      $('img', w).style.transform = 'translate3d(0,' + (t * 7).toFixed(2) + '%,0)';
    });
  }

  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    updateTimeline(vh);
    updateParallax(vh);
  }
  function onScroll() {
    if (ticking) { return; }
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }
  function relayout() { layoutTimeline(); update(); }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  layoutTimeline();
  update();

  /* ---------- L'enveloppe ---------- */
  var intro = $('#intro');
  var env = $('#env');
  var openBtn = $('#openBtn');
  var opened = false;

  var showIntro = function () { intro.classList.add('ready'); };
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1800); })]).then(showIntro);
  } else {
    showIntro();
  }

  function finish() {
    intro.classList.add('leaving');
    body.classList.add('opened');
    body.classList.remove('locked');
    intro.hidden = true;
    site.inert = false;
    site.removeAttribute('inert');
    window.scrollTo(0, 0);
    relayout();
  }

  function openInvitation() {
    if (opened) { return; }
    opened = true;
    intro.classList.add('is-opening');
    openBtn.disabled = true;

    if (reduce) { finish(); return; }

    var steps = [[0, 'seal-off'], [300, 'flap-open'], [850, 'flap-behind'], [1250, 'card-out']];
    steps.forEach(function (s) {
      setTimeout(function () { intro.classList.add(s[1]); }, s[0]);
    });
    setTimeout(function () {
      intro.classList.add('leaving');
      body.classList.add('opened');
    }, 2600);
    setTimeout(finish, 3800);
  }

  openBtn.addEventListener('click', openInvitation);
  env.addEventListener('click', openInvitation);

  /* ---------- Invitation personnelle : récupération et affichage du QR ---------- */
  function dessinerQR(code) {
    if (typeof qrcode !== 'function') { return null; }
    var qr = qrcode(0, 'M');
    qr.addData(code);
    qr.make();
    var n = qr.getModuleCount(), marge = 4, cell = 12;
    var size = (n + marge * 2) * cell;
    var cv = document.createElement('canvas');
    cv.width = size; cv.height = size;
    var ctx = cv.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#2B1810';
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) { ctx.fillRect((c + marge) * cell, (r + marge) * cell, cell, cell); }
      }
    }
    cv.className = 'qr-cv';
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', 'Votre QR code personnel');
    return cv;
  }

  /* La bibliothèque du QR se charge ici, à la demande : index.html n'a pas besoin d'être modifié. */
  function chargerQR(suite) {
    if (typeof qrcode === 'function') { suite(); return; }
    var s = document.createElement('script');
    s.src = 'js/vendor/qrcode.js';
    s.onload = suite;
    s.onerror = suite;
    document.head.appendChild(s);
  }

  function afficherInvite(info) {
    var box = $('#invBox');
    if (!box) { return; }
    box.innerHTML = '';
    if (info && info.nom) {
      var nom = document.createElement('p');
      nom.className = 'inv-name';
      nom.textContent = info.nom;
      box.appendChild(nom);
      var meta = [];
      meta.push(info.personnes + (info.personnes > 1 ? ' personnes' : ' personne'));
      if (info.table) { meta.push('table ' + info.table); }
      var m = document.createElement('p');
      m.className = 'inv-meta';
      m.textContent = meta.join(', ');
      box.appendChild(m);
      var top = $('#cardTop');
      if (top) { top.textContent = info.nom; }
    }
    var cv = dessinerQR(codeInvite);
    if (cv) {
      var card = document.createElement('div');
      card.className = 'qr-card';
      card.appendChild(cv);
      box.appendChild(card);
    }
    var cd = document.createElement('p');
    cd.className = 'inv-code';
    cd.textContent = 'Code : ' + codeInvite;
    box.appendChild(cd);
    var t = document.createElement('p');
    t.className = 'inv-help';
    t.textContent = QR.texte || '';
    box.appendChild(t);
    if (cv) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn--solid';
      b.textContent = QR.bouton || 'Enregistrer mon QR code';
      b.addEventListener('click', function () {
        cv.toBlob(function (blob) {
          if (!blob) { return; }
          var fichier = null;
          try { fichier = new File([blob], 'mon-qr-code-mariage.png', { type: 'image/png' }); } catch (e) { fichier = null; }
          if (fichier && navigator.canShare && navigator.canShare({ files: [fichier] })) {
            navigator.share({ files: [fichier], title: 'Mon QR code' }).catch(function () { /* annulé */ });
            return;
          }
          var a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'mon-qr-code-mariage.png';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
        }, 'image/png');
      });
      box.appendChild(b);
    }
    relayout();
  }

  function erreurInvite() {
    var box = $('#invBox');
    if (!box) { return; }
    box.innerHTML = '';
    var p = document.createElement('p');
    p.className = 'inv-help';
    p.textContent = QR.introuvable || 'Invitation introuvable.';
    box.appendChild(p);
    relayout();
  }

  if (codeInvite) {
    var cache = null;
    try { cache = JSON.parse(lire(KEY + '-info') || 'null'); } catch (e) { cache = null; }
    if (cache && cache.code !== codeInvite) { cache = null; }

    fetch(QR.api + (QR.api.indexOf('?') > -1 ? '&' : '?') + 'action=guest&code=' + encodeURIComponent(codeInvite))
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.ok) {
          ecrire(KEY, codeInvite);
          ecrire(KEY + '-info', JSON.stringify({ code: codeInvite, nom: d.nom, personnes: d.personnes, table: d.table }));
          chargerQR(function () { afficherInvite(d); });
        } else {
          erreurInvite();
        }
      })
      .catch(function () {
        /* Pas de connexion : on affiche quand même le QR (le code suffit à le dessiner). */
        chargerQR(function () { afficherInvite(cache || null); });
      });
  }
})();
