import { test, expect } from "@playwright/test";

test.describe("AI Sabotage marketing site", () => {
  test("loads the hero with ASO keywords and CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/AI Sabotage/i);
    await expect(page.locator("h1")).toContainText(/BUILD/i);
    await expect(page.locator("h1")).toContainText(/AGI/i);

    // Brand mark + lede copy must be visible
    await expect(page.locator(".brand")).toBeVisible();
    await expect(page.locator(".lede")).toBeVisible();
  });

  test("navigation links scroll to all 5 sections", async ({ page }) => {
    await page.goto("/");
    const sections = ["#rig", "#cards", "#protocols", "#ranking", "#play"];
    for (const id of sections) {
      const link = page.locator(`.nav-links a[href="${id}"]`);
      await expect(link).toBeVisible();
    }
  });

  test("deck grid renders all 12 cards", async ({ page }) => {
    await page.goto("/");
    await page.locator("#deck-grid").scrollIntoViewIfNeeded();
    const cards = page.locator("#deck-grid .deck-card");
    await expect(cards).toHaveCount(12);
  });

  test("all card images return 200", async ({ page }) => {
    await page.goto("/");
    const images = await page
      .locator("img")
      .evaluateAll((imgs) => Array.from(imgs).map((i) => (i as HTMLImageElement).src));
    expect(images.length).toBeGreaterThan(0);
    const unique = [...new Set(images)];
    for (const src of unique) {
      const resp = await page.request.get(src);
      expect(resp.status(), `image ${src} should load`).toBeLessThan(400);
    }
  });

  test("fonts load (orbitron + jetbrains mono)", async ({ page }) => {
    await page.goto("/");
    const loaded = await page.evaluate(async () => {
      await (document as Document).fonts.ready;
      const families = new Set<string>();
      (document as Document).fonts.forEach((f) => families.add(f.family));
      return Array.from(families);
    });
    expect(loaded.join(" ").toLowerCase()).toContain("orbitron");
    expect(loaded.join(" ").toLowerCase()).toContain("jetbrains");
  });

  test("store button opens the modal and Esc closes it", async ({ page }) => {
    await page.goto("/");

    // Click the iOS download CTA in the play section
    await page.locator('#play [data-store="ios"]').first().click();
    const modal = page.locator("#store-modal");
    await expect(modal).toHaveAttribute("aria-hidden", "false");

    await page.keyboard.press("Escape");
    await expect(modal).toHaveAttribute("aria-hidden", "true");
  });

  test("hero uses ASO terms (sabotage, agi, ranking, cyberpunk)", async ({ page }) => {
    await page.goto("/");
    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).toContain("sabotage");
    expect(text).toContain("agi");
    expect(text).toContain("ranking");
    expect(text).toContain("cyberpunk");
  });

  test("meta description + keywords are ASO-rich", async ({ page }) => {
    await page.goto("/");
    const desc = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
    const keywords = (await page.locator('meta[name="keywords"]').getAttribute("content")) ?? "";

    const blob = (desc + " " + keywords).toLowerCase();
    for (const term of [
      "ai card game",
      "cyberpunk",
      "hacking game",
      "robot",
      "ranking",
      "two player",
      "offline",
      "set collection",
    ]) {
      expect(blob).toContain(term);
    }
  });

  test("no biology terms (universal copy rule)", async ({ page }) => {
    await page.goto("/");
    const text = (await page.locator("body").innerText()).toLowerCase();
    for (const bad of ["biology", "cell", "gene", "dna", "neuron", "organ", "protein", "species"]) {
      expect(text, `forbidden word: ${bad}`).not.toContain(bad);
    }
  });

  test("no broken in-page anchors", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page
      .locator('a[href^="#"]')
      .evaluateAll((els) => els.map((a) => a.getAttribute("href") || ""));
    for (const h of hrefs) {
      if (!h || h === "#") continue;
      const id = h.slice(1);
      const target = page.locator(`#${id}`);
      await expect(target, `anchor target #${id} missing`).toHaveCount(1);
    }
  });
});
