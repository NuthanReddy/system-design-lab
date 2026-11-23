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

`dist/` contains the static site. There is no backend, hosted deployment, analytics, or external API dependency. Hash-based lesson links work on ordinary static hosting.

## Explore

- Forty lessons in nine chapters, with **172 original explanatory steps**, topic-specific diagrams, and a complete twelve-step URL shortener design.
- Click a timeline step or use **← / →**. **Space** toggles diagram motion, **R** replays, and **Ctrl+K / Cmd+K** or **/** opens searchable lessons.
- Search explanations as well as titles; use **↑ / ↓**, **Enter**, and **Esc** in the search dialog.
- Inspect a diagram component by clicking it or pressing Enter when focused. Use **+**, **−**, and **Fit** to change diagram scale; drag the zoomed board to pan. With the board focused, **+ / − / 0** zoom or reset and arrow keys pan when zoomed.
- Switch light/dark theme. At the final step, select **Complete lesson** to persist chapter and overall progress in the browser.
- Narrow screens have a course drawer and stacked diagrams/explanations. Reduced-motion preferences start animations paused.
- The interface supports **English, Spanish, and French**, including `?lang=es` and `?lang=fr`. Educational explanations are in English; the language menu explicitly states this.

The course first opens on **Design a URL Shortener**, then remembers your last position. Direct links such as `/#/caching/3` select a lesson and step. Browser history navigates between steps. On phones, the reference-like compact header hides section tabs and language selection; `?lang=es` or `?lang=fr` still sets the interface language.

## Scope and attribution

This is an independent implementation, **not an official distribution or source mirror**. No license authorizing reuse of the reference's original implementation, prose, or illustrations was verified. Accordingly, all course explanations, SVG components, animation paths, icons, and application code here were independently authored. The standard concept names and observed visual structure are used for learning and navigation; original author attribution is linked in the header.

Compared with the reference:

- The visual identity and core course interactions are recreated, but vector artwork and prose are original rather than pixel-identical copies.
- The twelve-step URL shortener is the most detailed lesson. Other lessons have four or five original steps rather than the reference's exact sequences.
- Interface localization covers three languages, not the reference's twenty-one fully localized courses.
- **Practice**, **Design Lab**, and **Cheatsheets** display a coming-soon notice, matching their observed behavior on the live reference.
- The metrics shown in diagrams are explicitly illustrative estimates, not measurements of a production shortener.
- No deployment has been performed.

The code and original educational content are available under [MIT](LICENSE). JetBrains Mono is installed from `@fontsource/jetbrains-mono` and distributed under the SIL Open Font License; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Checks

```sh
npm test
npm run build
npm run test:e2e
```

The browser suite runs desktop and mobile viewports using installed Microsoft Edge. To use Playwright's bundled Chromium instead, remove `channel: 'msedge'` from `playwright.config.js` and run `npx playwright install chromium`.

Tests cover all lesson routes and diagrams, timeline navigation, playback, persisted progress and themes, keyboard search, component inspection, zoom, localization, and mobile overflow.

## Project map

| Path | Purpose |
| --- | --- |
| `src/course.js` | Original lesson content, chapter tree, and route parsing |
| `src/diagram.js` | Independent isometric SVG renderer and request animations |
| `src/main.js` | Course state, search, settings, navigation, and interactions |
| `src/styles.css` | Reference-inspired visual tokens and responsive layouts |
| `test/` | Content/geometry unit tests and desktop/mobile browser tests |
