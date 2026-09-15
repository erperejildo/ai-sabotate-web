# AI Sabotage — Marketing Site

Static marketing site for **AI Sabotage: Cyber Cards** — a cyberpunk
strategy card game. Built with vanilla HTML, CSS and JS for fast
load times and perfect Lighthouse scores.

## Stack

- HTML, CSS, vanilla JS (no framework)
- Prettier for formatting / linting
- Playwright for end-to-end tests
- GitHub Actions for prettier + Playwright gates → deploy to **GitHub Pages**

## Structure

```
.
├── index.html
├── manifest.webmanifest
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   ├── js/config.js            # APP_STORE_URL, PLAY_STORE_URL
│   ├── fonts/Orbitron.ttf
│   ├── fonts/JetBrainsMono.ttf
│   └── img/                    # app icon + card images
├── tests/site.spec.ts          # Playwright tests
├── playwright.config.ts
├── package.json
├── .prettierrc.json
└── .gitlab-ci.yml
```

## Local development

```bash
npm ci
npx playwright install --with-deps chromium
npm run test                # runs http server + Playwright tests
npm run format              # one-shot format
npm run format:check        # CI parity
```

Serve the site manually:

```bash
python3 -m http.server 4173
# open http://127.0.0.1:4173
```

## CI/CD (GitHub Actions → GitHub Pages)

`.github/workflows/deploy.yml` runs on every push to `main` (or manually via
`workflow_dispatch`):

1. `Prettier check` — `npm run format:check`
2. `Run tests` — installs Chromium + `npm test` (Playwright)
3. `Stage static site` — `npm run stage` builds `dist/` (site files + `.nojekyll`)
4. Uploads the Pages artifact and deploys via `actions/deploy-pages`
   (with the same competing-run cancellation + retry logic used by
   `drodriguez-apps.github.io`), then smoke-tests `/`, `/en/`,
   `/es/` and `/en/ranking.html` on the live URL.

**One-time repo setup:** Settings → Pages → Build and deployment →
Source = **GitHub Actions**. If it is left on "Deploy from a branch",
GitHub's built-in `pages-build-deployment` workflow competes with this
one and can publish the raw source instead of the built site.

The site is served from a project subpath
(`https://erperejildo.github.io/ai-sabotate-web/`), so every internal
link is **relative**. `SITE_BASE` in `build-pages.js` drives the
canonical/hreflang/og:url tags — update it there if a custom domain is
added later.

## ASO keywords used on the site

Primary (en-US): **AI card game**, **cyberpunk**, **sabotage**, **AGI**,
**hacking game**, **robot**, **ranking**,
**strategy game**, **card game offline**, **artificial intelligence**,
**two player**, **set collection**, **offline**.

These mirror `keywords.md` of the underlying app.

## Replacing app store links

Edit `assets/js/config.js`:

```js
window.AI_SABOTAGE_CONFIG = {
  APP_STORE_URL: "https://apps.apple.com/app/id<YOUR_ID>",
  PLAY_STORE_URL: "https://play.google.com/store/apps/details?id=<PKG>",
};
```

Site visitors on iOS/Android devices are then auto-redirected; everyone
else sees a modal that explains the link is pending.
