import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { pages, siteUrl } from '../src/pages.js';
import { publications, research, profile } from '../src/content.js';
const read = path => readFile(path, 'utf8');
const titles = new Set();
const descriptions = new Set();
for (const page of pages) {
  test(`${page.path}: indexable static content and consistent metadata`, async () => {
    const html = await read(`dist${page.path}index.html`);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.ok(html.includes(`rel="canonical" href="${siteUrl}${page.path}"`));
    assert.ok(!html.includes('noindex'));
    assert.ok(!html.includes('%VITE_'));
    assert.ok(!html.includes('<!--page-head-->'));
    assert.ok(!html.includes('<div id="root"></div>'));
    for (const target of pages) assert.ok(html.includes(`href="${target.path}"`));
    const title = html.match(/<title>(.*?)<\/title>/)[1];
    const description = html.match(/name="description" content="([^"]+)"/)[1];
    assert.ok(!titles.has(title)); titles.add(title);
    assert.ok(!descriptions.has(description)); descriptions.add(description);
    const json = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
    const schema = JSON.parse(json);
    assert.equal(schema['@graph'][0].name, profile.name);
    assert.equal(schema['@graph'][2].url, siteUrl + page.path);
    const hash = createHash('sha256').update(json).digest('base64');
    assert.ok((await read('dist/_headers')).includes(`'sha256-${hash}'`));
    if (page.id === 'publication') for (const item of publications) assert.ok(html.includes(item.title));
    if (page.id === 'research') assert.ok(html.includes(research.subtitle));
    if (page.id === 'about') assert.ok(html.includes('PhD in History from Columbia University in 2026'));
  });
}
test('sitemap, crawler rules, true-404 artifact and safe asset caching', async () => {
  const sitemap = await read('dist/sitemap.xml');
  assert.equal((sitemap.match(/<loc>/g) || []).length, pages.length);
  for (const page of pages) assert.ok(sitemap.includes(`<loc>${siteUrl}${page.path}</loc>`));
  assert.ok((await read('dist/robots.txt')).includes(`Sitemap: ${siteUrl}/sitemap.xml`));
  assert.ok((await read('dist/404.html')).includes('noindex'));
  assert.ok(!(await read('dist/_headers')).includes('SCRIPT_HASHES'));
  const assets = await readdir('dist/assets');
  assert.ok(!assets.some(file => file.endsWith('.map')));
  assert.ok(assets.some(file => file.endsWith('.js')));
});
