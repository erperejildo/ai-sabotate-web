(function () {
  "use strict";

  const cfg = window.AI_SABOTAGE_CONFIG || {};
  const APP_STORE_URL = cfg.APP_STORE_URL || "#";
  const PLAY_STORE_URL = cfg.PLAY_STORE_URL || "#";

  // --- Dynamic deck grid (avoids hand-writing 12 cards in HTML) ---
  const DECK = [
    {
      img: "cmp_hardware.png",
      cat: "hardware",
      name: "Hardware",
      tag: "COMPONENT",
      desc: "Power supply. Damaged by direct hits.",
    },
    {
      img: "cmp_dataset.png",
      cat: "dataset",
      name: "Dataset",
      tag: "COMPONENT",
      desc: "Training data. Salvage to restore health.",
    },
    {
      img: "cmp_neural_net.png",
      cat: "neural",
      name: "Neural Net",
      tag: "COMPONENT",
      desc: "Reasoning core. Highest throughput.",
    },
    {
      img: "cmp_algorithm.png",
      cat: "algorithm",
      name: "Algorithm",
      tag: "COMPONENT",
      desc: "Reasoning layer. Lock the slot.",
    },
    {
      img: "cmp_quantum_core.png",
      cat: "quantum",
      name: "Quantum Core",
      tag: "WILDCARD",
      desc: "Counts as any missing component.",
    },
    {
      img: "thr_hardware.png",
      cat: "threat",
      name: "DDoS Flood",
      tag: "THREAT",
      desc: "Strips 1 HP from a Hardware slot.",
    },
    {
      img: "thr_dataset.png",
      cat: "threat",
      name: "Corrupt Weights",
      tag: "THREAT",
      desc: "Locks a Dataset slot for 1 turn.",
    },
    {
      img: "thr_neural_net.png",
      cat: "threat",
      name: "Backprop Crash",
      tag: "THREAT",
      desc: "Disables a Neural Net until repaired.",
    },
    {
      img: "def_hardware.png",
      cat: "defense",
      name: "Firewall",
      tag: "DEFENSE",
      desc: "Blocks the next Hardware hit.",
    },
    {
      img: "def_dataset.png",
      cat: "defense",
      name: "Checksum",
      tag: "DEFENSE",
      desc: "Restores 1 HP to a Dataset slot.",
    },
    {
      img: "def_neural_net.png",
      cat: "defense",
      name: "Grad Norm",
      tag: "DEFENSE",
      desc: "Stabilizes Neural Net health.",
    },
    {
      img: "def_quantum.png",
      cat: "defense",
      name: "Decoherence Shield",
      tag: "DEFENSE",
      desc: "Protects the Quantum Core wildcard.",
    },
  ];

  const grid = document.getElementById("deck-grid");
  if (grid) {
    grid.innerHTML = DECK.map(
      (c) => `
      <article class="deck-card" data-cat="${c.cat}" data-name="${c.name}">
        <span class="deck-card-tag">${c.tag}</span>
        <img class="deck-card-img" src="assets/img/${c.img}" alt="${c.name}" loading="lazy" />
        <h3 class="deck-card-name">${c.name}</h3>
        <p class="deck-card-desc">${c.desc}</p>
      </article>`,
    ).join("");
  }

  // --- Smooth-scroll for in-page anchors w/ offset for sticky nav ---
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

  // --- Year stamp ---
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  // --- Intersection-based reveal ---
  const revealSel =
    ".section, .hero-actions, .hero-art, .deck-card, .protocol, .ranking li, .meta-grid > div";
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

  // --- Store buttons: real URL if configured, modal fallback otherwise ---
  const modal = document.getElementById("store-modal");
  const modalTitle = document.getElementById("store-title");
  const modalText = document.getElementById("store-text");

  function openModal(store) {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "false");
    const url = store === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    const label = store === "ios" ? "App Store" : "Google Play";
    if (url && !url.endsWith("#") && !/id000000000$/.test(url) && !/example/i.test(url)) {
      modalTitle.textContent = `Redirecting to ${label}`;
      modalText.innerHTML = `Opening <code>${url}</code>`;
      window.setTimeout(() => window.open(url, "_blank", "noopener"), 600);
    } else {
      modalTitle.textContent = `${label} link pending`;
      modalText.innerHTML =
        "Store URLs aren't wired up yet. Replace <code>APP_STORE_URL</code> / <code>PLAY_STORE_URL</code> in <code>assets/js/config.js</code>.";
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
      if (e.key === "Escape" && modal.getAttribute("aria-hidden") === "false") {
        closeModal();
      }
    });
  }
})();
