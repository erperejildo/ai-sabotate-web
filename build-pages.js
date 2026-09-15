// One-off builder. Emits 12 HTML pages + the root redirect.
// Run with: node build-pages.js
const fs = require("fs");
const path = require("path");

const SITE_BASE = "https://erperejildo.github.io/ai-sabotate-web";
const ROOT = __dirname;
const SHARED = path.join(ROOT, "shared");
const enDir = path.join(ROOT, "en");
const esDir = path.join(ROOT, "es");

fs.mkdirSync(enDir, { recursive: true });
fs.mkdirSync(esDir, { recursive: true });

const PAGES = [
  // home — index.html only (no anchor)
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
        }"></a>`,
    )
    .join("\n          ");
  const homeHref = "index.html";
  const brandClass = slug === "index" ? "is-active" : "";
  const otherLang = lang === "en" ? "es" : "en";
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
          <button class="lang-switch" type="button" data-lang-switch="${otherLang}" aria-label="Switch language"></button>
        </div>
      </div>
    </header>
`;
}

function head({ slug, titleKey, description, keywords, ogTitle, ogDescription, lang }) {
  const file = slug === "index" ? "" : slug + ".html";
  const abs = `${SITE_BASE}/${lang}/${file}`;
  return `<!doctype html>
<html lang="${lang}" data-title-key="${titleKey}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0D0D12" />
    <meta name="color-scheme" content="dark" />

    <title data-title-meta></title>
    <meta name="description" content="${description}" data-i18n-attr="content:meta.description" />
    <meta name="keywords" content="${keywords}" data-i18n-attr="content:meta.keywords" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="AI Sabotage: Cyber Cards" />
    <meta property="og:title" content="${ogTitle}" data-i18n-attr="content:meta.ogTitle" />
    <meta property="og:description" content="${ogDescription}" data-i18n-attr="content:meta.ogDescription" />
    <meta property="og:image" content="../assets/img/icon.jpg" />
    <meta property="og:url" content="${abs}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${ogTitle}" data-i18n-attr="content:meta.ogTitle" />
    <meta name="twitter:description" content="${ogDescription}" data-i18n-attr="content:meta.ogDescription" />
    <meta name="twitter:image" content="../assets/img/icon.jpg" />

    <link rel="icon" type="image/jpeg" href="../assets/img/icon.jpg" />
    <link rel="apple-touch-icon" href="../assets/img/icon.jpg" />
    <link rel="manifest" href="../manifest.webmanifest" />
    <link rel="alternate" hreflang="en" href="${SITE_BASE}/en/${file}" />
    <link rel="alternate" hreflang="es" href="${SITE_BASE}/es/${file}" />

    <link rel="preload" as="font" type="font/ttf" href="../assets/fonts/Orbitron.ttf" crossorigin />
    <link rel="preload" as="font" type="font/ttf" href="../assets/fonts/JetBrainsMono.ttf" crossorigin />

    <link rel="canonical" href="${abs}" />
    <link rel="stylesheet" href="../assets/css/style.css" />
  </head>`;
}

function footer() {
  return `
    <footer class="footer">
      <p data-i18n="footer.copy"></p>
      <p class="footer-links" id="footer-links">
        <a href="rig.html" data-i18n="nav.rig"></a> ·
        <a href="cards.html" data-i18n="nav.cards"></a> ·
        <a href="friends.html" data-i18n="nav.friends"></a> ·
        <a href="ranking.html" data-i18n="nav.ranking"></a> ·
        <a href="play.html" data-i18n="nav.play"></a>
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
    return `
${head({
  slug: "index",
  titleKey: "siteTitle",
  description: "Auto",
  keywords: "Auto",
  ogTitle: "Auto",
  ogDescription: "Auto",
  lang,
})}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("index", lang)}

    <main>
      <section class="hero">
        <div class="wrap hero-inner">
          <div class="hero-data hero-data--left" aria-hidden="true">
            <span>// status</span><span data-i18n="rig.metaLine5"></span>
            <span>// packet</span><span data-i18n="rig.metaLine4"></span>
            <span>// turn</span><span data-i18n="rig.metaLine2"></span>
            <span>// player</span><span data-i18n="rig.metaLine1"></span>
          </div>
          <div class="hero-data hero-data--right" aria-hidden="true">
            <span>// nodes</span><span>1,284</span>
            <span>// uplink</span><span>secure</span>
            <span>// threats</span><span>active</span>
            <span>// agi</span><span>pending</span>
          </div>

          <p class="eyebrow" data-i18n="hero.eyebrow"></p>
          <h1 class="title">
            <span class="title-line" data-i18n="hero.titleA"></span>
            <span class="title-line title-line--accent" data-i18n="hero.titleB"></span>
            <span class="title-line" data-i18n="hero.titleC"></span>
            <span class="title-line title-line--accent" data-i18n="hero.titleD"></span>
          </h1>
          <p class="lede" data-i18n="hero.lede"></p>

          <div class="hero-actions">
            <a class="btn btn-primary" data-store="download" href="play.html">
              <span data-i18n="hero.cta"></span>
            </a>
          </div>

          <ul class="hero-tags" aria-label="Highlights">
            <li data-i18n="hero.tagA"></li>
            <li data-i18n="hero.tagB"></li>
            <li data-i18n="hero.tagC"></li>
            <li data-i18n="hero.tagD"></li>
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
            <p class="kicker" data-i18n="extra.eyebrow"></p>
            <h2 class="section-title" data-i18n="extra.title"></h2>
            <p class="section-sub" data-i18n="extra.sub"></p>
          </header>
        </div>

        <div class="extra-grid">
          <article class="extra-card extra-card">
            <p class="extra-card-kicker" data-i18n="extra.card1Kicker"></p>
            <h3 data-i18n="extra.card1Title"></h3>
            <p data-i18n="extra.card1Body"></p>
          </article>
          <article class="extra-card">
            <p class="extra-card-kicker" data-i18n="extra.card2Kicker"></p>
            <h3 data-i18n="extra.card2Title"></h3>
            <p data-i18n="extra.card2Body"></p>
          </article>
          <article class="extra-card">
            <p class="extra-card-kicker" data-i18n="extra.card3Kicker"></p>
            <h3 data-i18n="extra.card3Title"></h3>
            <p data-i18n="extra.card3Body"></p>
          </article>
        </div>
      </section>

      <section class="section section--cta">
        <div class="section-inner">
          <header class="section-head">
            <p class="kicker" data-i18n="extra.eyebrow"></p>
            <h2 class="section-title" data-i18n="extra.ctaTitle"></h2>
            <p class="section-sub" data-i18n="extra.ctaSub"></p>
          </header>
          <div class="cta-row">
            <a class="btn btn-primary btn-lg" data-store="download" href="play.html">
              <span data-i18n="hero.cta"></span>
              <span class="btn-sub" data-i18n="extra.ctaSub"></span>
            </a>
          </div>
        </div>
      </section>
    </main>

    ${footer()}
    ${scripts()}
  </body>
</html>
`;
  };
}

function buildRig() {
  return function render(lang) {
    return `
${head({
  slug: "rig",
  titleKey: "rig.heading",
  description: "Auto",
  keywords: "Auto",
  ogTitle: "Auto",
  ogDescription: "Auto",
  lang,
})}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("rig", lang)}

    <main>
      <section class="subhero">
        <div class="wrap">
          <header class="section-head">
            <p class="kicker" data-i18n="rig.kicker"></p>
            <h1 class="section-title" data-i18n="rig.heading"></h1>
            <p class="section-sub" data-i18n="rig.sub"></p>
          </header>
        </div>
      </section>

      <section class="section">
        <div class="rig">
          <div class="rig-slots">
            <div class="slot" data-cat="hardware">
              <div class="slot-index">[01]</div>
              <div class="slot-label" data-i18n="rig.slot1"></div>
              <div class="slot-bar"><span style="--w: 78%"></span></div>
            </div>
            <div class="slot" data-cat="dataset">
              <div class="slot-index">[02]</div>
              <div class="slot-label" data-i18n="rig.slot2"></div>
              <div class="slot-bar"><span style="--w: 64%"></span></div>
            </div>
            <div class="slot" data-cat="neural">
              <div class="slot-index">[03]</div>
              <div class="slot-label" data-i18n="rig.slot3"></div>
              <div class="slot-bar"><span style="--w: 88%"></span></div>
            </div>
            <div class="slot" data-cat="algorithm">
              <div class="slot-index">[04]</div>
              <div class="slot-label" data-i18n="rig.slot4"></div>
              <div class="slot-bar"><span style="--w: 52%"></span></div>
            </div>
          </div>

          <aside class="rig-meta" aria-label="HUD">
            <h3 class="sr-only" data-i18n="rig.metaTitle"></h3>
            <p class="meta-row"><span data-i18n="rig.metaLine1"></span><span>●</span></p>
            <p class="meta-row"><span data-i18n="rig.metaLine2"></span><span>●</span></p>
            <p class="meta-row"><span data-i18n="rig.metaLine3"></span><span>●</span></p>
            <p class="meta-row"><span data-i18n="rig.metaLine4"></span><span class="ok">●</span></p>
            <p class="meta-row"><span data-i18n="rig.metaLine5"></span><span class="ok">●</span></p>
          </aside>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title" data-i18n="rig.deepTitle"></h2>
            <p class="section-sub" data-i18n="rig.deepSub"></p>
          </header>
          <div class="steps">
            <article class="step step"><h3 data-i18n="rig.step1Title"></h3><p data-i18n="rig.step1Body"></p></article>
            <article class="step"><h3 data-i18n="rig.step2Title"></h3><p data-i18n="rig.step2Body"></p></article>
            <article class="step"><h3 data-i18n="rig.step3Title"></h3><p data-i18n="rig.step3Body"></p></article>
            <article class="step"><h3 data-i18n="rig.step4Title"></h3><p data-i18n="rig.step4Body"></p></article>
          </div>
        </div>
      </section>
    </main>

    ${footer()}
    ${scripts()}
  </body>
</html>
`;
  };
}

function buildCards() {
  return function render(lang) {
    return `
${head({
  slug: "cards",
  titleKey: "cardsPage.heading",
  description: "Auto",
  keywords: "Auto",
  ogTitle: "Auto",
  ogDescription: "Auto",
  lang,
})}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("cards", lang)}

    <main>
      <section class="subhero">
        <div class="wrap">
          <header class="section-head">
            <p class="kicker" data-i18n="cardsPage.kicker"></p>
            <h1 class="section-title" data-i18n="cardsPage.heading"></h1>
            <p class="section-sub" data-i18n="cardsPage.sub"></p>
          </header>
        </div>
      </section>

      <section class="section deck-group" data-group="components">
        <div class="section-inner">
          <header class="section-head section-head--left">
            <p class="kicker" data-i18n="cardsPage.groupComponentsKicker"></p>
            <h2 class="section-title" data-i18n="cardsPage.groupComponents"></h2>
            <p class="section-sub" data-i18n="cardsPage.groupComponentsSub"></p>
          </header>
          <div class="deck-grid" data-deck="components"></div>
        </div>
      </section>

      <section class="section deck-group" data-group="threats">
        <div class="section-inner">
          <header class="section-head section-head--left">
            <p class="kicker" data-i18n="cardsPage.groupThreatsKicker"></p>
            <h2 class="section-title" data-i18n="cardsPage.groupThreats"></h2>
            <p class="section-sub" data-i18n="cardsPage.groupThreatsSub"></p>
          </header>
          <div class="deck-grid" data-deck="threats"></div>
        </div>
      </section>

      <section class="section deck-group" data-group="defenses">
        <div class="section-inner">
          <header class="section-head section-head--left">
            <p class="kicker" data-i18n="cardsPage.groupDefensesKicker"></p>
            <h2 class="section-title" data-i18n="cardsPage.groupDefenses"></h2>
            <p class="section-sub" data-i18n="cardsPage.groupDefensesSub"></p>
          </header>
          <div class="deck-grid" data-deck="defenses"></div>
        </div>
      </section>

      <section class="section deck-group" data-group="protocols">
        <div class="section-inner">
          <header class="section-head section-head--left">
            <p class="kicker" data-i18n="cardsPage.groupProtocolsKicker"></p>
            <h2 class="section-title" data-i18n="cardsPage.groupProtocols"></h2>
            <p class="section-sub" data-i18n="cardsPage.groupProtocolsSub"></p>
          </header>
          <div class="deck-grid" data-deck="protocols"></div>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title" data-i18n="cardsPage.examplesTitle"></h2>
            <p class="section-sub" data-i18n="cardsPage.cardsDeep"></p>
          </header>
          <div class="combos">
            <article class="combo"><h3 data-i18n="cardsPage.comboATitle"></h3><p data-i18n="cardsPage.comboABody"></p></article>
            <article class="combo"><h3 data-i18n="cardsPage.comboBTitle"></h3><p data-i18n="cardsPage.comboBBody"></p></article>
            <article class="combo"><h3 data-i18n="cardsPage.comboCTitle"></h3><p data-i18n="cardsPage.comboCBody"></p></article>
          </div>
        </div>
      </section>
    </main>

    ${footer()}
    ${scripts()}
  </body>
</html>
`;
  };
}

function buildFriends() {
  return function render(lang) {
    return `
${head({
  slug: "friends",
  titleKey: "friends.heading",
  description: "Auto",
  keywords: "Auto",
  ogTitle: "Auto",
  ogDescription: "Auto",
  lang,
})}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("friends", lang)}

    <main>
      <section class="subhero">
        <div class="wrap">
          <header class="section-head">
            <p class="kicker" data-i18n="friends.kicker"></p>
            <h1 class="section-title" data-i18n="friends.heading"></h1>
            <p class="section-sub" data-i18n="friends.sub"></p>
          </header>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title" data-i18n="friends.howTitle"></h2>
            <p class="section-sub" data-i18n="friends.howSub"></p>
          </header>
          <div class="steps">
            <article class="step">
              <h3 data-i18n="friends.step1Title"></h3>
              <p data-i18n="friends.step1Body"></p>
            </article>
            <article class="step">
              <h3 data-i18n="friends.step2Title"></h3>
              <p data-i18n="friends.step2Body"></p>
            </article>
            <article class="step">
              <h3 data-i18n="friends.step3Title"></h3>
              <p data-i18n="friends.step3Body"></p>
            </article>
            <article class="step">
              <h3 data-i18n="friends.step4Title"></h3>
              <p data-i18n="friends.step4Body"></p>
            </article>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <div class="extra-grid">
            <article class="extra-card">
              <p class="kicker" data-i18n="friends.card1Kicker"></p>
              <h3 data-i18n="friends.card1Title"></h3>
              <p data-i18n="friends.card1Body"></p>
            </article>
            <article class="extra-card">
              <p class="kicker" data-i18n="friends.card2Kicker"></p>
              <h3 data-i18n="friends.card2Title"></h3>
              <p data-i18n="friends.card2Body"></p>
            </article>
            <article class="extra-card">
              <p class="kicker" data-i18n="friends.card3Kicker"></p>
              <h3 data-i18n="friends.card3Title"></h3>
              <p data-i18n="friends.card3Body"></p>
            </article>
          </div>
        </div>
      </section>

      <section class="section section--cta">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title" data-i18n="friends.ctaTitle"></h2>
            <p class="section-sub" data-i18n="friends.ctaSub"></p>
          </header>
          <div class="cta-row">
            <a class="btn btn-primary btn-lg" data-store="download" href="play.html">
              <span data-i18n="hero.cta"></span>
              <span class="btn-sub" data-i18n="extra.ctaSub"></span>
            </a>
          </div>
        </div>
      </section>
    </main>

    ${footer()}
    ${scripts()}
  </body>
</html>
`;
  };
}

function buildRanking() {
  return function render(lang) {
    return `
${head({
  slug: "ranking",
  titleKey: "ranking.heading",
  description: "Auto",
  keywords: "Auto",
  ogTitle: "Auto",
  ogDescription: "Auto",
  lang,
})}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("ranking", lang)}

    <main>
      <section class="subhero">
        <div class="wrap">
          <header class="section-head">
            <p class="kicker" data-i18n="ranking.kicker"></p>
            <h1 class="section-title" data-i18n="ranking.heading"></h1>
            <p class="section-sub" data-i18n="ranking.sub"></p>
          </header>
        </div>
      </section>

      <section class="section">
        <div class="ranking-table">
          <div class="ranking-head" role="row">
            <span data-i18n="ranking.col.pos"></span>
            <span data-i18n="ranking.col.player"></span>
            <span data-i18n="ranking.col.pts"></span>
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
            <h2 class="section-title" data-i18n="ranking.howTitle"></h2>
            <p class="section-sub" data-i18n="ranking.howBody"></p>
          </header>
          <div class="tiers">
            <article class="tier" data-tier="bronze"><h3 data-i18n="ranking.tierBronze"></h3><p data-i18n="ranking.tierBronzeBody"></p></article>
            <article class="tier" data-tier="silver"><h3 data-i18n="ranking.tierSilver"></h3><p data-i18n="ranking.tierSilverBody"></p></article>
            <article class="tier" data-tier="gold"><h3 data-i18n="ranking.tierGold"></h3><p data-i18n="ranking.tierGoldBody"></p></article>
            <article class="tier" data-tier="quantum"><h3 data-i18n="ranking.tierQuantum"></h3><p data-i18n="ranking.tierQuantumBody"></p></article>
          </div>
        </div>
      </section>
    </main>

    ${footer()}
    ${scripts()}
  </body>
</html>
`;
  };
}

function buildPlay() {
  return function render(lang) {
    return `
${head({
  slug: "play",
  titleKey: "play.heading",
  description: "Auto",
  keywords: "Auto",
  ogTitle: "Auto",
  ogDescription: "Auto",
  lang,
})}
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    ${nav("play", lang)}

    <main>
      <section class="subhero">
        <div class="wrap">
          <header class="section-head">
            <p class="kicker" data-i18n="play.kicker"></p>
            <h1 class="section-title" data-i18n="play.heading"></h1>
            <p class="section-sub" data-i18n="play.sub"></p>
          </header>
        </div>
      </section>

      <section class="section section--cta">
        <div class="section-inner">
          <div class="cta-row">
            <a class="btn btn-primary btn-lg" data-store="download" href="#">
              <span data-i18n="hero.cta"></span>
              <span class="btn-sub" data-i18n="hero.ctaSub"></span>
            </a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-inner">
          <header class="section-head">
            <h2 class="section-title" data-i18n="play.whatTitle"></h2>
          </header>
          <ul class="play-list">
            <li data-i18n="play.freeLine1"></li>
            <li data-i18n="play.freeLine2"></li>
            <li data-i18n="play.freeLine3"></li>
            <li data-i18n="play.freeLine4"></li>
          </ul>

          <header class="section-head">
            <h2 class="section-title" data-i18n="play.requirementsTitle"></h2>
          </header>
          <div class="play-reqs">
            <article class="play-req"><h3 data-i18n="play.ios"></h3><p data-i18n="play.reqIos"></p></article>
            <article class="play-req"><h3 data-i18n="play.android"></h3><p data-i18n="play.reqAndroid"></p></article>
          </div>
        </div>
      </section>
    </main>

    ${footer()}
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
    <title>AI Sabotage</title>
    <meta http-equiv="refresh" content="0; url=./en/" />
    <link rel="canonical" href="/en/" />
    <script>window.location.replace("./en/");</script>
  </head>
  <body>
    <p>Redirecting to <a href="/en/">/en/</a></p>
  </body>
</html>
`,
);

console.log("wrote root index.html → /en/");
