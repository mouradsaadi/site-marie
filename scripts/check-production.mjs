import assert from 'node:assert/strict';
import { pages, siteUrl } from '../src/pages.js';
const get = url => fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) });
for (const page of pages) {
  const response = await get(siteUrl + page.path);
  assert.equal(response.status, 200, page.path);
  const html = await response.text();
  assert.ok(html.includes(`rel="canonical" href="${siteUrl}${page.path}"`), `canonical: ${page.path}`);
  assert.ok(html.includes('<h1'), `static content: ${page.path}`);
  assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'));
  assert.ok(response.headers.get('content-security-policy')?.includes("frame-ancestors 'none'"));
}
for (const origin of ['http://marieerobin.com', 'https://marieerobin.com', 'http://www.marieerobin.com']) {
  const response = await get(origin + '/research/?audit=1');
  assert.ok([301, 308].includes(response.status));
  assert.equal(response.headers.get('location'), siteUrl + '/research/?audit=1');
}
assert.equal((await get(siteUrl + '/audit-nonexistent-page')).status, 404);
assert.ok((await (await get(siteUrl + '/robots.txt')).text()).includes(`Sitemap: ${siteUrl}/sitemap.xml`));
const sitemap = await (await get(siteUrl + '/sitemap.xml')).text();
for (const page of pages) assert.ok(sitemap.includes(`<loc>${siteUrl}${page.path}</loc>`));
console.log('Production content, redirects, crawler files and headers passed.');
console.log('Separately verify the pages.dev redirect, browser behavior, and Search Console indexing.');
