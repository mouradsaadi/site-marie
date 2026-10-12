# Marie E. Robin — academic website

A static React website built with Vite. No database or backend is required.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build and preview

```sh
npm run build
npm run preview
```

The `dist/` directory can be served by any static website host. Navigation uses URL hashes, so direct links to sections work without server rewrites.

## Host on GitHub Pages

The included GitHub Actions workflow builds and deploys the site from the `main` branch. In the GitHub repository, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. After the next push to `main`, follow the deployment under the **Actions** tab. The site URL will be `https://mouradsaadi.github.io/site-marie/` unless a custom domain is configured.

## Update the website

- Biography, research, courses, publications, media links, and contact information: `src/content.js`.
- Layout and navigation: `src/main.jsx`.
- Colours, typography, and responsive layouts: `src/styles.css`.
- Portrait: `public/marie-robin.jpg`.
- Browser metadata: `index.html`.

The custom domain is not configured yet. When switching to a purchased domain, update the Vite base path, the absolute social image URL in `index.html`, and the GitHub Pages domain settings together. Profile structured data in `index.html` should stay consistent with the visible biography.

Google Fonts supplies DM Sans and Source Serif 4; local sans-serif and Georgia fallbacks work when the fonts are unavailable. All other application assets are served locally.

