#!/usr/bin/env node
// Generates frontend/public/sitemap.xml at build time by pulling the live
// product + collection catalogue from the API. If the API is unreachable, ship
// a sitemap with only the static pages so the build never fails — a partial
// sitemap is far better than no sitemap.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE_URL = (process.env.SITE_URL || 'https://ektaacouture.store').replace(/\/$/, '');
const API_URL = (process.env.SITEMAP_API_URL || process.env.VITE_API_URL || 'https://backend-code-t3br.onrender.com/api').replace(/\/$/, '');
const FETCH_TIMEOUT_MS = 30_000;

const here = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(here, '..', 'public', 'sitemap.xml');

const staticPaths = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/collections/all', changefreq: 'daily', priority: '0.9' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/shipping', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
];

const fetchJson = async (url) => {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
};

const safeFetch = async (url, label) => {
  try {
    return await fetchJson(url);
  } catch (err) {
    console.warn(`[sitemap] WARN: ${label} fetch failed (${err.message}). Sitemap will omit ${label}.`);
    return null;
  }
};

const xmlEscape = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toIsoDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

const buildUrlBlock = ({ loc, lastmod, changefreq, priority }) => {
  const parts = [`    <loc>${xmlEscape(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) parts.push(`    <priority>${priority}</priority>`);
  return `  <url>\n${parts.join('\n')}\n  </url>`;
};

const main = async () => {
  console.log(`[sitemap] SITE_URL=${SITE_URL}`);
  console.log(`[sitemap] API_URL=${API_URL}`);

  const [productsRes, collectionsRes] = await Promise.all([
    safeFetch(`${API_URL}/products?status=active&limit=1000`, 'products'),
    safeFetch(`${API_URL}/collections`, 'collections'),
  ]);

  const products = productsRes?.products || [];
  const collections = (collectionsRes?.collections || []).filter(
    (c) => c.isVisible !== false
  );

  const urls = [];

  for (const sp of staticPaths) {
    urls.push({
      loc: `${SITE_URL}${sp.path}`,
      changefreq: sp.changefreq,
      priority: sp.priority,
    });
  }

  for (const c of collections) {
    if (!c.slug) continue;
    urls.push({
      loc: `${SITE_URL}/collections/${c.slug}`,
      lastmod: toIsoDate(c.updatedAt),
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  for (const p of products) {
    if (!p.slug || p.status === 'archived' || p.status === 'draft') continue;
    urls.push({
      loc: `${SITE_URL}/product/${p.slug}`,
      lastmod: toIsoDate(p.updatedAt),
      changefreq: 'weekly',
      priority: '0.7',
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(buildUrlBlock).join('\n')}
</urlset>
`;

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, xml, 'utf8');

  console.log(
    `[sitemap] Wrote ${urls.length} URLs (${staticPaths.length} static, ${collections.length} collections, ${products.length} products) -> public/sitemap.xml`
  );
};

main().catch((err) => {
  console.error('[sitemap] FATAL:', err);
  // Still write a minimal sitemap so the build can proceed.
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths.map((sp) => buildUrlBlock({ loc: `${SITE_URL}${sp.path}`, changefreq: sp.changefreq, priority: sp.priority })).join('\n')}
</urlset>
`;
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, xml, 'utf8');
  console.error('[sitemap] Wrote fallback static-only sitemap.');
  process.exit(0);
});
