import { test, expect } from "@playwright/test";

const LANGS = ["en", "es"];
const SLUGS = ["index", "rig", "cards", "friends", "ranking", "play"];

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
    const enDeckCount = await page.locator(".deck-card").count();
    expect(enDeckCount).toBe(20);

    await page.goto("/es/cards.html");
    const esDeckCount = await page.locator(".deck-card").count();
    expect(esDeckCount).toBe(20);

    const firstEsCard = await page
      .locator('[data-deck="components"] .deck-card')
      .first()
      .innerText();
    // use word boundary so "componente" doesn't false-positive
    expect(/\bcomponent\b/i.test(firstEsCard), firstEsCard).toBe(false);
  });

  test("cards page is split into 4 blocks with all 20 cards", async ({ page }) => {
    const groups = ["components", "threats", "defenses", "protocols"];
    for (const lang of LANGS) {
      await page.goto(`/${lang}/cards.html`);
      for (const group of groups) {
        const section = page.locator(`.deck-group[data-group="${group}"]`);
        await expect(section).toHaveCount(1);
        await expect(section.locator(".section-title")).not.toHaveText("");
        await expect(section.locator(`[data-deck="${group}"] .deck-card`)).toHaveCount(5);
      }
      await expect(page.locator(".deck-card")).toHaveCount(20);
      // no stale .png card art left over
      const srcs = await page
        .locator(".deck-card-img")
        .evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).getAttribute("src") || ""));
      expect(srcs.every((s) => s.endsWith(".png"))).toBe(true);
    }
  });

  test("nav links go to real subpages, no 404s", async ({ page }) => {
    await page.goto("/en/");
    for (const href of await page
      .locator(".nav-links a, .brand")
      .evaluateAll((els) => els.map((a) => a.getAttribute("href") || ""))) {
      if (!href) continue;
      // resolve relative hrefs against the current document, not the baseURL
      const abs = new URL(href, page.url()).href;
      const resp = await page.request.get(abs);
      expect(resp.status(), `link ${abs}`).toBeLessThan(400);
    }
  });

  test("header has no app download button", async ({ page }) => {
    for (const lang of LANGS) {
      await page.goto(`/${lang}/`);
      await expect(page.locator("header.nav [data-store]")).toHaveCount(0);
      await expect(page.locator("header.nav .btn.btn-primary")).toHaveCount(0);
    }
  });

  test("brand reads [ AI SABOTAGE ]", async ({ page }) => {
    await page.goto("/en/");
    const brand = (await page.locator(".brand").innerText()).replace(/\s+/g, " ").trim();
    expect(brand).toBe("[ AI SABOTAGE ]");
  });

  test("no paywall / no ads / no leaderboard copy anywhere", async ({ page }) => {
    const banned = ["paywall", "no ads", "leaderboard", "sin anuncios"];
    for (const lang of LANGS) {
      for (const slug of SLUGS) {
        const path = slug === "index" ? `/${lang}/` : `/${lang}/${slug}.html`;
        await page.goto(path);
        const text = (await page.locator("body").innerText()).toLowerCase();
        for (const term of banned) {
          expect(text, `${term} found on ${path}`).not.toContain(term);
        }
      }
    }
  });

  test("subpage nav link is marked active", async ({ page }) => {
    await page.goto("/en/friends.html");
    const active = page.locator(".nav-links a.is-active");
    await expect(active).toHaveCount(1);
    expect(await active.getAttribute("href")).toMatch(/friends\.html$/);
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

  test("no biology terms in either locale", async ({ page }) => {
    for (const lang of LANGS) {
      await page.goto(`/${lang}/`);
      const text = (await page.locator("body").innerText()).toLowerCase();
      for (const bad of ["biology", "gene", "dna", "protein"]) {
        expect(text, `lang=${lang} word=${bad}`).not.toContain(bad);
      }
    }
  });

  test("Spanish copy is Castilian (no Argentine voseo)", async ({ page }) => {
    await page.goto("/es/");
    const text = await page.locator("body").innerText();
    // Voseo markers (impersonal -á/-é/-í, present -ás/-és/-ís). Common words also caught:
    const voseoWords = [
      "elegí",
      "elegís",
      "jugá",
      "armá",
      "decime",
      "tenés",
      "sabés",
      "querés",
      "podés",
      "ganás",
      "saboteá",
      "guardá",
      "robá",
      "forzás",
      "intercambiá",
      "leé",
      "subí",
      "quedáte",
      "acumulá",
      "empezás",
      "diseñá",
      "parchá",
      "usá",
      "gastá",
      "declarás",
    ];
    const lower = text.toLowerCase();
    for (const w of voseoWords) {
      expect(lower, `ES text should not contain voseo word "${w}"`).not.toContain(w);
    }
  });

  test("single DOWNLOAD button opens the right store per platform", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __opened: string | null }).__opened = null;
      window.open = ((url?: string | URL) => {
        (window as unknown as { __opened: string | null }).__opened = String(url ?? "");
        return null;
      }) as typeof window.open;
    });
    for (const lang of LANGS) {
      await page.goto(`/${lang}/`);
      const btn = page.locator(".hero-actions [data-store]");
      await expect(btn).toHaveCount(1);
      await expect(btn).toHaveClass(/btn-primary/);
      await btn.click();
      const opened = await page.evaluate(
        () => (window as unknown as { __opened: string | null }).__opened,
      );
      expect(String(opened)).toContain("play.google.com");
    }
  });

  test("iOS user agent gets the App Store link", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({
      baseURL,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      (window as unknown as { __opened: string | null }).__opened = null;
      window.open = ((url?: string | URL) => {
        (window as unknown as { __opened: string | null }).__opened = String(url ?? "");
        return null;
      }) as typeof window.open;
    });
    await page.goto("/en/");
    await page.locator(".hero-actions [data-store]").click();
    const opened = await page.evaluate(
      () => (window as unknown as { __opened: string | null }).__opened,
    );
    expect(String(opened)).toContain("apps.apple.com");
    await ctx.close();
  });

  test("friends page covers private matches with the right keywords", async ({ page }) => {
    await page.goto("/en/friends.html");
    const en = (await page.locator("body").innerText()).toLowerCase();
    for (const term of ["play with friends", "private match", "invite", "multiplayer card game"]) {
      expect(en, `EN friends page should mention "${term}"`).toContain(term);
    }

    await page.goto("/es/friends.html");
    const es = (await page.locator("body").innerText()).toLowerCase();
    for (const term of ["partida privada", "jugar con amigos", "multiplayer card game"]) {
      expect(es, `ES friends page should mention "${term}"`).toContain(term);
    }
  });

  test("protocols page is gone and no link points to it", async ({ page }) => {
    for (const lang of LANGS) {
      const res = await page.request.get(`/${lang}/protocols.html`);
      expect(res.status(), `${lang}/protocols.html should not exist`).toBeGreaterThanOrEqual(400);

      await page.goto(`/${lang}/`);
      const hrefs = await page
        .locator("a")
        .evaluateAll((els) => els.map((a) => a.getAttribute("href") || ""));
      expect(hrefs.filter((h) => h.includes("protocols")).length).toBe(0);
    }
  });

  test("footer year is rendered (no literal %year%)", async ({ page }) => {
    await page.goto("/en/");
    const footer = await page.locator(".footer").first().innerText();
    expect(footer).not.toContain("%year%");
    expect(footer).toMatch(/\d{4}/);
  });

  test("all card images on every page return 200", async ({ page }) => {
    for (const lang of LANGS) {
      for (const slug of ["index", "rig", "cards", "friends", "ranking", "play"]) {
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
