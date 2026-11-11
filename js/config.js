/* ==========================================================================
   VOS TEXTES — c'est le seul fichier à modifier pour personnaliser le site
   (en plus du dossier « photos »).

   Règles simples :
   - Gardez les guillemets "..." autour de chaque texte.
   - N'effacez pas les virgules à la fin des lignes.
   - Pour changer une photo, remplacez le fichier dans le dossier « photos »
     en gardant le même nom (ou changez le nom ci-dessous).
   ========================================================================== */

window.INVITATION = {

  /* ---------- LES MARIÉS ---------- */
  prenoms: ["Ingrid", "Rodrigue"],

  // Initiales du cachet de cire et du pied de page.
  // Laissez null pour les calculer automatiquement, ou écrivez par exemple ["A", "M"].
  initiales: null,

  /* ---------- LA DATE ----------
     Format : AAAA-MM-JJTHH:MM:SS+01:00  (+01:00 = heure du Cameroun, de la France l'hiver : +01:00, l'été : +02:00)
     Ici : samedi 12 juin 2027 à 15h30 (heure de la cérémonie).
     La date affichée sur le site et le compte à rebours sont calculés à partir de cette ligne. */
  dateISO: "2026-12-19T10:00:00+01:00",

  /* ---------- LE LIEU ---------- */
  salle: "Station MRS Deido",
  adresse: "En face de l'Auto-école Européenne, Deido",
  ville: "Douala",

  /* ---------- L'ENVELOPPE ---------- */
  enveloppe: {
    bouton: "Ouvrir notre invitation",
    carteTitre: "Vous êtes invités"
  },

  /* ---------- 1. ACCUEIL ---------- */
  photoAccueil: "photos/hero.jpg",
  photoAccueilAlt: "Photo des mariés",
  accueilTitre: "Nos fiançailles",
  accueilPhrase: "Nous avons la joie de vous inviter à nos fiançailles et à notre dot, pour partager avec nous ce grand jour.",
  compteAReboursFin: "C'est aujourd'hui !",

  /* ---------- 2. NOTRE HISTOIRE (à remplacer par la vôtre) ---------- */
  histoire: null,

  /* ---------- 3. GALERIE (4 à 6 photos : supprimez un bloc { } pour en avoir moins) ---------- */
  galerie: null,

  /* ---------- 4. LE PROGRAMME ---------- */
  programme: {
    titre: "Le programme",
    moments: [
      { heure: "09h00", titre: "Accueil", texte: "Arrivée des invités." },
      { heure: "10h00", titre: "Cérémonie", texte: "Début des fiançailles et de la dot." },
      { heure: "14h00", titre: "Repas", texte: "Un repas à partager." }
    ]
  },

  /* ---------- 5. LE LIEU ---------- */
  lieu: {
    titre: "Le lieu",
    bouton: "Ouvrir l'itinéraire",
    // Facultatif : texte exact cherché dans Google Maps. Laissez "" pour utiliser salle + adresse + ville.
    recherche: ""
  },

  /* ---------- 6. TENUE ---------- */
  tenue: {
    titre: "Tenue",
    texte: "Nous vous invitons à porter du beige, du marron ou du blanc, dans une tenue élégante.",
    couleurs: [
      { nom: "Beige", hex: "#D9C5A5" },
      { nom: "Marron", hex: "#6B4A32" },
      { nom: "Blanc", hex: "#FFFFFF" }
    ]
  },

  /* ---------- 7. CONFIRMER MA PRÉSENCE ---------- */
  rsvp: {
    titre: "Confirmer ma présence",
    texte: "Merci de nous indiquer si vous serez des nôtres.",
    dateLimite: "16 novembre 2026",
    bouton: "Ouvrir le formulaire",
    // Collez ici le lien de votre formulaire (Google Forms, par exemple).
    lien: "",
    // Facultatif : numéro WhatsApp avec l'indicatif, sans + ni espaces (ex. "237600000000"). Laissez "" pour masquer.
    whatsapp: "237697867714",
    boutonWhatsapp: "Répondre sur WhatsApp"
  },

  /* ---------- QR CODE PERSONNEL DES INVITÉS ----------
     Collez entre les guillemets l'adresse de votre script Google (étape « Apps Script »).
     Tant que c'est vide, le site fonctionne normalement, sans QR code. */
  qr: {
    api: "https://script.google.com/macros/s/AKfycbyvibQGFWrHIbO1QZLL8IxD3JKKGtQxwNNJx3-K33ybSjCxz7RAdafHO6yhFL4fr_cr/exec",
    titre: "Votre invitation",
    texte: "Présentez ce code à l'entrée le jour du mariage. Faites-en une capture d'écran ou enregistrez-le sur votre téléphone.",
    bouton: "Enregistrer mon QR code",
    introuvable: "Nous ne retrouvons pas cette invitation. Vérifiez le lien reçu ou contactez-nous."
  },

  /* ---------- 8. PIED DE PAGE ---------- */
  pied: {
    merci: "Merci de faire partie de notre histoire",
    hashtag: "#IngridEtRodrigue"
  }
};
