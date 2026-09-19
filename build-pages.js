// One-off builder. Emits 12 HTML pages + the root redirect.
// Run with: node build-pages.js
const fs = require("fs");
const path = require("path");

const SITE_BASE = "https://erperejildo.github.io/ai-sabotate-web";
const ROOT = __dirname;
const enDir = path.join(ROOT, "en");
const esDir = path.join(ROOT, "es");

fs.mkdirSync(enDir, { recursive: true });
fs.mkdirSync(esDir, { recursive: true });

// Load i18n dictionary directly from source
const i18nCode = fs.readFileSync(path.join(ROOT, "assets/js/i18n.js"), "utf8");
const i18nScope = {};
eval(i18nCode.replace("window.I18N", "i18nScope.I18N"));
const I18N = i18nScope.I18N;

function t(key, lang) {
  const dict = I18N[lang] || I18N.en;
  const val = key.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), dict);
  return typeof val === "string" ? val : "";
}

const PAGES = [
  { slug: "index", titleKey: "siteTitle", build: buildHome },
  { slug: "rig", titleKey: "rig.heading", build: buildRig },
  { slug: "cards", titleKey: "cardsPage.heading", build: buildCards },
  { slug: "friends", titleKey: "friends.heading", build: buildFriends },
  { slug: "ranking", titleKey: "ranking.heading", build: buildRanking },
  { slug: "play", titleKey: "play.heading", build: buildPlay },
];

function nav(slug, lang) {
  const items = [
    { key: "rig", url: "rig.html" },
    { key: "cards", url: "cards.html" },
    { key: "friends", url: "friends.html" },
    { key: "ranking", url: "ranking.html" },
    { key: "play", url: "play.html" },
  ];
  const links = items
    .map(
      (it) =>
        `<a href="${it.url}" data-i18n="nav.${it.key}" class="${
          it.key === slug ? "is-active" : ""
        }">${t("nav." + it.key, lang)}</a>`,
    )
    .join("\n          ");
  const homeHref = "index.html";
  const brandClass = slug === "index" ? "is-active" : "";
  const otherLang = lang === "en" ? "es" : "en";
  const switchLabel = lang === "en" ? "ES" : "EN";
  return `
    <header class="nav">
      <div class="wrap nav-inner">
        <a class="brand ${brandClass}" href="${homeHref}" aria-label="AI Sabotage home">
          <span class="brand-mark" aria-hidden="true">[</span>
          <span class="brand-name">AI SABOTAGE</span>
          <span class="brand-mark" aria-hidden="true">]</span>
        </a>
        <nav class="nav-links" aria-label="Sections">
          ${links}
        </nav>
        <div class="nav-end">
          <button class="lang-switch" type="button" data-lang-switch="${otherLang}" aria-label="Switch language">${switchLabel}</button>
        </div>
      </div>
    </header>
`;
}

function getSchemas(slug, lang) {
  const file = slug === "index" ? "" : slug + ".html";
  const abs = `${SITE_BASE}/${lang}/${file}`;
  const siteDesc = t("meta.description", lang);
  const isEs = lang === "es";

  const websiteSchema = {
    "@type": "WebSite",
    "@id": `${SITE_BASE}/#website`,
    url: abs,
    name: "AI Sabotage: Cyber Cards",
    description: siteDesc,
    inLanguage: lang,
  };

  const schemas = [websiteSchema];

  if (slug !== "index") {
    const pageName = t(PAGES.find((p) => p.slug === slug).titleKey, lang);
    schemas.push({
      "@type": "BreadcrumbList",
      "@id": `${abs}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: isEs ? "Inicio" : "Home",
          item: `${SITE_BASE}/${lang}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: pageName,
          item: abs,
        },
      ],
    });
  }

  if (slug === "index") {
    schemas.push({
      "@type": "VideoGame",
      "@id": `${abs}#game`,
      name: "AI Sabotage: Cyber Cards",
      url: abs,
      image: `${SITE_BASE}/assets/img/icon.jpg`,
      description: siteDesc,
      genre: ["Card Game", "Strategy Game", "Cyberpunk"],
      gamePlatform: ["iOS", "Android"],
      operatingSystem: "iOS 14+, Android 9+",
      applicationCategory: "GameApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@type": "Organization",
        name: "Axis Labs",
        url: "https://axislabs.eu",
      },
    });

    schemas.push({
      "@type": "FAQPage",
      "@id": `${abs}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: isEs ? "¿Qué es AI Sabotage: Cyber Cards?" : "What is AI Sabotage: Cyber Cards?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "AI Sabotage es un juego de cartas de estrategia cyberpunk de ritmo rápido donde hasta 4 jugadores compiten por armar un rig funcional de AGI con 4 componentes: Hardware, Dataset, Red Neuronal y Algoritmo. Las partidas duran 3 minutos combinando colección de sets y sabotaje táctico."
              : "AI Sabotage is a fast-paced cyberpunk strategy card game where up to 4 players duel to construct an AGI rig across four component categories: Hardware, Dataset, Neural Net, and Algorithm. Matches take three minutes, combining set collection with tactical cyber sabotage.",
          },
        },
        {
          "@type": "Question",
          name: isEs
            ? "¿Cómo se gana una partida en AI Sabotage?"
            : "How do you win a match in AI Sabotage?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "Ganas de inmediato reuniendo 4 componentes sanos distintos en tu rig, o usando el comodín Quantum Core en lugar de cualquier componente faltante. Los componentes sanos no tienen amenazas activas adheridas."
              : "You win immediately by assembling four different healthy components on your rig, or by using the Quantum Core wildcard to substitute for any missing slot. Healthy components have no active threats attached.",
          },
        },
        {
          "@type": "Question",
          name: isEs
            ? "¿Se puede jugar a AI Sabotage offline sin conexión a internet?"
            : "Can I play AI Sabotage offline without internet?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "Sí. AI Sabotage cuenta con un modo individual offline completo contra la CPU con tutorial guiado, y un modo hot-seat local para 2 a 4 jugadores en un único dispositivo sin necesidad de conexión o datos."
              : "Yes. AI Sabotage features a full single-player mode against CPU with an interactive tutorial, as well as a local hot-seat mode for 2–4 players on a single device without internet or mobile data.",
          },
        },
      ],
    });
  }

  if (slug === "rig") {
    schemas.push({
      "@type": "HowTo",
      "@id": `${abs}#howto`,
      name: isEs
        ? "Cómo armar el Rig de AGI en AI Sabotage"
        : "How to Build the AGI Rig in AI Sabotage",
      description: isEs
        ? "Construye tu rig de AGI en AI Sabotage reuniendo cuatro componentes sanos: Hardware, Dataset, Red Neuronal y Algoritmo."
        : "Build your AGI rig in AI Sabotage by assembling four healthy components: Hardware, Dataset, Neural Net, and Algorithm.",
      step: [
        {
          "@type": "HowToStep",
          name: isEs ? "1. Robar cartas" : "1. Draw cards",
          text: isEs
            ? "Ambos jugadores empiezan con 3 cartas robadas del mazo compartido de 54 cartas."
            : "Both players start with 3 cards drawn from the shared 54-card deck.",
        },
        {
          "@type": "HowToStep",
          name: isEs ? "2. Instalar componentes" : "2. Install components",
          text: isEs
            ? "Juega componentes en tus slots vacíos: Hardware, Dataset, Red Neuronal y Algoritmo."
            : "Play components into your open slots: Hardware, Dataset, Neural Net, and Algorithm.",
        },
        {
          "@type": "HowToStep",
          name: isEs ? "3. Bloquear y defender" : "3. Protect and lock",
          text: isEs
            ? "Usa defensas para neutralizar amenazas. Dos defensas sobre un componente lo bloquean de forma permanente."
            : "Use defenses to neutralize threats. Two defenses on a component lock it permanently against threats.",
        },
        {
          "@type": "HowToStep",
          name: isEs ? "4. Encender la AGI" : "4. Ignite the AGI",
          text: isEs
            ? "Reúne cuatro componentes sanos o comodines Quantum Core para ganar de inmediato."
            : "Assemble four healthy components or Quantum Core wildcards to declare victory immediately.",
        },
      ],
    });

    schemas.push({
      "@type": "FAQPage",
      "@id": `${abs}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: isEs
            ? "¿Cuáles son los cuatro slots del rig en AI Sabotage?"
            : "What are the four rig slots in AI Sabotage?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "Los cuatro slots representan las capas fundamentales de una AGI: Hardware [01], Dataset [02], Red Neuronal [03] y Algoritmo [04]."
              : "The four rig slots represent the foundational subsystems of an AGI: Hardware [01], Dataset [02], Neural Net [03], and Algorithm [04].",
          },
        },
        {
          "@type": "Question",
          name: isEs ? "¿Qué hace la carta Quantum Core?" : "What does the Quantum Core card do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "Quantum Core es un comodín universal que cuenta como cualquier componente faltante en tu rig para acelerar la victoria."
              : "Quantum Core is a universal wildcard that can occupy any missing component slot on your rig to accelerate victory.",
          },
        },
        {
          "@type": "Question",
          name: isEs
            ? "¿Cómo protegen las defensas a los componentes?"
            : "How do defenses protect components?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "Una defensa protege al componente absorbiendo la siguiente amenaza entrante. Una segunda defensa lo bloquea permanentemente, volviéndolo inmune a amenazas."
              : "One defense protects a component by absorbing the next incoming threat. A second defense permanently locks it, making it immune to all threats.",
          },
        },
      ],
    });
  }

  if (slug === "cards") {
    schemas.push({
      "@type": "FAQPage",
      "@id": `${abs}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: isEs
            ? "¿Qué tipos de cartas componen el mazo de AI Sabotage?"
            : "What card types are in the AI Sabotage deck?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "El mazo compartido contiene cuatro tipos de cartas: Componentes (se instalan en el rig), Amenazas (infectan o destruyen componentes rivales), Defensas (protegen o bloquean tus componentes) y Protocolos Especiales (acciones instantáneas)."
              : "The shared deck contains four card categories: Components (installed on your rig), Threats (infect or destroy rival components), Defenses (protect or lock your components), and Special Protocols (instant tactical programs).",
          },
        },
        {
          "@type": "Question",
          name: isEs ? "¿Qué hacen los Protocolos Especiales?" : "What do Special Protocols do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "Los protocolos provocan efectos inmediatos de alto impacto: Data Heist roba un componente no bloqueado, EMP Purge limpia las manos rivales, System Override intercambia rigs completos, Protocol Swap intercambia dos cartas y Malware Migration traslada amenazas."
              : "Special Protocols trigger powerful board-wide effects: Data Heist steals an un-locked component, EMP Purge discards rival hands, System Override inverts entire rigs, Protocol Swap exchanges two cards, and Malware Migration moves threats.",
          },
        },
        {
          "@type": "Question",
          name: isEs
            ? "¿Qué ocurre cuando un componente recibe dos amenazas?"
            : "What happens when a component receives two threats?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "La primera amenaza deja el componente infectado. Una segunda amenaza del mismo color destruye toda la pila, descartando el componente y las cartas adheridas."
              : "The first threat infects the component. A second threat of the same color permanently destroys the entire stack, sending all cards to the discard pile.",
          },
        },
      ],
    });
  }

  if (slug === "friends") {
    schemas.push({
      "@type": "HowTo",
      "@id": `${abs}#howto`,
      name: isEs
        ? "Cómo jugar una partida privada con amigos en AI Sabotage"
        : "How to Play a Private Match with Friends in AI Sabotage",
      description: isEs
        ? "Organiza partidas privadas con amigos en AI Sabotage compartiendo un código de sala de 6 caracteres."
        : "Host a private match with friends in AI Sabotage using a 6-character room code.",
      step: [
        {
          "@type": "HowToStep",
          name: isEs ? "1. Crear el rig" : "1. Create the rig",
          text: isEs
            ? "Pulsa CREATE RIG para obtener un código de invitación de 6 caracteres."
            : "Tap CREATE RIG to receive a fresh 6-character invite code.",
        },
        {
          "@type": "HowToStep",
          name: isEs ? "2. Invitar amigos" : "2. Invite friends",
          text: isEs
            ? "Envía el código a tus amigos a través de cualquier app de mensajería."
            : "Send the code or join link to your friends via messaging apps.",
        },
        {
          "@type": "HowToStep",
          name: isEs ? "3. Unirse al vestíbulo" : "3. Friends join",
          text: isEs
            ? "Tus amigos pulsan JOIN RIG, escriben el código y entran a la sala."
            : "Friends tap JOIN RIG, enter the code, and appear in the live lobby.",
        },
        {
          "@type": "HowToStep",
          name: isEs ? "4. Iniciar el duelo" : "4. Start the match",
          text: isEs
            ? "El anfitrión inicia la partida para 2, 3 o 4 jugadores."
            : "The host launches the duel for 2, 3, or 4 players.",
        },
      ],
    });

    schemas.push({
      "@type": "FAQPage",
      "@id": `${abs}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: isEs
            ? "¿Afectan las partidas privadas a los puntos de ranking?"
            : "Do private matches affect ranking points?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "No. Las partidas privadas son amistosas y nunca suman ni restan puntos de ranking. Salir antes de tiempo no tiene penalización."
              : "No. Private matches are strictly friendly duels and never award or deduct ranking points. Leaving early incurs zero penalty.",
          },
        },
        {
          "@type": "Question",
          name: isEs
            ? "¿Cuántos jugadores pueden unirse a una partida privada?"
            : "How many players can join a private match?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "Las partidas privadas admiten 2, 3 o 4 jugadores en tiempo real con juego multiplataforma entre iOS y Android."
              : "Private matches support 2, 3, or 4 players in real-time cross-platform multiplayer between iOS and Android.",
          },
        },
      ],
    });
  }

  if (slug === "ranking") {
    schemas.push({
      "@type": "FAQPage",
      "@id": `${abs}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: isEs
            ? "¿Cómo funciona el sistema de puntos de ranking en AI Sabotage?"
            : "How do ranking points work in AI Sabotage?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "El juego clasificado tiene lugar en partidas públicas online. Cada victoria verificada suma +10 PTS, mientras que abandonar una partida a mitad de juego resta 5 PTS (con suelo en 0). Las partidas offline y privadas no alteran los puntos."
              : "Ranked play occurs in online public matches. Each authenticated victory awards +10 PTS, while abandoning mid-match deducts 5 PTS (floor 0). Offline and private matches do not affect points.",
          },
        },
        {
          "@type": "Question",
          name: isEs
            ? "¿Cuáles son los niveles del ranking?"
            : "What are the ranking tiers in AI Sabotage?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "La escalera cuenta con cuatro niveles: Bronce (0–499 PTS), Plata (500–999 PTS), Oro (1000–1499 PTS) y Quantum (1500+ PTS)."
              : "The ladder consists of four tiers: Bronze (0–499 PTS), Silver (500–999 PTS), Gold (1000–1499 PTS), and Quantum (1500+ PTS).",
          },
        },
      ],
    });
  }

  if (slug === "play") {
    schemas.push({
      "@type": "SoftwareApplication",
      "@id": `${abs}#app`,
      name: "AI Sabotage: Cyber Cards",
      operatingSystem: "iOS 14+, Android 9+",
      applicationCategory: "GameApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    });

    schemas.push({
      "@type": "FAQPage",
      "@id": `${abs}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: isEs ? "¿Es AI Sabotage gratuito?" : "Is AI Sabotage free to download and play?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "Sí. AI Sabotage es gratis para descargar en App Store y Google Play Store, con juego offline y online equitativo sin ventajas de pago."
              : "Yes. AI Sabotage is completely free to download on the App Store and Google Play Store, with fair offline and online gameplay.",
          },
        },
        {
          "@type": "Question",
          name: isEs
            ? "¿Qué requisitos técnicos necesita el juego?"
            : "What device requirements are needed?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "Requiere iOS 14 o superior para iPhone y iPad, o Android 9.0 o superior."
              : "Requires iOS 14.0 or later for iPhone/iPad, or Android 9.0 or later.",
          },
        },
        {
          "@type": "Question",
          name: isEs
            ? "¿Cómo se puede desbloquear PRO de forma gratuita?"
            : "Can PRO features be unlocked for free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: isEs
              ? "Además de la compra PRO, la app permite ver 3 anuncios de recompensa para obtener un pase PRO completo de 7 días con historial extendido de partidas."
              : "In addition to a PRO upgrade, you can watch 3 rewarded ads in the app to activate a full 7-day PRO pass with extended match history.",
          },
        },
      ],
    });
  }

  return schemas;
}

function head({ slug, titleKey, lang }) {
  const file = slug === "index" ? "" : slug + ".html";
  const abs = `${SITE_BASE}/${lang}/${file}`;
  const isEs = lang === "es";

  // Per-page metadata
  const metaObj = (I18N[lang]?.meta && I18N[lang].meta[slug]) || {};
  const globalMeta = I18N[lang]?.meta || {};
  const description = metaObj.description || globalMeta.description || "";
  const keywords = metaObj.keywords || globalMeta.keywords || "";
  const ogTitle = metaObj.ogTitle || globalMeta.ogTitle || "AI Sabotage: Build the AGI";
  const ogDescription = metaObj.ogDescription || globalMeta.ogDescription || description;

  const rawTitle = t(titleKey, lang);
  const template = I18N[lang]?.titleTemplate || "%title% · AI Sabotage";
  const pageTitle =
    slug === "index" ? "AI Sabotage: Cyber Cards" : template.replace("%title%", rawTitle);

  const schemas = getSchemas(slug, lang);

  return `<!doctype html>
<html lang="${lang}" data-title-key="${titleKey}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0D0D12" />
    <meta name="color-scheme" content="dark" />

    <title data-title-meta>${pageTitle}</title>
    <meta name="description" content="${description}" data-i18n-attr="content:meta.${slug}.description" />
    <meta name="keywords" content="${keywords}" data-i18n-attr="content:meta.${slug}.keywords" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="AI Sabotage: Cyber Cards" />
    <meta property="og:title" content="${ogTitle}" data-i18n-attr="content:meta.${slug}.ogTitle" />
    <meta property="og:description" content="${ogDescription}" data-i18n-attr="content:meta.${slug}.ogDescription" />
    <meta property="og:image" content="${SITE_BASE}/assets/img/icon.jpg" />
    <meta property="og:url" content="${abs}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" data-i18n-attr="content:meta.${slug}.ogTitle" />
    <meta name="twitter:description" content="${ogDescription}" data-i18n-attr="content:meta.${slug}.ogDescription" />
    <meta name="twitter:image" content="${SITE_BASE}/assets/img/icon.jpg" />

    <link rel="icon" type="image/jpeg" href="../assets/img/icon.jpg" />
    <link rel="apple-touch-icon" href="../assets/img/icon.jpg" />
    <link rel="manifest" href="../manifest.webmanifest" />
    <link rel="alternate" hreflang="en" href="${SITE_BASE}/en/${file}" />
    <link rel="alternate" hreflang="es" href="${SITE_BASE}/es/${file}" />
    <link rel="alternate" hreflang="x-default" href="${SITE_BASE}/en/${file}" />

    <link rel="preload" as="font" type="font/ttf" href="../assets/fonts/Orbitron.ttf" crossorigin />
    <link rel="preload" as="font" type="font/ttf" href="../assets/fonts/JetBrainsMono.ttf" crossorigin />

    <link rel="canonical" href="${abs}" />
    <link rel="stylesheet" href="../assets/css/style.css" />

    <script type="application/ld+json">
${JSON.stringify({ "@context": "https://schema.org", "@graph": schemas }, null, 2)}
    </script>
  </head>`;
}

function footer(lang) {
  const currentYear = new Date().getFullYear();
  const copyText = t("footer.copy", lang).replace("%year%", String(currentYear));
  return `
    <footer class="footer">
      <p data-i18n="footer.copy">${copyText}</p>
      <p class="footer-links" id="footer-links">
        <a href="rig.html" data-i18n="nav.rig">${t("nav.rig", lang)}</a> ·
        <a href="cards.html" data-i18n="nav.cards">${t("nav.cards", lang)}</a> ·
        <a href="friends.html" data-i18n="nav.friends">${t("nav.friends", lang)}</a> ·
        <a href="ranking.html" data-i18n="nav.ranking">${t("nav.ranking", lang)}</a> ·
        <a href="play.html" data-i18n="nav.play">${t("nav.play", lang)}</a>
      </p>
    </footer>`;
}

function scripts() {
  return `
    <script src="../assets/js/config.js" defer></script>
    <script src="../assets/js/i18n.js" defer></script>
    <script src="../assets/js/main.js" defer></script>`;
}

// ---------- page builders ----------

function buildHome() {
  return function render(lang) {
    const isEs = lang === "es";
    return `
${head({ slug: "index", titleKey: "siteTitle", lang })}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("index", lang)}

    <main>
      <section class="hero">
        <div class="wrap hero-inner">
          <div class="hero-data hero-data--left" aria-hidden="true">
            <span>// status</span><span data-i18n="rig.metaLine5">${t("rig.metaLine5", lang)}</span>
            <span>// packet</span><span data-i18n="rig.metaLine4">${t("rig.metaLine4", lang)}</span>
            <span>// turn</span><span data-i18n="rig.metaLine2">${t("rig.metaLine2", lang)}</span>
            <span>// player</span><span data-i18n="rig.metaLine1">${t("rig.metaLine1", lang)}</span>
          </div>
          <div class="hero-data hero-data--right" aria-hidden="true">
            <span>// nodes</span><span>1,284</span>
            <span>// uplink</span><span>secure</span>
            <span>// threats</span><span>active</span>
            <span>// agi</span><span>pending</span>
          </div>

          <p class="eyebrow" data-i18n="hero.eyebrow">${t("hero.eyebrow", lang)}</p>
          <h1 class="title">
            <span class="title-line" data-i18n="hero.titleA">${t("hero.titleA", lang)}</span>
            <span class="title-line title-line--accent" data-i18n="hero.titleB">${t("hero.titleB", lang)}</span>
            <span class="title-line" data-i18n="hero.titleC">${t("hero.titleC", lang)}</span>
            <span class="title-line title-line--accent" data-i18n="hero.titleD">${t("hero.titleD", lang)}</span>
          </h1>
          <p class="lede" data-i18n="hero.lede">${t("hero.lede", lang)}</p>

          <div class="hero-actions">
            <a class="btn btn-primary" data-store="download" href="play.html">
              <span data-i18n="hero.cta">${t("hero.cta", lang)}</span>
            </a>
          </div>

          <ul class="hero-tags" aria-label="Highlights">
            <li data-i18n="hero.tagA">${t("hero.tagA", lang)}</li>
            <li data-i18n="hero.tagB">${t("hero.tagB", lang)}</li>
            <li data-i18n="hero.tagC">${t("hero.tagC", lang)}</li>
            <li data-i18n="hero.tagD">${t("hero.tagD", lang)}</li>
          </ul>

          <div class="hero-art" aria-hidden="true">
            <div class="hand hand--left">
              <img class="card-img glow-blue" src="../assets/img/cmp_neural_net.png" alt="" />
              <img class="card-img glow-red" src="../assets/img/cmp_hardware.png" alt="" />
              <img class="card-img glow-green" src="../assets/img/cmp_dataset.png" alt="" />
            </div>
            <img class="hero-core" src="../assets/img/cmp_quantum_core.png" alt="" />
            <div class="hand hand--right">
              <img class="card-img glow-yellow" src="../assets/img/cmp_algorithm.png" alt="" />
              <img class="card-img glow-purple" src="../assets/img/pro_data_heist.png" alt="" />
              <img class="card-img glow-blue" src="../assets/img/def_neural_net.png" alt="" />
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <header class="section-head">
            <p class="kicker" data-i18n="extra.eyebrow">${t("extra.eyebrow", lang)}</p>
            <h2 class="section-title" data-i18n="extra.title">${t("extra.title", lang)}</h2>
            <p class="section-sub" data-i18n="extra.sub">${t("extra.sub", lang)}</p>
          </header>
        </div>

        <div class="extra-grid">
          <article class="extra-card extra-card">
            <p class="extra-card-kicker" data-i18n="extra.card1Kicker">${t("extra.card1Kicker", lang)}</p>
            <h3 data-i18n="extra.card1Title">${t("extra.card1Title", lang)}</h3>
            <p data-i18n="extra.card1Body">${t("extra.card1Body", lang)}</p>
          </article>
          <article class="extra-card">
            <p class="extra-card-kicker" data-i18n="extra.card2Kicker">${t("extra.card2Kicker", lang)}</p>
            <h3 data-i18n="extra.card2Title">${t("extra.card2Title", lang)}</h3>
            <p data-i18n="extra.card2Body">${t("extra.card2Body", lang)}</p>
          </article>
          <article class="extra-card">
            <p class="extra-card-kicker" data-i18n="extra.card3Kicker">${t("extra.card3Kicker", lang)}</p>
            <h3 data-i18n="extra.card3Title">${t("extra.card3Title", lang)}</h3>
            <p data-i18n="extra.card3Body">${t("extra.card3Body", lang)}</p>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title">${isEs ? "Preguntas Frecuentes" : "Frequently Asked Questions"}</h2>
            <p class="section-sub">${isEs ? "Todo lo que necesitas saber sobre AI Sabotage." : "Everything you need to know about AI Sabotage."}</p>
          </header>
          <div class="faq-grid">
            <article class="faq-card">
              <h3>${isEs ? "¿Qué es AI Sabotage: Cyber Cards?" : "What is AI Sabotage: Cyber Cards?"}</h3>
              <p>${isEs ? "AI Sabotage es un juego de cartas de estrategia cyberpunk para iOS y Android donde hasta 4 jugadores se baten en duelo para construir un rig de AGI con 4 componentes: Hardware, Dataset, Red Neuronal y Algoritmo. Cada partida dura unos 3 minutos combinando colección de sets y sabotaje táctico." : "AI Sabotage is a fast-paced cyberpunk strategy card game for iOS and Android where up to 4 players duel to construct an AGI rig across four component categories: Hardware, Dataset, Neural Net, and Algorithm. Each match lasts three minutes, combining set collection with cyber sabotage mechanics."}</p>
            </article>
            <article class="faq-card">
              <h3>${isEs ? "¿Cómo se gana una partida?" : "How do you win a match?"}</h3>
              <p>${isEs ? "Ganas de inmediato al reunir 4 componentes sanos distintos en tu rig, o usando el comodín Quantum Core en lugar de cualquier componente faltante. Los componentes sanos no tienen amenazas activas adheridas." : "You win immediately by assembling four different healthy components on your rig, or by using the Quantum Core wildcard to substitute for any missing slot. Healthy components have no active threats attached."}</p>
            </article>
            <article class="faq-card">
              <h3>${isEs ? "¿Se puede jugar offline sin internet?" : "Can I play offline without internet?"}</h3>
              <p>${isEs ? "Sí. AI Sabotage cuenta con un modo individual offline completo contra la CPU con tutorial guiado, y un modo hot-seat local para 2 a 4 jugadores en un único dispositivo sin necesidad de conexión a internet." : "Yes. AI Sabotage features a full single-player mode against CPU with an interactive tutorial, as well as a local hot-seat mode for 2–4 players on a single device without an internet connection."}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section section--cta">
        <div class="section-inner">
          <header class="section-head">
            <p class="kicker" data-i18n="extra.eyebrow">${t("extra.eyebrow", lang)}</p>
            <h2 class="section-title" data-i18n="extra.ctaTitle">${t("extra.ctaTitle", lang)}</h2>
            <p class="section-sub" data-i18n="extra.ctaSub">${t("extra.ctaSub", lang)}</p>
          </header>
          <div class="cta-row">
            <a class="btn btn-primary btn-lg" data-store="download" href="play.html">
              <span data-i18n="hero.cta">${t("hero.cta", lang)}</span>
              <span class="btn-sub" data-i18n="extra.ctaSub">${t("extra.ctaSub", lang)}</span>
            </a>
          </div>
        </div>
      </section>
    </main>

    ${footer(lang)}
    ${scripts()}
  </body>
</html>
`;
  };
}

function buildRig() {
  return function render(lang) {
    return `
${head({ slug: "rig", titleKey: "rig.heading", lang })}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("rig", lang)}

    <main>
      <section class="subhero">
        <div class="wrap">
          <header class="section-head">
            <p class="kicker" data-i18n="rig.kicker">${t("rig.kicker", lang)}</p>
            <h1 class="section-title" data-i18n="rig.heading">${t("rig.heading", lang)}</h1>
            <p class="section-sub" data-i18n="rig.sub">${t("rig.sub", lang)}</p>
          </header>
        </div>
      </section>

      <section class="section">
        <div class="rig">
          <div class="rig-slots">
            <div class="slot" data-cat="hardware">
              <div class="slot-index">[01]</div>
              <div class="slot-label" data-i18n="rig.slot1">${t("rig.slot1", lang)}</div>
              <div class="slot-bar"><span style="--w: 78%"></span></div>
            </div>
            <div class="slot" data-cat="dataset">
              <div class="slot-index">[02]</div>
              <div class="slot-label" data-i18n="rig.slot2">${t("rig.slot2", lang)}</div>
              <div class="slot-bar"><span style="--w: 64%"></span></div>
            </div>
            <div class="slot" data-cat="neural">
              <div class="slot-index">[03]</div>
              <div class="slot-label" data-i18n="rig.slot3">${t("rig.slot3", lang)}</div>
              <div class="slot-bar"><span style="--w: 88%"></span></div>
            </div>
            <div class="slot" data-cat="algorithm">
              <div class="slot-index">[04]</div>
              <div class="slot-label" data-i18n="rig.slot4">${t("rig.slot4", lang)}</div>
              <div class="slot-bar"><span style="--w: 52%"></span></div>
            </div>
          </div>

          <aside class="rig-meta" aria-label="HUD">
            <h3 class="sr-only" data-i18n="rig.metaTitle">${t("rig.metaTitle", lang)}</h3>
            <p class="meta-row"><span data-i18n="rig.metaLine1">${t("rig.metaLine1", lang)}</span><span>●</span></p>
            <p class="meta-row"><span data-i18n="rig.metaLine2">${t("rig.metaLine2", lang)}</span><span>●</span></p>
            <p class="meta-row"><span data-i18n="rig.metaLine3">${t("rig.metaLine3", lang)}</span><span>●</span></p>
            <p class="meta-row"><span data-i18n="rig.metaLine4">${t("rig.metaLine4", lang)}</span><span class="ok">●</span></p>
            <p class="meta-row"><span data-i18n="rig.metaLine5">${t("rig.metaLine5", lang)}</span><span class="ok">●</span></p>
          </aside>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title" data-i18n="rig.deepTitle">${t("rig.deepTitle", lang)}</h2>
            <p class="section-sub" data-i18n="rig.deepSub">${t("rig.deepSub", lang)}</p>
          </header>
          <div class="steps">
            <article class="step"><h3 data-i18n="rig.step1Title">${t("rig.step1Title", lang)}</h3><p data-i18n="rig.step1Body">${t("rig.step1Body", lang)}</p></article>
            <article class="step"><h3 data-i18n="rig.step2Title">${t("rig.step2Title", lang)}</h3><p data-i18n="rig.step2Body">${t("rig.step2Body", lang)}</p></article>
            <article class="step"><h3 data-i18n="rig.step3Title">${t("rig.step3Title", lang)}</h3><p data-i18n="rig.step3Body">${t("rig.step3Body", lang)}</p></article>
            <article class="step"><h3 data-i18n="rig.step4Title">${t("rig.step4Title", lang)}</h3><p data-i18n="rig.step4Body">${t("rig.step4Body", lang)}</p></article>
          </div>
        </div>
      </section>
    </main>

    ${footer(lang)}
    ${scripts()}
  </body>
</html>
`;
  };
}

function buildCards() {
  return function render(lang) {
    return `
${head({ slug: "cards", titleKey: "cardsPage.heading", lang })}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("cards", lang)}

    <main>
      <section class="subhero">
        <div class="wrap">
          <header class="section-head">
            <p class="kicker" data-i18n="cardsPage.kicker">${t("cardsPage.kicker", lang)}</p>
            <h1 class="section-title" data-i18n="cardsPage.heading">${t("cardsPage.heading", lang)}</h1>
            <p class="section-sub" data-i18n="cardsPage.sub">${t("cardsPage.sub", lang)}</p>
          </header>
        </div>
      </section>

      <section class="section deck-group" data-group="components">
        <div class="section-inner">
          <header class="section-head section-head--left">
            <p class="kicker" data-i18n="cardsPage.groupComponentsKicker">${t("cardsPage.groupComponentsKicker", lang)}</p>
            <h2 class="section-title" data-i18n="cardsPage.groupComponents">${t("cardsPage.groupComponents", lang)}</h2>
            <p class="section-sub" data-i18n="cardsPage.groupComponentsSub">${t("cardsPage.groupComponentsSub", lang)}</p>
          </header>
          <div class="deck-grid" data-deck="components"></div>
        </div>
      </section>

      <section class="section deck-group" data-group="threats">
        <div class="section-inner">
          <header class="section-head section-head--left">
            <p class="kicker" data-i18n="cardsPage.groupThreatsKicker">${t("cardsPage.groupThreatsKicker", lang)}</p>
            <h2 class="section-title" data-i18n="cardsPage.groupThreats">${t("cardsPage.groupThreats", lang)}</h2>
            <p class="section-sub" data-i18n="cardsPage.groupThreatsSub">${t("cardsPage.groupThreatsSub", lang)}</p>
          </header>
          <div class="deck-grid" data-deck="threats"></div>
        </div>
      </section>

      <section class="section deck-group" data-group="defenses">
        <div class="section-inner">
          <header class="section-head section-head--left">
            <p class="kicker" data-i18n="cardsPage.groupDefensesKicker">${t("cardsPage.groupDefensesKicker", lang)}</p>
            <h2 class="section-title" data-i18n="cardsPage.groupDefenses">${t("cardsPage.groupDefenses", lang)}</h2>
            <p class="section-sub" data-i18n="cardsPage.groupDefensesSub">${t("cardsPage.groupDefensesSub", lang)}</p>
          </header>
          <div class="deck-grid" data-deck="defenses"></div>
        </div>
      </section>

      <section class="section deck-group" data-group="protocols">
        <div class="section-inner">
          <header class="section-head section-head--left">
            <p class="kicker" data-i18n="cardsPage.groupProtocolsKicker">${t("cardsPage.groupProtocolsKicker", lang)}</p>
            <h2 class="section-title" data-i18n="cardsPage.groupProtocols">${t("cardsPage.groupProtocols", lang)}</h2>
            <p class="section-sub" data-i18n="cardsPage.groupProtocolsSub">${t("cardsPage.groupProtocolsSub", lang)}</p>
          </header>
          <div class="deck-grid" data-deck="protocols"></div>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title" data-i18n="cardsPage.examplesTitle">${t("cardsPage.examplesTitle", lang)}</h2>
            <p class="section-sub" data-i18n="cardsPage.cardsDeep">${t("cardsPage.cardsDeep", lang)}</p>
          </header>
          <div class="combos">
            <article class="combo"><h3 data-i18n="cardsPage.comboATitle">${t("cardsPage.comboATitle", lang)}</h3><p data-i18n="cardsPage.comboABody">${t("cardsPage.comboABody", lang)}</p></article>
            <article class="combo"><h3 data-i18n="cardsPage.comboBTitle">${t("cardsPage.comboBTitle", lang)}</h3><p data-i18n="cardsPage.comboBBody">${t("cardsPage.comboBBody", lang)}</p></article>
            <article class="combo"><h3 data-i18n="cardsPage.comboCTitle">${t("cardsPage.comboCTitle", lang)}</h3><p data-i18n="cardsPage.comboCBody">${t("cardsPage.comboCBody", lang)}</p></article>
          </div>
        </div>
      </section>
    </main>

    ${footer(lang)}
    ${scripts()}
  </body>
</html>
`;
  };
}

function buildFriends() {
  return function render(lang) {
    return `
${head({ slug: "friends", titleKey: "friends.heading", lang })}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("friends", lang)}

    <main>
      <section class="subhero">
        <div class="wrap">
          <header class="section-head">
            <p class="kicker" data-i18n="friends.kicker">${t("friends.kicker", lang)}</p>
            <h1 class="section-title" data-i18n="friends.heading">${t("friends.heading", lang)}</h1>
            <p class="section-sub" data-i18n="friends.sub">${t("friends.sub", lang)}</p>
          </header>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <div class="steps">
            <article class="step">
              <h3 data-i18n="friends.step1Title">${t("friends.step1Title", lang)}</h3>
              <p data-i18n="friends.step1Body">${t("friends.step1Body", lang)}</p>
            </article>
            <article class="step">
              <h3 data-i18n="friends.step2Title">${t("friends.step2Title", lang)}</h3>
              <p data-i18n="friends.step2Body">${t("friends.step2Body", lang)}</p>
            </article>
            <article class="step">
              <h3 data-i18n="friends.step3Title">${t("friends.step3Title", lang)}</h3>
              <p data-i18n="friends.step3Body">${t("friends.step3Body", lang)}</p>
            </article>
            <article class="step">
              <h3 data-i18n="friends.step4Title">${t("friends.step4Title", lang)}</h3>
              <p data-i18n="friends.step4Body">${t("friends.step4Body", lang)}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section section--cta">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title" data-i18n="friends.ctaTitle">${t("friends.ctaTitle", lang)}</h2>
            <p class="section-sub" data-i18n="friends.ctaSub">${t("friends.ctaSub", lang)}</p>
          </header>
          <div class="cta-row">
            <a class="btn btn-primary btn-lg" data-store="download" href="play.html">
              <span data-i18n="hero.cta">${t("hero.cta", lang)}</span>
              <span class="btn-sub" data-i18n="extra.ctaSub">${t("extra.ctaSub", lang)}</span>
            </a>
          </div>
        </div>
      </section>
    </main>

    ${footer(lang)}
    ${scripts()}
  </body>
</html>
`;
  };
}

function buildRanking() {
  return function render(lang) {
    return `
${head({ slug: "ranking", titleKey: "ranking.heading", lang })}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("ranking", lang)}

    <main>
      <section class="subhero">
        <div class="wrap">
          <header class="section-head">
            <p class="kicker" data-i18n="ranking.kicker">${t("ranking.kicker", lang)}</p>
            <h1 class="section-title" data-i18n="ranking.heading">${t("ranking.heading", lang)}</h1>
            <p class="section-sub" data-i18n="ranking.sub">${t("ranking.sub", lang)}</p>
          </header>
        </div>
      </section>

      <section class="section">
        <div class="ranking-table">
          <div class="ranking-head" role="row">
            <span data-i18n="ranking.col.pos">${t("ranking.col.pos", lang)}</span>
            <span data-i18n="ranking.col.player">${t("ranking.col.player", lang)}</span>
            <span data-i18n="ranking.col.pts">${t("ranking.col.pts", lang)}</span>
          </div>
          <ol class="ranking" id="ranking-list">
            <li><span class="rank rank--1">01</span><span class="who">NOVA-7</span><span class="pts">2,140</span></li>
            <li><span class="rank rank--2">02</span><span class="who">CIPHER</span><span class="pts">1,985</span></li>
            <li><span class="rank rank--3">03</span><span class="who">KERNEL_42</span><span class="pts">1,820</span></li>
            <li><span class="rank">04</span><span class="who">ORACLE-X</span><span class="pts">1,640</span></li>
            <li><span class="rank">05</span><span class="who">DANNI_01</span><span class="pts">1,505</span></li>
            <li><span class="rank">06</span><span class="who">HEX_PRIME</span><span class="pts">1,402</span></li>
            <li><span class="rank">07</span><span class="who">NULL_PTR</span><span class="pts">1,318</span></li>
          </ol>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title" data-i18n="ranking.howTitle">${t("ranking.howTitle", lang)}</h2>
            <p class="section-sub" data-i18n="ranking.howBody">${t("ranking.howBody", lang)}</p>
          </header>
          <div class="tiers">
            <article class="tier" data-tier="bronze"><h3 data-i18n="ranking.tierBronze">${t("ranking.tierBronze", lang)}</h3><p data-i18n="ranking.tierBronzeBody">${t("ranking.tierBronzeBody", lang)}</p></article>
            <article class="tier" data-tier="silver"><h3 data-i18n="ranking.tierSilver">${t("ranking.tierSilver", lang)}</h3><p data-i18n="ranking.tierSilverBody">${t("ranking.tierSilverBody", lang)}</p></article>
            <article class="tier" data-tier="gold"><h3 data-i18n="ranking.tierGold">${t("ranking.tierGold", lang)}</h3><p data-i18n="ranking.tierGoldBody">${t("ranking.tierGoldBody", lang)}</p></article>
            <article class="tier" data-tier="quantum"><h3 data-i18n="ranking.tierQuantum">${t("ranking.tierQuantum", lang)}</h3><p data-i18n="ranking.tierQuantumBody">${t("ranking.tierQuantumBody", lang)}</p></article>
          </div>
        </div>
      </section>
    </main>

    ${footer(lang)}
    ${scripts()}
  </body>
</html>
`;
  };
}

function buildPlay() {
  return function render(lang) {
    return `
${head({ slug: "play", titleKey: "play.heading", lang })}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("play", lang)}

    <main>
      <section class="subhero">
        <div class="wrap">
          <header class="section-head">
            <p class="kicker" data-i18n="play.kicker">${t("play.kicker", lang)}</p>
            <h1 class="section-title" data-i18n="play.heading">${t("play.heading", lang)}</h1>
            <p class="section-sub" data-i18n="play.sub">${t("play.sub", lang)}</p>
          </header>
        </div>
      </section>

      <section class="section section--cta">
        <div class="section-inner">
          <div class="cta-row">
            <a class="btn btn-primary btn-lg" data-store="download" href="#">
              <span data-i18n="hero.cta">${t("hero.cta", lang)}</span>
              <span class="btn-sub" data-i18n="hero.ctaSub">${t("hero.ctaSub", lang)}</span>
            </a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title" data-i18n="play.whatTitle">${t("play.whatTitle", lang)}</h2>
          </header>
          <ul class="play-list">
            <li data-i18n="play.freeLine1">${t("play.freeLine1", lang)}</li>
            <li data-i18n="play.freeLine2">${t("play.freeLine2", lang)}</li>
            <li data-i18n="play.freeLine3">${t("play.freeLine3", lang)}</li>
            <li data-i18n="play.freeLine4">${t("play.freeLine4", lang)}</li>
          </ul>

          <header class="section-head">
            <h2 class="section-title" data-i18n="play.requirementsTitle">${t("play.requirementsTitle", lang)}</h2>
          </header>
          <div class="play-reqs">
            <article class="play-req"><h3 data-i18n="play.ios">${t("play.ios", lang)}</h3><p data-i18n="play.reqIos">${t("play.reqIos", lang)}</p></article>
            <article class="play-req"><h3 data-i18n="play.android">${t("play.android", lang)}</h3><p data-i18n="play.reqAndroid">${t("play.reqAndroid", lang)}</p></article>
          </div>
        </div>
      </section>
    </main>

    ${footer(lang)}
    ${scripts()}
  </body>
</html>
`;
  };
}

// ---------- emit ----------

for (const page of PAGES) {
  const render = page.build();
  const enOut = render("en");
  const esOut = render("es");
  const enFile = page.slug === "index" ? "index.html" : `${page.slug}.html`;
  const esFile = page.slug === "index" ? "index.html" : `${page.slug}.html`;
  fs.writeFileSync(path.join(enDir, enFile), enOut);
  fs.writeFileSync(path.join(esDir, esFile), esOut);
  console.log("wrote", `en/${enFile}`, `+`, `es/${esFile}`);
}

// root index → redirect to /en/
fs.writeFileSync(
  path.join(ROOT, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>AI Sabotage: Cyber Cards</title>
    <meta http-equiv="refresh" content="0; url=./en/" />
    <link rel="canonical" href="${SITE_BASE}/en/" />
    <script>window.location.replace("./en/");</script>
  </head>
  <body>
    <p>Redirecting to <a href="./en/">AI Sabotage</a>...</p>
  </body>
</html>
`,
);

console.log("wrote root index.html → /en/");
