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
      img: "cmp_hardware.png",
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
      img: "cmp_dataset.png",
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
      img: "cmp_neural_net.png",
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
      img: "cmp_algorithm.png",
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
      img: "cmp_quantum_core.png",
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
      img: "thr_hardware.png",
      cat: "threat",
      name: { en: "Hardware Threat", es: "Amenaza de Hardware" },
      tag: "tagThreat",
      desc: {
        en: "Parasitic worm that infects a Hardware component; a second threat destroys it.",
        es: "Gusano parásito que infecta un componente de Hardware; una segunda amenaza lo destruye.",
      },
    },
    {
      group: "threats",
      img: "thr_dataset.png",
      cat: "threat",
      name: { en: "Dataset Threat", es: "Amenaza de Dataset" },
      tag: "tagThreat",
      desc: {
        en: "Data leech that infects a Dataset component; a second threat destroys it.",
        es: "Sanguijuela de datos que infecta un componente de Dataset; una segunda amenaza lo destruye.",
      },
    },
    {
      group: "threats",
      img: "thr_neural_net.png",
      cat: "threat",
      name: { en: "Neural Net Threat", es: "Amenaza de Red Neuronal" },
      tag: "tagThreat",
      desc: {
        en: "Spiked drone that infects a Neural Net component; a second threat destroys it.",
        es: "Dron con púas que infecta un componente de Red Neuronal; una segunda amenaza lo destruye.",
      },
    },
    {
      group: "threats",
      img: "thr_algorithm.png",
      cat: "threat",
      name: { en: "Algorithm Threat", es: "Amenaza de Algoritmo" },
      tag: "tagThreat",
      desc: {
        en: "Clockwork spider that infects an Algorithm component; a second threat destroys it.",
        es: "Araña mecánica que infecta un componente de Algoritmo; una segunda amenaza lo destruye.",
      },
    },
    {
      group: "threats",
      img: "thr_quantum.png",
      cat: "threat",
      name: { en: "Quantum Threat (Wildcard)", es: "Amenaza Quantum (comodín)" },
      tag: "tagThreat",
      desc: {
        en: "Void serpent that infects any component or the Quantum Core wildcard.",
        es: "Serpiente del vacío que infecta cualquier componente o el comodín Quantum Core.",
      },
    },
    // ---------- defenses ----------
    {
      group: "defenses",
      img: "def_hardware.png",
      cat: "defense",
      name: { en: "Hardware Defense", es: "Defensa de Hardware" },
      tag: "tagDefense",
      desc: {
        en: "Armored blast-shield that protects a Hardware component, or locks it if doubled.",
        es: "Escudo blindado que protege un componente de Hardware, o lo bloquea si se duplica.",
      },
    },
    {
      group: "defenses",
      img: "def_dataset.png",
      cat: "defense",
      name: { en: "Dataset Defense", es: "Defensa de Dataset" },
      tag: "tagDefense",
      desc: {
        en: "Firewall lattice that protects a Dataset component, or locks it if doubled.",
        es: "Malla de firewall que protege un componente de Dataset, o lo bloquea si se duplica.",
      },
    },
    {
      group: "defenses",
      img: "def_neural_net.png",
      cat: "defense",
      name: { en: "Neural Net Defense", es: "Defensa de Red Neuronal" },
      tag: "tagDefense",
      desc: {
        en: "Force-dome drones that protect a Neural Net component, or lock it if doubled.",
        es: "Cúpula de fuerza que protege un componente de Red Neuronal, o lo bloquea si se duplica.",
      },
    },
    {
      group: "defenses",
      img: "def_algorithm.png",
      cat: "defense",
      name: { en: "Algorithm Defense", es: "Defensa de Algoritmo" },
      tag: "tagDefense",
      desc: {
        en: "Containment sigil that protects an Algorithm component, or locks it if doubled.",
        es: "Sigilo de contención que protege un componente de Algoritmo, o lo bloquea si se duplica.",
      },
    },
    {
      group: "defenses",
      img: "def_quantum.png",
      cat: "defense",
      name: { en: "Quantum Defense (Wildcard)", es: "Defensa Quantum (comodín)" },
      tag: "tagDefense",
      desc: {
        en: "Prismatic shield-bubble that protects any component or the Quantum Core wildcard.",
        es: "Burbuja prismática que protege cualquier componente o el comodín Quantum Core.",
      },
    },
    // ---------- protocols ----------
    {
      group: "protocols",
      img: "pro_data_heist.png",
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
      img: "pro_protocol_swap.png",
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
      img: "pro_malware_migration.png",
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
      img: "pro_emp_purge.png",
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
      img: "pro_system_override.png",
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

  // ---------- download button ----------
  function isIOS() {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent || "") ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    );
  }

  document.querySelectorAll("[data-store]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      window.open(isIOS() ? APP_STORE_URL : PLAY_STORE_URL, "_blank", "noopener");
    });
  });

  // ---------- first render ----------
  render();

  // expose for tests
  window.__SITE_LANG__ = lang;
})();
