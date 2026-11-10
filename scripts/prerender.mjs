import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { render } from '../.prerender/entry-server.js';
import { pages, siteUrl } from '../src/pages.js';
import { profile } from '../src/content.js';
const template = await readFile('dist/index.html', 'utf8');
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const hashes = [];
for (const page of pages) {
  const url = siteUrl + page.path;
  const person = { '@type': 'Person', '@id': siteUrl + '/#person', name: profile.name, alternateName: 'Marie Robin', url: siteUrl + '/', description: profile.introduction, jobTitle: profile.role, worksFor: { '@type': 'CollegeOrUniversity', name: profile.institution }, alumniOf: ['Columbia University', 'Durham University', 'American University of Paris'].map(name => ({ '@type': 'CollegeOrUniversity', name })) };
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@graph': [person, { '@type': 'WebSite', '@id': siteUrl + '/#website', url: siteUrl + '/', name: profile.name }, { '@type': page.id === 'about' ? 'ProfilePage' : 'WebPage', '@id': url, url, name: page.title, description: page.description, isPartOf: { '@id': siteUrl + '/#website' }, ...(page.id === 'about' ? { mainEntity: { '@id': person['@id'] } } : { about: { '@id': person['@id'] } }) }] }).replaceAll('<', '\\u003c');
  hashes.push(`'sha256-${createHash('sha256').update(schema).digest('base64')}'`);
  const head = `<title>${escape(page.title)}</title>
    <meta name="description" content="${escape(page.description)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${profile.name}" />
    <meta property="og:title" content="${escape(page.title)}" />
    <meta property="og:description" content="${escape(page.description)}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${siteUrl}/marie-robin-960.jpg" />
    <meta property="og:image:alt" content="${profile.name}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(page.title)}" />
    <meta name="twitter:description" content="${escape(page.description)}" />
    <meta name="twitter:image" content="${siteUrl}/marie-robin-960.jpg" />
    <meta name="twitter:image:alt" content="${profile.name}" />
    <script type="application/ld+json">${schema}</script>`;
  const directory = `dist${page.path}`;
  await mkdir(directory, { recursive: true });
  await writeFile(`${directory}index.html`, template.replace('<!--page-head-->', head).replace('<div id="root"></div>', `<div id="root">${render(page.id)}</div>`));
}
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(page => `<url><loc>${siteUrl}${page.path}</loc></url>`).join('')}</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);
const headers = await readFile('public/_headers', 'utf8');
await writeFile('dist/_headers', headers.replace('SCRIPT_HASHES', hashes.join(' ')));
await rm('.prerender', { recursive: true, force: true });
