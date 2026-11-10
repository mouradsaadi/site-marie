# Marie E. Robin

Academic portfolio built with React and Vite, hosted on Cloudflare Pages at https://www.marieerobin.com.

Use Node 22.12+ (Node 22 LTS recommended):

```sh
npm ci
npm run dev
npm run build
npm test
npm run preview
```

The build generates five complete HTML pages, hydrates React for the mobile menu, and emits robots.txt, sitemap.xml and Cloudflare security headers. Navigation uses regular links; old homepage hash bookmarks redirect to the equivalent page. No server runtime or new framework is required. Edit academic content in `src/content.js`, presentation in `src/App.jsx`, and page paths/metadata in `src/pages.js`. Keep the canonical origin in `src/pages.js`. No environment variables are needed.

Cloudflare Pages: repository `mouradsaadi/site-marie`, production branch `main` (confirm in dashboard), build command `npm run build && npm test`, output `dist`, Node 22.12+. GitHub Actions checks pull requests and pushes; it no longer deploys a second copy to GitHub Pages. Cloudflare Git integration deploys independently, so configure its build command to run tests too. Never upload the repository or `.prerender` directory as the published output.

Run `npm run check:production` after deployment. It intentionally fails against the old production site until these changes are deployed. Vite preview does not reproduce Cloudflare headers, redirects or 404 status handling; verify those on a Cloudflare preview and production.

See [the audit and deployment checklist](AUDIT.md) for findings, account-level setup, outstanding browser checks, and search engine submission instructions. No deployment or account configuration was performed as part of this checkout change.
