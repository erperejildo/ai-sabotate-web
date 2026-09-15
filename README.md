# AI Sabotage — Marketing Site

Static marketing site for **AI Sabotage: Cyber Cards** — a cyberpunk
strategy card game. Built with vanilla HTML, CSS and JS for fast
load times and perfect Lighthouse scores.

## Stack

- HTML, CSS, vanilla JS (no framework)
- Prettier for formatting / linting
- Playwright for end-to-end tests
- GitLab CI for `prettier check` → `playwright test` → deploy to **GitHub Pages**

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

## CI/CD (GitLab → GitHub Pages)

Required CI/CD variables (Settings → CI/CD → Variables) on GitLab:

| name           | kind   | value                                                         |
| -------------- | ------ | ------------------------------------------------------------- |
| `GITHUB_TOKEN` | masked | A GitHub PAT with `repo` push access to the target repo.      |
| `GITHUB_REPO`  | var    | `OWNER/REPO` of the GitHub repository hosting the Pages site. |

Pipeline:

1. `prettier` — `prettier --check .` (format gate)
2. `playwright` — installs Chromium + runs `npm run test`
3. `deploy:pages` — pushes the static tree to the `gh-pages` branch of `$GITHUB_REPO`

Triggers on `main`. Configure GitHub Pages in the target repo to
publish from the `gh-pages` branch root.

## ASO keywords used on the site

Primary (en-US): **AI card game**, **cyberpunk**, **sabotage**, **AGI**,
**hacking game**, **robot**, **ranking**, **leaderboard**,
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
