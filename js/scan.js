/* Contrôle d'entrée : lit les QR codes, marque les arrivées.
   Rien à modifier ici : l'adresse du script est dans js/config.js */
(function () {
  'use strict';

  var API = (window.INVITATION && window.INVITATION.qr && window.INVITATION.qr.api) || '';
  var $ = function (s) { return document.querySelector(s); };

  var pin = '';
  var scanner = null;
  var busy = false;
  var last = { code: '', t: 0 };

  function store(k, v) { try { if (v === null) { sessionStorage.removeItem(k); } else { sessionStorage.setItem(k, v); } } catch (e) { /* ignoré */ } }
  function load(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }

  function appel(params) {
    var q = Object.keys(params).map(function (k) { return k + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(API + (API.indexOf('?') > -1 ? '&' : '?') + q).then(function (r) { return r.json(); });
  }

  /* ---- Connexion ---- */
  function connecter(p, auto) {
    $('#loginErr').textContent = '';
    if (!API) { $('#loginErr').textContent = "L'adresse du script n'est pas renseignée dans js/config.js (qr > api)."; return; }
    appel({ action: 'stats', pin: p }).then(function (d) {
      if (d && d.ok) {
        pin = p; store('pin', p);
        $('#login').hidden = true;
        $('#scanner').hidden = false;
        majStats(d);
        demarrerCamera();
      } else if (!auto) {
        $('#loginErr').textContent = d && d.error === 'config'
          ? 'Le code d’accès n’a pas encore été défini dans le script Google (ligne PIN).'
          : 'Code d’accès incorrect.';
      } else {
        store('pin', null);
      }
    }).catch(function () {
      if (!auto) { $('#loginErr').textContent = 'Pas de connexion à internet. Vérifiez le réseau et réessayez.'; }
    });
  }

  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    connecter($('#pin').value.trim(), false);
  });

  $('#logout').addEventListener('click', function () {
    store('pin', null); pin = '';
    arreterCamera().then(function () { location.reload(); });
  });

  function majStats(d) {
    if (!d) { return; }
    $('#stat').textContent = 'Arrivés : ' + d.arrives + ' / ' + d.total + ' personnes';
  }

  /* ---- Caméra ---- */
  function demarrerCamera() {
    $('#camErr').textContent = '';
    $('#camBtn').hidden = true;
    if (typeof Html5Qrcode !== 'function') { $('#camErr').textContent = 'Le lecteur de QR code ne s’est pas chargé. Utilisez la saisie manuelle ci-dessous.'; return; }
    scanner = new Html5Qrcode('reader', { verbose: false });
    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: function (w, h) { var s = Math.floor(Math.min(w, h) * 0.75); return { width: s, height: s }; } },
      function (texte) { traiter(texte); },
      function () { /* pas de QR dans l'image : rien à faire */ }
    ).then(function () {
      garderEcranAllume();
    }).catch(function () {
      $('#camErr').textContent = 'Impossible d’ouvrir la caméra. Autorisez-la dans votre navigateur, puis touchez « Activer la caméra ». Vous pouvez aussi saisir le code à la main.';
      $('#camBtn').hidden = false;
    });
  }

  /* Empêche le téléphone de se mettre en veille pendant le contrôle (si le navigateur le permet). */
  var verrouEcran = null;
  function garderEcranAllume() {
    try {
      if (navigator.wakeLock && navigator.wakeLock.request) {
        navigator.wakeLock.request('screen').then(function (l) { verrouEcran = l; }).catch(function () { /* refusé : tant pis */ });
      }
    } catch (e) { /* ignoré */ }
  }
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && scanner) { garderEcranAllume(); }
  });

  function arreterCamera() {
    if (scanner) {
      var s = scanner; scanner = null;
      return s.stop().then(function () { return s.clear(); }).catch(function () { /* déjà arrêtée */ });
    }
    return Promise.resolve();
  }

  $('#camBtn').addEventListener('click', function () { arreterCamera().then(demarrerCamera); });

  /* ---- Lecture d'un code ---- */
  function extraire(texte) {
    var t = String(texte || '').trim();
    var m = t.match(/[?&]invite=([A-Za-z0-9]+)/);
    if (m) { t = m[1]; }
    return t.toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  function traiter(texte) {
    var code = extraire(texte);
    if (!code || busy) { return; }
    var now = Date.now();
    if (code === last.code && now - last.t < 4000) { return; }
    last = { code: code, t: now };
    busy = true;
    appel({ action: 'checkin', code: code, pin: pin }).then(function (d) {
      if (!d || !d.ok) {
        montrer('bad', 'Erreur', '', '', d && d.error === 'pin' ? 'Code d’accès refusé. Reconnectez-vous.' : 'Le serveur a refusé la demande.');
        return;
      }
      var meta = d.personnes + (d.personnes > 1 ? ' personnes' : ' personne') + (d.table ? ' • table ' + d.table : '');
      if (d.status === 'ok') { montrer('ok', 'Bienvenue', d.nom, meta, ''); }
      else if (d.status === 'deja') { montrer('warn', 'Déjà scanné', d.nom, meta, 'Entré le ' + d.heure); }
      else { montrer('bad', 'Code inconnu', '', '', 'Ce code ne figure pas dans la liste.'); }
      appel({ action: 'stats', pin: pin }).then(majStats).catch(function () { /* ignoré */ });
      if ($('#searchQ').value.trim().length >= 2) { lancerRecherche(); }
    }).catch(function () {
      montrer('bad', 'Pas de connexion', '', '', 'Le scan n’est pas enregistré. Vérifiez internet puis rescannez, ou utilisez la liste imprimée.');
    });
  }

  function montrer(type, titre, nom, meta, note) {
    var r = $('#result');
    r.className = 'result' + (type === 'warn' ? ' is-warn' : type === 'bad' ? ' is-bad' : '');
    $('#resTitle').textContent = titre;
    $('#resName').textContent = nom;
    $('#resMeta').textContent = meta;
    $('#resNote').textContent = note;
    r.hidden = false;
    $('#resNext').focus();
    if (navigator.vibrate) { navigator.vibrate(type === 'ok' ? 120 : [120, 80, 120]); }
  }

  $('#resNext').addEventListener('click', function () {
    $('#result').hidden = true;
    busy = false;
  });

  /* ---- Saisie manuelle ---- */
  $('#manual').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#manualCode').value;
    $('#manualCode').value = '';
    last = { code: '', t: 0 };
    traiter(v);
  });

  /* ---- Recherche par nom ---- */
  var minuteur = null;
  var rechercheEnCours = 0;

  function afficherResultats(liste) {
    var ul = $('#found');
    ul.innerHTML = '';
    if (!liste.length) {
      var vide = document.createElement('li');
      vide.className = 'found-empty';
      vide.textContent = 'Aucun invité trouvé.';
      ul.appendChild(vide);
      return;
    }
    liste.forEach(function (g) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'found-item' + (g.arrive ? ' is-in' : '');
      var n = document.createElement('span');
      n.className = 'found-name';
      n.textContent = g.nom;
      var m = document.createElement('span');
      m.className = 'found-meta';
      m.textContent = g.personnes + (g.personnes > 1 ? ' personnes' : ' personne') +
        (g.table ? ', table ' + g.table : '') +
        (g.arrive ? ' — déjà entré le ' + g.heure : ' — pas encore arrivé');
      b.appendChild(n);
      b.appendChild(m);
      b.addEventListener('click', function () {
        last = { code: '', t: 0 };
        traiter(g.code);
      });
      li.appendChild(b);
      ul.appendChild(li);
    });
  }

  $('#search').addEventListener('submit', function (e) { e.preventDefault(); lancerRecherche(); });
  $('#searchQ').addEventListener('input', function () {
    clearTimeout(minuteur);
    minuteur = setTimeout(lancerRecherche, 350);
  });

  function lancerRecherche() {
    var q = $('#searchQ').value.trim();
    if (q.length < 2) { $('#found').innerHTML = ''; return; }
    var moi = ++rechercheEnCours;
    appel({ action: 'search', q: q, pin: pin }).then(function (d) {
      if (moi !== rechercheEnCours) { return; }
      afficherResultats(d && d.ok ? d.resultats : []);
    }).catch(function () {
      if (moi !== rechercheEnCours) { return; }
      var ul = $('#found');
      ul.innerHTML = '<li class="found-empty">Pas de connexion : recherche impossible.</li>';
    });
  }

  /* ---- Reconnexion automatique pendant la session ---- */
  var saved = load('pin');
  if (saved) { connecter(saved, true); }
})();
