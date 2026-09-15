import { test, expect } from "@playwright/test";

const LANGS = ["en", "es"];
const SLUGS = ["index", "rig", "cards", "protocols", "ranking", "play"];

test.describe("AI Sabotage marketing site", () => {
  for (const lang of LANGS) {
    for (const slug of SLUGS) {
      test(`every page loads directly (${lang}/${slug})`, async ({ page }) => {
        const path = slug === "index" ? `/${lang}/` : `/${lang}/${slug}.html`;
        const res = await page.goto(path);
        expect(res?.status(), path).toBeLessThan(400);
      });
    }
  }

  test("root redirects to /en/", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBeLessThan(400);
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test("hero copy is in the chosen language", async ({ page }) => {
    await page.goto("/es/");
    const lede = (await page.locator(".lede").innerText()).toLowerCase();
    expect(lede).toContain("duelo");
    const eyebrow = await page.locator(".eyebrow").innerText();
    expect(eyebrow.toLowerCase()).toContain("cyberpunk");
  });

  test("English hero uses ASO terms and AGI branding", async ({ page }) => {
    await page.goto("/en/");
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).toContain("sabotage");
    expect(text).toContain("agi");
    expect(text).toContain("ranking");
    expect(text).toContain("cyberpunk");
  });

  test("language switcher goes en -> es preserving slug", async ({ page }) => {
    await page.goto("/en/rig.html");
    await page.locator("[data-lang-switch='es']").click();
    await expect(page).toHaveURL(/\/es\/(\/)?rig(\.html)?$/);
    const heading = await page.locator("h1.section-title").innerText();
    expect(heading.length).toBeGreaterThan(0);
  });

  test("i18n swaps every label on subpage", async ({ page }) => {
    await page.goto("/en/cards.html");
    const enDeckCount = await page.locator("#deck-grid .deck-card").count();
    expect(enDeckCount).toBe(12);

    await page.goto("/es/cards.html");
    const esDeckCount = await page.locator("#deck-grid .deck-card").count();
    expect(esDeckCount).toBe(12);

    const firstEsCard = await page.locator("#deck-grid .deck-card").first().innerText();
    // use word boundary so "componente" doesn't false-positive
    expect(/\bcomponent\b/i.test(firstEsCard), firstEsCard).toBe(false);
  });

  test("nav links go to real subpages, no 404s", async ({ page }) => {
    await page.goto("/en/");
    for (const href of await page
      .locator(".nav-links a, .brand")
      .evaluateAll((els) => els.map((a) => a.getAttribute("href") || ""))) {
      if (!href) continue;
      const resp = await page.request.get(href);
      expect(resp.status(), `link ${href}`).toBeLessThan(400);
    }
  });

  test("subpage nav link is marked active", async ({ page }) => {
    await page.goto("/en/protocols.html");
    const active = page.locator(".nav-links a.is-active");
    await expect(active).toHaveCount(1);
    expect(await active.getAttribute("href")).toMatch(/protocols\.html$/);
  });

  test("ghost button keeps all four corners visible", async ({ page }) => {
    await page.goto("/en/");
    const ghost = page.locator(".btn.btn-ghost").first();
    await ghost.scrollIntoViewIfNeeded();
    const box = await ghost.boundingBox();
    expect(box).not.toBeNull();
    // The ::before pseudo-element with the corner accent must exist and be inside the layout box.
    const before = await ghost.evaluate((el) => {
      const cs = getComputedStyle(el, "::before");
      const w = parseFloat(cs.width);
      const h = parseFloat(cs.height);
      return { w, h, position: cs.position };
    });
    expect(before.position).toBe("absolute");
    expect(before.w).toBeGreaterThan(0);
    expect(before.h).toBeGreaterThan(0);
  });

  test("--text-dim is brighter than dark on dark", async ({ page }) => {
    await page.goto("/en/");
    const rgb = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.textContent = "x";
      probe.style.color = "var(--text-dim)";
      document.body.appendChild(probe);
      const c = getComputedStyle(probe).color;
      probe.remove();
      return c;
    });
    // rgb() like "rgb(216, 225, 238)" — luminance must be high.
    const m = rgb.match(/\d+/g)?.map(Number) ?? [];
    expect(m.length).toBe(3);
    const [r, g, b] = m;
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    expect(lum, `text-dim should be much brighter than black; got ${rgb}`).toBeGreaterThan(0.7);
  });

  test("play page no longer mentions version, size or age", async ({ page }) => {
    await page.goto("/en/play.html");
    const text = (await page.locator("main").innerText()).toLowerCase();
    expect(text).not.toContain("v1.0.0");
    expect(text).not.toContain("60 mb");
    expect(text).not.toContain("12+");
  });

  test("store button opens the modal and Esc closes it", async ({ page }) => {
    await page.goto("/en/play.html");
    await page.locator('.btn[data-store="ios"]').first().click();
    const modal = page.locator("#store-modal");
    await expect(modal).toHaveAttribute("aria-hidden", "false");
    await page.keyboard.press("Escape");
    await expect(modal).toHaveAttribute("aria-hidden", "true");
  });

  test("no biology terms in either locale", async ({ page }) => {
    for (const lang of LANGS) {
      await page.goto(`/${lang}/`);
      const text = (await page.locator("body").innerText()).toLowerCase();
      for (const bad of ["biology", "gene", "dna", "protein"]) {
        expect(text, `lang=${lang} word=${bad}`).not.toContain(bad);
      }
    }
  });

  test("all card images on every page return 200", async ({ page }) => {
    for (const lang of LANGS) {
      for (const slug of ["index", "rig", "cards", "protocols", "ranking", "play"]) {
        await page.goto(slug === "index" ? `/${lang}/` : `/${lang}/${slug}.html`);
        const sources = await page
          .locator("img")
          .evaluateAll((imgs) => Array.from(new Set(imgs.map((i) => (i as HTMLImageElement).src))));
        for (const src of sources) {
          const r = await page.request.get(src);
          expect(r.status(), `${src} on ${lang}/${slug}`).toBeLessThan(400);
        }
      }
    }
  });

  test("meta description + keywords are ASO-rich", async ({ page }) => {
    await page.goto("/en/");
    const desc = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
    const keywords = (await page.locator('meta[name="keywords"]').getAttribute("content")) ?? "";
    const blob = (desc + " " + keywords).toLowerCase();
    for (const term of [
      "ai card game",
      "cyberpunk",
      "ranking",
      "two player",
      "offline",
      "set collection",
    ]) {
      expect(blob).toContain(term);
    }
  });

  test("fonts load (orbitron + jetbrains mono)", async ({ page }) => {
    await page.goto("/en/");
    const loaded = await page.evaluate(async () => {
      await (document as Document).fonts.ready;
      const families = new Set<string>();
      (document as Document).fonts.forEach((f) => families.add(f.family));
      return Array.from(families);
    });
    expect(loaded.join(" ").toLowerCase()).toContain("orbitron");
    expect(loaded.join(" ").toLowerCase()).toContain("jetbrains");
  });

  test("title is templated with the i18n site name", async ({ page }) => {
    await page.goto("/en/");
    await expect(page).toHaveTitle(/AI Sabotage/i);
    await page.goto("/es/rig.html");
    // Spanish rig.heading = "Cuatro slots. Una AGI." template: "%title% · AI Sabotage"
    await expect(page).toHaveTitle(/·\s*AI Sabotage/i);
  });
});
