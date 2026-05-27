import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute base domain for the production deployment
const DOMAIN = 'https://goateddd.com';

// Define core pages / routes for the studio website
const routes = [
  { path: '/', changefreq: 'daily', priority: '1.0' }
];

const generateSitemap = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  routes.forEach((route) => {
    sitemapXml += `  <url>
    <loc>${DOMAIN}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>\n`;
  });

  sitemapXml += `</urlset>\n`;

  const publicDir = path.resolve(__dirname, '../public');
  const outputPath = path.join(publicDir, 'sitemap.xml');

  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, sitemapXml, 'utf8');
    console.log(`[Sitemap Generator] Success: Generated sitemap.xml at ${outputPath}`);
  } catch (err) {
    console.error(`[Sitemap Generator] Error: Failed to write sitemap.xml`, err);
    process.exit(1);
  }
};

generateSitemap();
