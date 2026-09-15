(function () {
  "use strict";

  const cfg = window.AI_SABOTAGE_CONFIG || {};
  const APP_STORE_URL = cfg.APP_STORE_URL || "#";
  const PLAY_STORE_URL = cfg.PLAY_STORE_URL || "#";
  const I18N = window.I18N || { en: {}, es: {} };

  // ---------- language ----------
  function detectLang() {
    const supported = ["en", "es"];
    const stored = (() => {
      try {
        return localStorage.getItem("lang");
      } catch (_) {
        return null;
      }
    })();
    if (stored && supported.includes(stored)) return stored;

    // directory of the current document, e.g. "/ai-sabotate-web/en/rig.html" -> ".../en"
    const dir = window.location.pathname.replace(/\/[^/]*$/, "").toLowerCase();
    if (/(^|\/)es$/.test(dir)) return "es";
    if (/(^|\/)en$/.test(dir)) return "en";

    const nav = (navigator.language || "en").toLowerCase();
    if (nav.startsWith("es")) return "es";
    return "en";
  }

  const lang = detectLang();
  const dict = I18N[lang] || I18N.en;

  // ---------- render: data-i18n attributes ----------
  function render() {
    document.documentElement.setAttribute("lang", lang);
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = key.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), dict);
      if (typeof value === "string") el.textContent = value;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      const value = key.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), dict);
      if (typeof value === "string") el.innerHTML = value;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.getAttribute("data-i18n-attr")
        .split(";")
        .forEach((pair) => {
          const [attr, key] = pair.split(":").map((s) => s.trim());
          if (!attr || !key) return;
          const value = key.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), dict);
          if (typeof value === "string") el.setAttribute(attr, value);
        });
    });

    // page <title>
    const titleKeys = document.documentElement.getAttribute("data-title-key");
    const t = document.querySelector("[data-title-meta]");
    if (titleKeys && t) {
      const v = titleKeys.split(".").reduce((acc, k) => (acc == null ? undefined : acc[k]), dict);
      if (typeof v === "string") {
        const tmpl = dict.titleTemplate || "%title%";
        document.title = tmpl.replace("%title%", v);
      }
    }

    // year stamp — always replace; don't gate on a phantom span
    const foot = document.querySelector("[data-i18n='footer.copy']");
    if (foot && dict.footer && dict.footer.copy) {
      foot.innerHTML = dict.footer.copy.replace("%year%", String(new Date().getFullYear()));
    }
  }

  // ---------- language switcher ----------
  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    const target = btn.getAttribute("data-lang-switch");
    btn.textContent = I18N[target]?.nav?.langToggle || target.toUpperCase();
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        localStorage.setItem("lang", target);
      } catch (_) {}
      // translate URL path: <base>/en/<file> <-> <base>/es/<file> (preserves any base path)
      const path = window.location.pathname;
      const m = path.match(/\/(en|es)(\/[^/]*)?$/);
      let next;
      if (m) {
        next = path.replace(/\/(en|es)(\/[^/]*)?$/, `/${target}/${m[2] ? m[2].slice(1) : ""}`);
      } else {
        const file = path.substring(path.lastIndexOf("/") + 1) || "index.html";
        next = `../${target}/${file}`;
      }
      window.location.href = next || "/";
    });
  });

  // ---------- deck (subpage only) ----------
  const DECK = [
    {
      img: "cmp_hardware.png",
      cat: "hardware",
      name: { en: "Hardware", es: "Hardware" },
      tag: "tagComponent",
      desc: {
        en: "Power supply. Damaged by direct hits.",
        es: "Fuente de alimentación. Dañada por golpes directos.",
      },
    },
    {
      img: "cmp_dataset.png",
      cat: "dataset",
      name: { en: "Dataset", es: "Dataset" },
      tag: "tagComponent",
      desc: {
        en: "Training data. Salvage to restore health.",
        es: "Datos de entrenamiento. Recuperá salud con un salvataje.",
      },
    },
    {
      img: "cmp_neural_net.png",
      cat: "neural",
      name: { en: "Neural Net", es: "Red Neuronal" },
      tag: "tagComponent",
      desc: {
        en: "Reasoning core. Highest throughput.",
        es: "Núcleo de razonamiento. Máximo rendimiento.",
      },
    },
    {
      img: "cmp_algorithm.png",
      cat: "algorithm",
      name: { en: "Algorithm", es: "Algoritmo" },
      tag: "tagComponent",
      desc: {
        en: "Reasoning layer. Lock the slot.",
        es: "Capa de razonamiento. Bloquea el slot.",
      },
    },
    {
      img: "cmp_quantum_core.png",
      cat: "quantum",
      name: { en: "Quantum Core", es: "Quantum Core" },
      tag: "tagWildcard",
      desc: {
        en: "Counts as any missing component.",
        es: "Vale como cualquier componente faltante.",
      },
    },
    {
      img: "thr_hardware.png",
      cat: "threat",
      name: { en: "DDoS Flood", es: "Inundación DDoS" },
      tag: "tagThreat",
      desc: {
        en: "Strips 1 HP from a Hardware slot.",
        es: "Quita 1 HP a un slot de Hardware.",
      },
    },
    {
      img: "thr_dataset.png",
      cat: "threat",
      name: { en: "Corrupt Weights", es: "Pesos corruptos" },
      tag: "tagThreat",
      desc: {
        en: "Locks a Dataset slot for 1 turn.",
        es: "Bloquea un slot de Dataset por 1 turno.",
      },
    },
    {
      img: "thr_neural_net.png",
      cat: "threat",
      name: { en: "Backprop Crash", es: "Caída de backprop" },
      tag: "tagThreat",
      desc: {
        en: "Disables a Neural Net until repaired.",
        es: "Desactiva la Red Neuronal hasta repararla.",
      },
    },
    {
      img: "def_hardware.png",
      cat: "defense",
      name: { en: "Firewall", es: "Firewall" },
      tag: "tagDefense",
      desc: {
        en: "Blocks the next Hardware hit.",
        es: "Bloquea el próximo golpe a Hardware.",
      },
    },
    {
      img: "def_dataset.png",
      cat: "defense",
      name: { en: "Checksum", es: "Checksum" },
      tag: "tagDefense",
      desc: {
        en: "Restores 1 HP to a Dataset slot.",
        es: "Restaura 1 HP en un slot de Dataset.",
      },
    },
    {
      img: "def_neural_net.png",
      cat: "defense",
      name: { en: "Grad Norm", es: "Grad Norm" },
      tag: "tagDefense",
      desc: {
        en: "Stabilizes Neural Net health.",
        es: "Estabiliza la salud de la Red Neuronal.",
      },
    },
    {
      img: "def_quantum.png",
      cat: "defense",
      name: { en: "Decoherence Shield", es: "Escudo de decoherencia" },
      tag: "tagDefense",
      desc: {
        en: "Protects the Quantum Core wildcard.",
        es: "Protege al comodín Quantum Core.",
      },
    },
  ];

  const grid = document.getElementById("deck-grid");
  if (grid) {
    grid.innerHTML = DECK.map((c) => {
      const tagValue = (dict.cardsPage && dict.cardsPage[c.tag]) || "";
      return `
      <article class="deck-card" data-cat="${c.cat}">
        <span class="deck-card-tag">${tagValue}</span>
        <img class="deck-card-img" src="../assets/img/${c.img}" alt="${c.name[lang]}" loading="lazy" />
        <h3 class="deck-card-name">${c.name[lang]}</h3>
        <p class="deck-card-desc">${c.desc[lang]}</p>
      </article>`;
    }).join("");
  }

  // ---------- in-page anchors (with offset for sticky nav) ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // ---------- Intersection reveal ----------
  const revealSel =
    ".section, .hero-actions, .hero-art, .deck-card, .protocol, .ranking li, .meta-grid > div, .extra-card, .step, .tier, .combo";
  document.querySelectorAll(revealSel).forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";
    el.style.transition = "opacity 600ms, transform 600ms";
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        io.unobserve(el);
      });
    },
    { threshold: 0.12 },
  );
  document.querySelectorAll(revealSel).forEach((el) => io.observe(el));

  // ---------- store modal ----------
  const modal = document.getElementById("store-modal");
  const modalTitle = document.getElementById("store-title");
  const modalText = document.getElementById("store-text");

  function isRealUrl(u) {
    return u && !u.endsWith("#") && !/id000000000$/.test(u) && !/example/i.test(u);
  }

  function openModal(store) {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
    const url = store === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    const label =
      store === "ios" ? dict.play?.ios || "App Store" : dict.play?.android || "Google Play";
    if (isRealUrl(url)) {
      const tmpl = dict.hero.modalTitleRedirect || "Redirecting";
      modalTitle.textContent = `${tmpl} — ${label}`;
      modalText.innerHTML = (dict.hero.modalTextRedirect || "Opening %url%").replace("%url%", url);
      window.setTimeout(() => window.open(url, "_blank", "noopener"), 600);
    } else {
      modalTitle.textContent = dict.hero.modalTitlePending || "Pending";
      modalText.innerHTML = dict.hero.modalTextPending || "—";
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll("[data-store]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(btn.getAttribute("data-store"));
    });
  });

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    modal.querySelectorAll("[data-close]").forEach((c) => c.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") closeModal();
    });
  }

  // ---------- first render ----------
  render();

  // expose for tests
  window.__SITE_LANG__ = lang;
})();
