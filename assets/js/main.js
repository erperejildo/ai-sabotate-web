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
    // ---------- components ----------
    {
      group: "components",
      img: "cmp_hardware.jpeg",
      cat: "hardware",
      name: { en: "Hardware Component", es: "Componente de Hardware" },
      tag: "tagComponent",
      desc: {
        en: "Power supply of the rig. If it goes down, everything it feeds goes dark.",
        es: "Fuente de energía del rig. Si cae, todo lo que alimenta se apaga.",
      },
    },
    {
      group: "components",
      img: "cmp_dataset.jpeg",
      cat: "dataset",
      name: { en: "Dataset Component", es: "Componente de Dataset" },
      tag: "tagComponent",
      desc: {
        en: "Training data. Feed the AGI, or salvage it to restore health.",
        es: "Datos de entrenamiento. Alimenta a la AGI o recíclalos para restaurar salud.",
      },
    },
    {
      group: "components",
      img: "cmp_neural_net.jpeg",
      cat: "neural",
      name: { en: "Neural Net Component", es: "Componente de Red Neuronal" },
      tag: "tagComponent",
      desc: {
        en: "Reasoning core. Highest throughput in the rig.",
        es: "Núcleo de razonamiento. El mayor rendimiento del rig.",
      },
    },
    {
      group: "components",
      img: "cmp_algorithm.jpeg",
      cat: "algorithm",
      name: { en: "Algorithm Component", es: "Componente de Algoritmo" },
      tag: "tagComponent",
      desc: {
        en: "Reasoning layer. Lock the slot to keep it out of reach.",
        es: "Capa de razonamiento. Bloquea el slot para dejarlo fuera de alcance.",
      },
    },
    {
      group: "components",
      img: "cmp_quantum_core.jpeg",
      cat: "quantum",
      name: { en: "Quantum Core (Wildcard)", es: "Quantum Core (comodín)" },
      tag: "tagWildcard",
      desc: {
        en: "Counts as any missing component. The most-sabotaged card in the deck.",
        es: "Vale como cualquier componente faltante. La carta más saboteada del mazo.",
      },
    },
    // ---------- threats ----------
    {
      group: "threats",
      img: "thr_hardware.jpeg",
      cat: "threat",
      name: { en: "Hardware Threat", es: "Amenaza de Hardware" },
      tag: "tagThreat",
      desc: {
        en: "Parasitic worm that strips HP from a Hardware slot.",
        es: "Gusano parásito que quita HP a un slot de Hardware.",
      },
    },
    {
      group: "threats",
      img: "thr_dataset.jpeg",
      cat: "threat",
      name: { en: "Dataset Threat", es: "Amenaza de Dataset" },
      tag: "tagThreat",
      desc: {
        en: "Data leech that locks a Dataset slot for 1 turn.",
        es: "Sanguijuela de datos que bloquea un slot de Dataset por 1 turno.",
      },
    },
    {
      group: "threats",
      img: "thr_neural_net.jpeg",
      cat: "threat",
      name: { en: "Neural Net Threat", es: "Amenaza de Red Neuronal" },
      tag: "tagThreat",
      desc: {
        en: "Spiked drone that disables a Neural Net until repaired.",
        es: "Dron con púas que desactiva la Red Neuronal hasta repararla.",
      },
    },
    {
      group: "threats",
      img: "thr_algorithm.jpeg",
      cat: "threat",
      name: { en: "Algorithm Threat", es: "Amenaza de Algoritmo" },
      tag: "tagThreat",
      desc: {
        en: "Clockwork spider that injects a logic bomb into an Algorithm.",
        es: "Araña mecánica que inyecta una bomba lógica en un Algoritmo.",
      },
    },
    {
      group: "threats",
      img: "thr_quantum.jpeg",
      cat: "threat",
      name: { en: "Quantum Threat (Wildcard)", es: "Amenaza Quantum (comodín)" },
      tag: "tagThreat",
      desc: {
        en: "Void serpent that hits the wildcard slot itself.",
        es: "Serpiente del vacío que golpea al propio slot comodín.",
      },
    },
    // ---------- defenses ----------
    {
      group: "defenses",
      img: "def_hardware.jpeg",
      cat: "defense",
      name: { en: "Hardware Defense", es: "Defensa de Hardware" },
      tag: "tagDefense",
      desc: {
        en: "Armored blast-shield that blocks the next Hardware hit.",
        es: "Escudo blindado que bloquea el próximo golpe a Hardware.",
      },
    },
    {
      group: "defenses",
      img: "def_dataset.jpeg",
      cat: "defense",
      name: { en: "Dataset Defense", es: "Defensa de Dataset" },
      tag: "tagDefense",
      desc: {
        en: "Firewall lattice and checksum seals. Restores 1 HP to a Dataset slot.",
        es: "Malla de firewall y sellos de checksum. Restaura 1 HP en un slot de Dataset.",
      },
    },
    {
      group: "defenses",
      img: "def_neural_net.jpeg",
      cat: "defense",
      name: { en: "Neural Net Defense", es: "Defensa de Red Neuronal" },
      tag: "tagDefense",
      desc: {
        en: "Force-dome drones that stabilize Neural Net health.",
        es: "Drones de cúpula de fuerza que estabilizan la salud de la Red Neuronal.",
      },
    },
    {
      group: "defenses",
      img: "def_algorithm.jpeg",
      cat: "defense",
      name: { en: "Algorithm Defense", es: "Defensa de Algoritmo" },
      tag: "tagDefense",
      desc: {
        en: "Containment sigil that locks down an Algorithm slot.",
        es: "Sigilo de contención que asegura un slot de Algoritmo.",
      },
    },
    {
      group: "defenses",
      img: "def_quantum.jpeg",
      cat: "defense",
      name: { en: "Quantum Defense (Wildcard)", es: "Defensa Quantum (comodín)" },
      tag: "tagDefense",
      desc: {
        en: "Prismatic shield-bubble protecting the Quantum Core.",
        es: "Burbuja de escudo prismática que protege al Quantum Core.",
      },
    },
    // ---------- protocols ----------
    {
      group: "protocols",
      img: "pro_data_heist.jpeg",
      cat: "protocol",
      name: { en: "Data Heist", es: "Robo de datos" },
      tag: "tagProtocol",
      desc: {
        en: "Steal any non-locked component from a rival's rig.",
        es: "Roba cualquier componente sin bloquear del rig rival.",
      },
    },
    {
      group: "protocols",
      img: "pro_protocol_swap.jpeg",
      cat: "protocol",
      name: { en: "Protocol Swap", es: "Intercambio de protocolo" },
      tag: "tagProtocol",
      desc: {
        en: "Exchange one component between any two rigs (non-locked).",
        es: "Intercambia un componente entre dos rigs (sin bloquear).",
      },
    },
    {
      group: "protocols",
      img: "pro_malware_migration.jpeg",
      cat: "protocol",
      name: { en: "Malware Migration", es: "Migración de malware" },
      tag: "tagProtocol",
      desc: {
        en: "Relocate your attached Threats onto rival free components.",
        es: "Reubica tus amenazas adheridas en componentes libres rivales.",
      },
    },
    {
      group: "protocols",
      img: "pro_emp_purge.jpeg",
      cat: "protocol",
      name: { en: "EMP Purge", es: "Purga EMP" },
      tag: "tagProtocol",
      desc: {
        en: "All rivals discard their hands and skip their next draw.",
        es: "Todos los rivales descartan su mano y pierden su próximo robo.",
      },
    },
    {
      group: "protocols",
      img: "pro_system_override.jpeg",
      cat: "protocol",
      name: { en: "System Override", es: "Anulación del sistema" },
      tag: "tagProtocol",
      desc: {
        en: "Swap your entire rig with a rival's rig, locked components included.",
        es: "Intercambia tu rig completo con el de un rival, incluidos los bloqueados.",
      },
    },
  ];

  const grids = document.querySelectorAll("[data-deck]");
  if (grids.length) {
    const cardsPage = dict.cardsPage || {};

    grids.forEach((grid) => {
      const group = grid.getAttribute("data-deck");
      grid.innerHTML = DECK.filter((c) => c.group === group)
        .map((c) => {
          const tagValue = cardsPage[c.tag] || "";
          return `
      <article class="deck-card" data-cat="${c.cat}">
        <span class="deck-card-tag">${tagValue}</span>
        <img class="deck-card-img" src="../assets/img/${c.img}" alt="${c.name[lang]}" loading="lazy" />
        <h3 class="deck-card-name">${c.name[lang]}</h3>
        <p class="deck-card-desc">${c.desc[lang]}</p>
      </article>`;
        })
        .join("");
    });
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
