# Production readiness audit — 10 November 2026

Scope: checkout at baseline `d1a888b`, public HTTP responses, source/dependency review, and local production artifacts. Changes are local, not deployed. The supplied request ends at “Gender” in section 8; no further requirements were present in the attachment. Academic facts were checked against existing project content, not independently certified against institutional records.

## Confirmed initial findings

| Priority | Evidence | Resolution |
| --- | --- | --- |
| High | Homepage response contains an empty `#root`; custom hash routing, no React Router. Biography, research, publication titles, appointments and dissertation information appear only after JavaScript runs. | Build-time React rendering for five pages, ordinary path links, client hydration; legacy homepage hash bookmarks retained. |
| High | `/robots.txt` and `/sitemap.xml` both return 200 with homepage HTML, not valid crawler files. | Generated valid crawler files from one route registry. |
| High | `/audit-missing-page` returns 200 with the SPA shell. | Added top-level `404.html`; validate actual 404 status after Cloudflare deployment. |
| High | No canonical; live OG image contains literal `%VITE_SITE_URL%`. No Twitter card; only title changes between hash views. | Unique static metadata, absolute www canonicals/social URLs on every page, no environment substitution. |
| Medium | `https://site-marie.pages.dev/` returns 200 and the same shell. | Canonicals now identify www; account-level permanent redirect remains outstanding. |
| Medium | Workflow deploys GitHub Pages and README describes it, contrary to Cloudflare production context. | Workflow now checks builds/tests/audit with read-only permissions; documented Cloudflare Git deployment. |
| Medium | No repository headers; production already sends nosniff and strict-origin-when-cross-origin. No CSP, Permissions-Policy or HSTS observed in homepage HEAD response. | Added CSP, permissions and frame protection; preserved existing policies. HSTS remains an account decision. |
| Low | Original 3413×5120 JPEG is 295,579 bytes for a roughly 354px portrait. CSS imports remote fonts. | 480/960px responsive JPEGs (63,494 / 214,302 bytes), dimensions and high fetch priority retained; font stylesheet moved to head with preconnect and swap. |

Observed redirects: HTTP apex, HTTPS apex, and HTTP www requests to `/research/?audit=1` each returned one 301 directly to `https://www.marieerobin.com/research/?audit=1`. No chain or loop in these sampled cases. Preserve this existing setup. HTTPS homepage returns 200. Public HTML/headers show no noindex or X-Robots-Tag restriction on the sampled homepage; this is not proof of indexing.

## Implementation and content integrity

`src/pages.js` is the route/metadata registry. Vite builds the client and a temporary server-render bundle; `scripts/prerender.mjs` uses the same App and content to generate HTML, then removes the temporary bundle. Deployment remains static. Browser navigation uses full page requests, so Back/Forward and deep links use normal browser behavior and per-page metadata. Legacy `/#research` (and the other original hash routes) redirect with JavaScript; fragments are never sent to the server. There is no wildcard rewrite masking missing pages.

All original biography/research/teaching/publication/media text remains intact. “Forthcoming” items remain forthcoming. No DOI, publication date, profile identifier or affiliation was invented. Existing name, fellowship, universities and dissertation/book topic support the metadata. Article titles are present in initial publication-page HTML. Added Person, WebSite, ProfilePage (home) and WebPage entities with stable IDs. No verified external personal profile was supplied, so no sameAs. No separate article pages or meaningful nested hierarchy exist, so ScholarlyArticle and BreadcrumbList were not added just for scoring. Existing favicon retained.

Static rendering reduces dependence on crawler JavaScript processing; it does not guarantee ranking or indexing. See [Google’s rendering guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/dynamic-rendering). A top-level 404 file disables Pages’ default SPA fallback; see [Cloudflare serving behavior](https://developers.cloudflare.com/pages/configuration/serving-pages/).

## Security and dependency review

`npm ci` and `npm audit --json` completed: **0 known vulnerabilities**, including production and development dependencies. React/react-dom are production dependencies; Vite/Rollup/esbuild are build tooling. No new dependencies or major upgrades were necessary. Lockfile retained; root engine requirement added. There were no tests initially; six artifact regression checks now cover static content, metadata, navigation, schema JSON/CSP hashes, crawler files, 404 artifact and absent sourcemaps.

Tracked filenames and current source/config were checked for environment files, credentials and obvious secret patterns; none found. This is not a full historical secret scan. No node_modules, dist or private key files were tracked. Build sourcemaps remain disabled. `.env` and `.env.*` are now ignored except an example file. Never store secrets in VITE_ variables: they can be bundled for visitors. Publish only `dist`.

Resource inventory: same-origin React/module/CSS/image/favicon; Google Fonts CSS at fonts.googleapis.com and font files at fonts.gstatic.com; external media links and mailto links; no forms or third-party embedded content. No analytics script was present in sampled production HTML. CSP permits Cloudflare Web Analytics script and collection endpoints in case enabled at the edge. Generated JSON-LD receives exact SHA-256 script hashes. Inline styles are allowed for the no-JavaScript menu and React compatibility; executable inline scripts and eval are not allowed. Review console/network for blocked resources on a Cloudflare preview before promotion. Cloudflare edge rules can add headers independently: remove conflicting duplicate policies after inspecting the final response, following [header behavior](https://developers.cloudflare.com/pages/configuration/headers/).

## Performance and accessibility

Built client JS: 237.18 kB uncompressed / 74.43 kB gzip; CSS: 8.83 kB / 2.55 kB gzip. All five small page components share a bundle. There are no heavy widgets or clearly unused package dependencies; route splitting would add complexity for modest savings and was deferred. Hashed assets receive one-year immutable caching; HTML and mutable images retain Pages defaults. Keep the above-fold portrait eager; do not lazy-load the likely LCP image. Responsive JPEGs preserve broad compatibility; WebP/AVIF remain optional future work after visual QA. Remote fonts can still cause layout shift despite swap and preconnect; measure before deciding whether to self-host.

Existing landmarks, descriptive image alternative, link names, one H1 per view, skip link, focus styles, menu expanded state, Escape handling and external-link announcements were retained. Added no-JavaScript mobile navigation and reduced-motion override. Full page navigation avoids custom SPA focus management. No PDF/CV downloads exist, so no document accessibility claim is made. Automated checks verify one H1 and crawlable navigation, not WCAG conformance.

Browser host was unavailable. Production rendered-DOM comparison, hydration/console inspection, automated axe checks, Lighthouse, contrast verification, keyboard/screen reader testing, mobile overflow, image quality/crop and real LCP/INP/CLS remain unverified. No performance scores or Core Web Vitals pass is claimed. Test at 320/375/768/1440px, zoom 200–400%, keyboard menu/skip-link/Escape, Back/Forward, legacy hashes, JavaScript disabled, and reduced motion. Run Lighthouse mobile on Cloudflare preview; use Search Console/CrUX field data where sufficient traffic exists (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at the 75th percentile).

## Account-level work and release verification

No live Cloudflare settings were changed.

1. Confirm Pages uses this repository, intended production branch, Node 22.12+, `npm run build && npm test`, output `dist`. GitHub CI alone cannot gate Cloudflare’s independent Git integration; run checks in the Pages build as well. Review the preview deployment before merging/pushing production changes. Retain the previous successful deployment for rollback.
2. Keep the existing apex/HTTP redirects. Verify custom domain DNS is attached to this Pages project and remove stale/conflicting records only after checking dashboard ownership/configuration.
3. Redirect `site-marie.pages.dev` to `https://www.marieerobin.com` using Cloudflare Bulk Redirects: 301, preserve query string, subpath matching and preserve path suffix enabled. Scope to the production pages.dev host; choose “include subdomains” only if preview aliases should also redirect. Keep preview aliases separate if needed for review. Follow [Cloudflare’s custom-domain redirect instructions](https://developers.cloudflare.com/pages/how-to/redirect-to-custom-domain/). Do not put global noindex/disallow rules in shared production files, and do not use an unconditional redirect that also matches www.
4. Review HTTPS enforcement, Full (strict) TLS where applicable, minimum TLS 1.2 and TLS 1.3 support. Confirm all relevant hosts support HTTPS before enabling HSTS; begin with a short max-age, without includeSubDomains/preload, then increase after verification. Do not blindly enable preload.
5. Review security events for false positives. Avoid broad bot challenges or rate limits on these public static pages; preserve legitimate crawlers and accessibility tools. Add rate limiting only for demonstrated abuse. No application API exists to protect with a new blanket limit.
6. After deployment run `npm run check:production`; separately test `https://site-marie.pages.dev/research/?audit=1` returns a permanent redirect preserving path/query. Confirm each canonical URL returns 200, an unknown URL returns 404, no unexpected noindex appears, security headers are present once, and compressed assets/cache behavior are correct. Inspect the browser for CSP/hydration errors and test mobile navigation. Vite preview cannot validate Cloudflare status/header behavior.
7. Paste generated HTML into [Schema.org Validator](https://validator.schema.org/) and [Google Rich Results Test](https://search.google.com/test/rich-results); inspect the deployed URLs too. Local tests validate JSON, entity identity and matching CSP hashes, not external schema eligibility. No rich-result guarantee is implied.

## Search engine setup (manual)

Google: sign in to [Search Console](https://search.google.com/search-console), add Domain property `marieerobin.com`, copy its exact verification TXT value, and add it in Cloudflare DNS (type TXT, name `@`, supplied value). Return to Verify; retain the record. This covers www and apex; see [Google’s DNS verification instructions](https://support.google.com/webmasters/answer/9008080?hl=en). Open Sitemaps and submit `https://www.marieerobin.com/sitemap.xml`. In URL Inspection, inspect all five canonical URLs, run Test Live URL, check rendered content and selected canonical, then request indexing where appropriate. Monitor Page indexing, sitemap fetch results and query performance. No verification token is fabricated or embedded in this repository.

Bing: sign in to [Bing Webmaster Tools](https://www.bing.com/webmasters/), import the verified Google property, or add `https://www.marieerobin.com` manually and complete the exact DNS verification Bing provides. Open Sitemaps, submit the same sitemap URL, and use URL Inspection to check canonical pages. See [Bing verification](https://www2.bing.com/webmasters/help/add-and-verify-site-12184f8b) and [sitemap guidance](https://www2.bing.com/webmasters/help/sitemaps-3b5cf6ed).

IndexNow is optional for this infrequently updated portfolio and is not implemented. If adopted, follow the provider’s key-file verification process and submit only changed canonical URLs after successful deployment; it does not replace sitemaps or Google submission. Account access and authoritative indexing reports were unavailable: no submission or indexing success is claimed.

## Verification result

Production build and six artifact tests passed with official Node 22.23.4. The app-bundled Node runtime initially failed native Rollup loading due to macOS signing restrictions; an official temporary runtime verified against Node’s published SHA-256 checksum resolved that environment issue without changing project dependencies. `git diff --check` passed. The audit is complete at source/artifact level; deployment, account settings and browser/field validation remain the explicit release checklist above.
