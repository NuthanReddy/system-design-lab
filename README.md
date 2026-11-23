# System Design Lab

An independent, locally runnable recreation of the [Designed to Scale](https://designed-to-scale.vercel.app/) course interface by Dilum Sanjaya. The warm notebook palette, monospace typography, chapter tree, three-pane desktop layout, and isometric animated diagrams follow the reference's visual direction.

## Run

Requires Node.js **20.19+ or 22.12+** and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, normally **http://127.0.0.1:5173**. To choose a port:

```sh
npm run dev -- --port 4173 --strictPort
```

Create and preview the production build:

```sh
npm run build
npm run preview
```

`dist/` contains the static site. There is no backend, analytics, or external API dependency. Hash-based lesson links work on ordinary static hosting.

## GitHub Pages

The public repository deploys to **https://nuthanreddy.github.io/system-design-lab/** through `.github/workflows/pages.yml`. Every push to `main` checks the original lesson content, builds the project site, and publishes the Pages artifact.

GitHub Pages must use **GitHub Actions** as its build source in the repository's **Settings > Pages**. The workflow builds with `/system-design-lab/` as the asset base so scripts, fonts, CSS, and icons resolve under the repository path rather than the domain root.

To reproduce that build locally:

```sh
npm run build -- --base=/system-design-lab/
npm run preview -- --base=/system-design-lab/
```

Open **http://127.0.0.1:4173/system-design-lab/** for the project-path preview. The ordinary development command still serves at the root.

## Explore

- Forty lessons in nine chapters, with **172 original explanatory steps**, topic-specific diagrams, and a complete twelve-step URL shortener design.
- Click a timeline step or use **← / →**. **Space** toggles diagram motion, **R** replays, and **Ctrl+K / Cmd+K** or **/** opens searchable lessons.
- Search explanations as well as titles; use **↑ / ↓**, **Enter**, and **Esc** in the search dialog.
- Inspect a diagram component by clicking it or pressing Enter when focused. Details explain its role and list the active incoming/outgoing paths. **What changed** identifies added/removed components and connections rather than repeating the key idea.
- Expand the diagram into a full-screen modal. Use **+**, **−**, and **Fit** to change diagram scale up to 3×; drag the zoomed board to pan. With the board focused, **+ / − / 0** zoom or reset and arrow keys pan when zoomed. On phones, zoom buttons live inside the expanded view. **Esc** closes it and restores focus without restarting animation.
- Switch light/dark theme. Reaching a lesson's final step records completion automatically and provides a **Next lesson** link, including across chapter boundaries.
- Narrow screens have an accessible course drawer, stacked diagrams/explanations, and persistent **Back/Next** controls. Reduced-motion preferences start animations paused.
- The interface supports **English, Spanish, and French**, including `?lang=es` and `?lang=fr`. Educational explanations are in English; the language menu explicitly states this.

The course first opens on **Design a URL Shortener**, then remembers your last position. Each lesson retains its own last step when reopened through search or the course tree; explicit deep links always select the requested step. Direct links such as `/#/caching/3` select a lesson and step. Browser history navigates between steps. The language picker remains available in the compact phone header; section tabs are hidden on phones.

## Scope and attribution

This is an independent implementation, **not an official distribution or source mirror**. No license authorizing reuse of the reference's original implementation, prose, or illustrations was verified. Accordingly, all course explanations, SVG components, animation paths, icons, and application code here were independently authored. The standard concept names and observed visual structure are used for learning and navigation; original author attribution is linked in the header.

Compared with the reference:

- The visual identity and core course interactions are recreated, but vector artwork and prose are original rather than pixel-identical copies.
- The twelve-step URL shortener is the most detailed lesson. Other lessons have four or five original steps rather than the reference's exact sequences.
- Interface localization covers three languages, not the reference's twenty-one fully localized courses.
- **Practice**, **Design Lab**, and **Cheatsheets** display a coming-soon notice, matching their observed behavior on the live reference.
- The metrics shown in diagrams are explicitly illustrative estimates, not measurements of a production shortener.
- GitHub Pages publishes the static course only; no URL-shortening backend is deployed.

The code and original educational content are available under [MIT](LICENSE). JetBrains Mono is installed from `@fontsource/jetbrains-mono` and distributed under the SIL Open Font License; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Checks

```sh
npm test
npm run build
npm run test:e2e
```

The browser suite starts its own server on port 4177 (never reusing another app's server) and runs desktop and mobile viewports using installed Microsoft Edge. To use Playwright's bundled Chromium instead, remove `channel: 'msedge'` from `playwright.config.js` and run `npx playwright install chromium`.

Tests cover all lesson routes and diagrams, timeline navigation, playback, persisted progress and themes, keyboard search, component inspection, zoom, localization, and mobile overflow.

## Project map

| Path | Purpose |
| --- | --- |
| `src/course.js` | Original lesson content, chapter tree, and route parsing |
| `src/diagram.js` | Independent isometric SVG renderer and request animations |
| `src/main.js` | Course state, search, settings, navigation, and interactions |
| `src/styles.css` | Reference-inspired visual tokens and responsive layouts |
| `test/` | Content/geometry unit tests and desktop/mobile browser tests |
