import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to ensure target directories exist
const ensureDirectoryExists = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

const compileEngine = () => {
  console.log('[Content Compiler] Starting compilation engine...');

  const servicesDir = path.join(ROOT_DIR, 'content', 'services');
  const locationsDir = path.join(ROOT_DIR, 'content', 'locations');
  const blogDir = path.join(ROOT_DIR, 'content', 'blog');
  
  const serviceTemplatePath = path.join(ROOT_DIR, 'templates', 'service_template.html');
  const locationTemplatePath = path.join(ROOT_DIR, 'templates', 'location_template.html');
  const blogTemplatePath = path.join(ROOT_DIR, 'templates', 'blog_template.html');

  // Arrays to hold all compiled items for list feeds and sitemap
  const services = [];
  const locations = [];
  const blogs = [];

  // 1. COMPILE SERVICES
  if (fs.existsSync(servicesDir)) {
    const serviceFiles = fs.readdirSync(servicesDir).filter(f => f.endsWith('.json'));
    const template = fs.readFileSync(serviceTemplatePath, 'utf8');

    serviceFiles.forEach(file => {
      const filePath = path.join(servicesDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const slug = data.id || file.replace('.json', '');
      data.slug = slug;
      services.push(data);

      console.log(`[Content Compiler] Compiling service: /services/${slug}`);

      // Generate Outcomes Cards HTML
      let outcomesHtml = '';
      (data.outcomes || []).forEach(o => {
        outcomesHtml += `
        <div class="outcome-card">
          <div class="outcome-metric">${o.metric}</div>
          <div class="outcome-label">${o.label}</div>
        </div>`;
      });

      // Generate Capabilities list HTML
      let capabilitiesHtml = '';
      (data.capabilities || []).forEach(c => {
        capabilitiesHtml += `
        <li class="capability-item">
          <span class="capability-bullet"></span>
          <span>${c}</span>
        </li>`;
      });

      // Generate Features grid HTML
      let featuresHtml = '';
      (data.features || []).forEach(f => {
        featuresHtml += `
        <div class="feature-card">
          <div class="feature-card-glow"></div>
          <div>
            <h3 class="feature-card-title">${f.title}</h3>
            <p class="feature-card-desc">${f.description}</p>
          </div>
          <div class="feature-card-benefit">
            <span style="color: var(--accent-purple);">Benefit:</span> ${f.benefit}
          </div>
        </div>`;
      });

      // Generate Pricing Plans HTML
      let pricingHtml = '';
      const plans = (data.pricing && data.pricing.plans) || [];
      plans.forEach((p, idx) => {
        const isPremium = idx === 1;
        const cardClass = isPremium ? 'plan-card premium-plan' : 'plan-card';
        const badgeHtml = isPremium ? `<span class="plan-badge">POPULAR</span>` : '';
        
        let deliverablesHtml = '';
        (p.deliverables || []).forEach(d => {
          deliverablesHtml += `
          <li class="plan-deliverable-item">
            <span class="plan-check">✓</span>
            <span>${d}</span>
          </li>`;
        });

        pricingHtml += `
        <div class="${cardClass}">
          ${badgeHtml}
          <div>
            <h3 class="plan-tier">${p.tier}</h3>
            <div class="plan-meta">
              <span>${p.pricing_model}</span>
              <span>•</span>
              <span>${p.timeline}</span>
            </div>
            <div class="plan-price">$${p.starting_price.toLocaleString()}<span> starting</span></div>
            <p class="plan-desc">${p.description}</p>
          </div>
          <div>
            <h4 class="plan-deliverables-title">WHAT'S INCLUDED</h4>
            <ul class="plan-deliverables">
              ${deliverablesHtml}
            </ul>
          </div>
        </div>`;
      });

      // Generate FAQ Accordion HTML
      let faqHtml = '';
      (data.faqs || []).forEach((f, idx) => {
        const numStr = String(idx + 1).padStart(2, '0');
        faqHtml += `
        <div class="faq-item">
          <button class="faq-trigger" aria-expanded="false" aria-controls="faq-ans-${idx}">
            <span class="faq-number">${numStr}</span>
            <span class="faq-question">${f.question}</span>
            <span class="faq-icon-wrapper">
              <span class="faq-icon-line line-h"></span>
              <span class="faq-icon-line line-v"></span>
            </span>
          </button>
          <div id="faq-ans-${idx}" class="faq-content" role="region" aria-label="Answer ${numStr}">
            <div class="faq-content-inner">
              <p>${f.answer}</p>
            </div>
          </div>
        </div>`;
      });

      // Substitute in template
      let compiledHtml = template
        .replace(/\{\{TITLE\}\}/g, data.title)
        .replace(/\{\{META_DESCRIPTION\}\}/g, data.tagline)
        .replace(/\{\{TAGLINE\}\}/g, data.tagline)
        .replace(/\{\{SLUG\}\}/g, slug)
        .replace(/\{\{VOICE_NOTE\}\}/g, data.voice_note)
        .replace(/\{\{OVERVIEW\}\}/g, data.overview)
        .replace(/\{\{OUTCOMES_CARDS\}\}/g, outcomesHtml)
        .replace(/\{\{CAPABILITIES_LIST\}\}/g, capabilitiesHtml)
        .replace(/\{\{FEATURES_GRID\}\}/g, featuresHtml)
        .replace(/\{\{PRICING_PLANS\}\}/g, pricingHtml)
        .replace(/\{\{FAQ_ACCORDION\}\}/g, faqHtml);

      // Write to physical subdirectory
      const outputPath = path.join(ROOT_DIR, 'services', slug, 'index.html');
      ensureDirectoryExists(outputPath);
      fs.writeFileSync(outputPath, compiledHtml, 'utf8');
    });
  }

  // 2. COMPILE LOCATIONS
  if (fs.existsSync(locationsDir)) {
    const locationFiles = fs.readdirSync(locationsDir).filter(f => f.endsWith('.json'));
    const template = fs.readFileSync(locationTemplatePath, 'utf8');

    locationFiles.forEach(file => {
      const filePath = path.join(locationsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const slug = data.slug || file.replace('.json', '');
      locations.push(data);

      console.log(`[Content Compiler] Compiling location: /location/${slug}`);

      // Landmarks HTML
      let landmarksTags = '';
      (data.landmarks || []).forEach(l => {
        landmarksTags += `<span class="geo-tag">${l}</span>\n`;
      });

      // Service Areas HTML
      let serviceAreasTags = '';
      (data.serviceAreas || []).forEach(s => {
        serviceAreasTags += `<span class="geo-tag">${s}</span>\n`;
      });

      // Pain Points HTML
      let painPointsHtml = '';
      ((data.regionalCopy && data.regionalCopy.painPoints) || []).forEach(p => {
        painPointsHtml += `
        <div class="problem-issue-item">
          <h4 class="problem-title">✗ ${p.issue}</h4>
          <p class="problem-desc">${p.detail}</p>
        </div>`;
      });

      // Testimonials HTML
      let testimonialsHtml = '';
      (data.testimonials || []).forEach(t => {
        testimonialsHtml += `
        <div class="testimonial-card-local">
          <div>
            <div class="t-header-local">
              <div class="t-stars-local">${'★'.repeat(t.rating || 5)}</div>
              <div class="t-role-local">${t.role}</div>
            </div>
            <p class="t-text-local">"${t.text}"</p>
          </div>
          <div>
            <div class="t-author-local">${t.clientName}</div>
            <div class="t-author-company">${t.company}</div>
          </div>
        </div>`;
      });

      // FAQ Accordion HTML
      let faqHtml = '';
      (data.faqs || []).forEach((f, idx) => {
        const numStr = String(idx + 1).padStart(2, '0');
        faqHtml += `
        <div class="faq-item">
          <button class="faq-trigger" aria-expanded="false" aria-controls="faq-ans-${idx}">
            <span class="faq-number">${numStr}</span>
            <span class="faq-question">${f.question}</span>
            <span class="faq-icon-wrapper">
              <span class="faq-icon-line line-h"></span>
              <span class="faq-icon-line line-v"></span>
            </span>
          </button>
          <div id="faq-ans-${idx}" class="faq-content" role="region" aria-label="Answer ${numStr}">
            <div class="faq-content-inner">
              <p>${f.answer}</p>
            </div>
          </div>
        </div>`;
      });

      // Substitute in template
      let compiledHtml = template
        .replace(/\{\{TITLE\}\}/g, data.title)
        .replace(/\{\{META_DESCRIPTION\}\}/g, data.metaDescription)
        .replace(/\{\{SLUG\}\}/g, slug)
        .replace(/\{\{REGIONAL_HEADLINE\}\}/g, data.regionalCopy ? data.regionalCopy.headline : data.title)
        .replace(/\{\{REGIONAL_INTRO\}\}/g, data.regionalCopy ? data.regionalCopy.intro : '')
        .replace(/\{\{REGIONAL_SOLUTION\}\}/g, data.regionalCopy ? data.regionalCopy.solution : '')
        .replace(/\{\{REGIONAL_PRICING_HIGHLIGHT\}\}/g, data.regionalCopy ? data.regionalCopy.pricingHighlight : '')
        .replace(/\{\{NAP_NAME\}\}/g, data.nap.name)
        .replace(/\{\{NAP_STREET\}\}/g, data.nap.streetAddress)
        .replace(/\{\{NAP_LOCALITY\}\}/g, data.nap.locality)
        .replace(/\{\{NAP_REGION\}\}/g, data.nap.region)
        .replace(/\{\{NAP_POSTAL\}\}/g, data.nap.postalCode)
        .replace(/\{\{NAP_COUNTRY\}\}/g, data.nap.country)
        .replace(/\{\{NAP_PHONE\}\}/g, data.nap.phone)
        .replace(/\{\{NAP_EMAIL\}\}/g, data.nap.email)
        .replace(/\{\{NAP_PRICERANGE\}\}/g, data.nap.priceRange)
        .replace(/\{\{GEO_LAT\}\}/g, data.coordinates.latitude)
        .replace(/\{\{GEO_LNG\}\}/g, data.coordinates.longitude)
        .replace(/\{\{LANDMARKS_TAGS\}\}/g, landmarksTags)
        .replace(/\{\{SERVICE_AREAS_TAGS\}\}/g, serviceAreasTags)
        .replace(/\{\{PAIN_POINTS\}\}/g, painPointsHtml)
        .replace(/\{\{TESTIMONIALS\}\}/g, testimonialsHtml)
        .replace(/\{\{FAQ_ACCORDION\}\}/g, faqHtml);

      // Write to physical subdirectory
      const outputPath = path.join(ROOT_DIR, 'location', slug, 'index.html');
      ensureDirectoryExists(outputPath);
      fs.writeFileSync(outputPath, compiledHtml, 'utf8');
    });
  }

  // 3. COMPILE BLOG POSTS
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.json'));
    if (blogFiles.length > 0) {
      const template = fs.readFileSync(blogTemplatePath, 'utf8');

      blogFiles.forEach(file => {
        const filePath = path.join(blogDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const slug = data.slug || file.replace('.json', '');
        blogs.push(data);

        console.log(`[Content Compiler] Compiling blog post: /blog/${slug}`);

        // Tags HTML
        let tagsHtml = '';
        (data.tags || []).forEach(t => {
          tagsHtml += `<a href="#" class="article-tag">${t}</a>\n`;
        });

        // FAQ Accordion HTML
        let faqHtml = '';
        (data.faqs || []).forEach((f, idx) => {
          const numStr = String(idx + 1).padStart(2, '0');
          faqHtml += `
          <div class="faq-item">
            <button class="faq-trigger" aria-expanded="false" aria-controls="faq-ans-${idx}">
              <span class="faq-number">${numStr}</span>
              <span class="faq-question">${f.question}</span>
              <span class="faq-icon-wrapper">
                <span class="faq-icon-line line-h"></span>
                <span class="faq-icon-line line-v"></span>
              </span>
            </button>
            <div id="faq-ans-${idx}" class="faq-content" role="region" aria-label="Answer ${numStr}">
              <div class="faq-content-inner">
                <p>${f.answer}</p>
              </div>
            </div>
          </div>`;
        });

        // Perform strict replacements on the blog_template
        let compiledHtml = template
          .replace(/<title>[^<]+<\/title>/, `<title>${data.title} | GOATEDDD Blog</title>`)
          .replace(/<meta name="description" content="[^"]+"[^>]*>/, `<meta name="description" content="${data.metaDescription}">`)
          .replace(/<span class="blog-meta-badge">[^<]+<\/span>/, `<span class="blog-meta-badge">${data.category}</span>`)
          .replace(/<h1 class="blog-headline gradient-text">[^<]+<\/h1>/s, `<h1 class="blog-headline gradient-text">${data.title.toUpperCase()}</h1>`)
          .replace(/By <span class="meta-name">[^<]+<\/span>/, `By <span class="meta-name">${data.author}</span>`)
          .replace(/<time datetime="[^"]+">[^<]+<\/time>/, `<time datetime="${data.publishDate}">${data.publishDate}</time>`)
          .replace(/<h3 class="author-sidebar-name">[^<]+<\/h3>/, `<h3 class="author-sidebar-name">${data.author}</h3>`)
          .replace(/<span class="author-sidebar-role">[^<]+<\/span>/, `<span class="author-sidebar-role">${data.authorRole}</span>`)
          .replace(/<section class="article-body" id="article-text-wrapper">.*?<\/section>/s, `<section class="article-body" id="article-text-wrapper">${data.contentHtml}</section>`)
          .replace(/<div class=\"footer-share-left\">.*?<\/div>/s, `<div class="footer-share-left">${tagsHtml}</div>`)
          .replace(/<div class="faq-accordion" role="presentation">.*?<\/div>\s*<\/div>\s*<\/div>/s, `<div class="faq-accordion" role="presentation">${faqHtml}</div></div></div>`);

        // Write to physical subdirectory
        const outputPath = path.join(ROOT_DIR, 'blog', slug, 'index.html');
        ensureDirectoryExists(outputPath);
        fs.writeFileSync(outputPath, compiledHtml, 'utf8');
      });
    }
  }

  // 4. GENERATE AND WRITE /services/index.html LIST FEED
  console.log('[Content Compiler] Rebuilding list feed: /services/index.html');
  let servicesFeedCards = '';
  services.forEach(s => {
    let capBullets = '';
    (s.capabilities || []).slice(0, 4).forEach(c => {
      capBullets += `
      <li style="display:flex;align-items:center;gap:8px;font-size:0.9rem;color:var(--text-muted);">
        <span style="width:5px;height:5px;background:var(--accent-pink);border-radius:50%;"></span>
        <span>${c}</span>
      </li>`;
    });

    servicesFeedCards += `
    <div class="glass-card" style="min-height:350px;display:flex;flex-direction:column;justify-content:space-between;padding:40px;">
      <div>
        <h3 class="card-title" style="font-size:1.75rem;margin-bottom:12px;">${s.title}</h3>
        <p class="card-desc" style="font-size:0.98rem;margin-bottom:20px;color:var(--text-muted);">${s.tagline}</p>
        <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:8px;margin-bottom:25px;">
          ${capBullets}
        </ul>
      </div>
      <div>
        <a href="/services/${s.slug}/" class="cs-cta-btn" style="display:inline-block;text-decoration:none;text-align:center;width:100%;"><span class="btn-text">EXPLORE SERVICE</span><span class="btn-glow-layer"></span></a>
      </div>
    </div>`;
  });

  const servicesFeedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bespoke Digital Services & Orchestration Capabilities | GOATEDDD</title>
  <meta name="description" content="Explore selective brand design, interactive animations, custom-engineered portals, and programmatic SEO backstopped by registered MSME MSA speed guarantees.">
  <link rel="stylesheet" href="/index.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    .feed-header { padding-top: 180px; padding-bottom: 60px; text-align: center; position: relative; z-index: 2; }
    .feed-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-bottom: 120px; }
    @media (max-width: 768px) { .feed-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div id="loader" class="loader"><div class="loader-content"><span class="loader-text">GOATEDDD</span><div class="loader-bar-container"><div class="loader-bar"></div></div></div></div>
  <div id="custom-cursor" class="custom-cursor"><div class="cursor-glare"></div><div class="cursor-glare-2"></div><span class="cursor-text">EXPLORE</span></div>
  <div class="ambient-background">
    <canvas id="ambient-particles" class="ambient-particles"></canvas>
    <div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div>
  </div>

  <div id="smooth-wrapper">
    <div id="smooth-content">
      <header class="header">
        <div class="nav-container">
          <a href="/" class="brand-logo">GOATEDDD</a>
          <nav class="nav-links">
            <a href="/" class="nav-link-item">Home</a>
            <a href="/#showreel" class="nav-link-item">About</a>
            <a href="/#work" class="nav-link-item">Work</a>
            <a href="/services/" class="nav-link-item active-nav">Services</a>
            <a href="/#testimonials" class="nav-link-item">Reviews</a>
          </nav>
        </div>
      </header>

      <main class="container" style="position:relative;z-index:2;">
        <header class="feed-header">
          <span style="font-family:var(--font-jakarta);font-size:0.8rem;font-weight:700;letter-spacing:0.2em;color:var(--accent-pink);text-transform:uppercase;">STUDIO EXPERTISE</span>
          <h1 class="gradient-text" style="font-family:var(--font-syne);font-size:5vw;line-height:1.1;margin-top:15px;text-transform:uppercase;">DYNAMIC CAPABILITIES</h1>
        </header>

        <div class="feed-grid">
          ${servicesFeedCards}
        </div>
      </main>

      <footer class="footer">
        <div class="footer-sand-block">
          <div class="container">
            <div class="footer-top">
              <h2 class="footer-headline">WE ARE <br><span class="font-editorial">GOATEDDD</span></h2>
              <div class="footer-action-box">
                <span class="footer-small">CLAIM THE APEX STANDARD</span>
                <a href="mailto:hello@goateddd.com" class="footer-mail-link">hello@goateddd.com</a>
              </div>
            </div>
            <div class="footer-bottom">
              <div class="footer-col">
                <span class="col-title">NAVIGATION</span>
                <a href="/" class="col-item">Home</a>
                <a href="/#showreel" class="col-item">About</a>
                <a href="/#work" class="col-item">Work</a>
              </div>
              <div class="footer-col">
                <span class="col-title">OFFICE</span>
                <p class="col-item" style="pointer-events: none;">Austin, Texas</p>
                <p style="font-size: 0.8rem; margin-top: 10px; color: rgba(12,13,18,0.5);">© 2026 GOATEDDD.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>

  <script type="module" src="/main.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(ROOT_DIR, 'services', 'index.html'), servicesFeedHtml, 'utf8');

  // 5. GENERATE AND WRITE /blog/index.html LIST FEED
  console.log('[Content Compiler] Rebuilding list feed: /blog/index.html');
  let blogFeedCards = '';
  blogs.forEach(b => {
    blogFeedCards += `
    <div class="glass-card" style="min-height:300px;display:flex;flex-direction:column;justify-content:space-between;padding:40px;">
      <div>
        <span style="font-family:var(--font-jakarta);font-size:0.75rem;font-weight:700;color:var(--accent-pink);letter-spacing:0.1em;text-transform:uppercase;">${b.category}</span>
        <h3 class="card-title" style="font-size:1.6rem;margin-top:10px;margin-bottom:12px;">${b.title}</h3>
        <p class="card-desc" style="font-size:0.95rem;color:var(--text-muted);margin-bottom:20px;">${b.tagline}</p>
        <span style="font-size:0.85rem;color:var(--accent-champagne);font-weight:600;">Published: ${b.publishDate} | By ${b.author}</span>
      </div>
      <div style="margin-top:30px;">
        <a href="/blog/${b.slug}/" class="cs-cta-btn" style="display:inline-block;text-decoration:none;text-align:center;width:100%;"><span class="btn-text">READ ARTICLE</span><span class="btn-glow-layer"></span></a>
      </div>
    </div>`;
  });

  // Fallback in case no blogs exist
  if (blogs.length === 0) {
    blogFeedCards = `
    <div class="glass-card" style="grid-column:span 2;padding:60px;text-align:center;">
      <h3 class="card-title">KNOWLEDGE SHARING UNDER CONSTRUCTION</h3>
      <p class="card-desc">Breathtaking insights regarding high-velocity scroll engineering and digital apex positioning are currently being compiled.</p>
    </div>`;
  }

  const blogFeedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Selective Knowledge & Design Audits | GOATEDDD Blog</title>
  <meta name="description" content="Deep structural analysis regarding premium creative direction, scroll synchronization, WebGL interfaces, and high-performance core web vital audits.">
  <link rel="stylesheet" href="/index.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    .feed-header { padding-top: 180px; padding-bottom: 60px; text-align: center; position: relative; z-index: 2; }
    .feed-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; margin-bottom: 120px; }
    @media (max-width: 768px) { .feed-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div id="loader" class="loader"><div class="loader-content"><span class="loader-text">GOATEDDD</span><div class="loader-bar-container"><div class="loader-bar"></div></div></div></div>
  <div id="custom-cursor" class="custom-cursor"><div class="cursor-glare"></div><div class="cursor-glare-2"></div><span class="cursor-text">EXPLORE</span></div>
  <div class="ambient-background">
    <canvas id="ambient-particles" class="ambient-particles"></canvas>
    <div class="orb orb-1"></div><div class="orb orb-2"></div><div class="orb orb-3"></div>
  </div>

  <div id="smooth-wrapper">
    <div id="smooth-content">
      <header class="header">
        <div class="nav-container">
          <a href="/" class="brand-logo">GOATEDDD</a>
          <nav class="nav-links">
            <a href="/" class="nav-link-item">Home</a>
            <a href="/#showreel" class="nav-link-item">About</a>
            <a href="/#work" class="nav-link-item">Work</a>
            <a href="/services/" class="nav-link-item">Services</a>
            <a href="/#testimonials" class="nav-link-item">Reviews</a>
          </nav>
        </div>
      </header>

      <main class="container" style="position:relative;z-index:2;">
        <header class="feed-header">
          <span style="font-family:var(--font-jakarta);font-size:0.8rem;font-weight:700;letter-spacing:0.2em;color:var(--accent-pink);text-transform:uppercase;">KNOWLEDGE PLATFORM</span>
          <h1 class="gradient-text" style="font-family:var(--font-syne);font-size:5vw;line-height:1.1;margin-top:15px;text-transform:uppercase;">THE JOURNAL</h1>
        </header>

        <div class="feed-grid">
          ${blogFeedCards}
        </div>
      </main>

      <footer class="footer">
        <div class="footer-sand-block">
          <div class="container">
            <div class="footer-top">
              <h2 class="footer-headline">WE ARE <br><span class="font-editorial">GOATEDDD</span></h2>
              <div class="footer-action-box">
                <span class="footer-small">CLAIM THE APEX STANDARD</span>
                <a href="mailto:hello@goateddd.com" class="footer-mail-link">hello@goateddd.com</a>
              </div>
            </div>
            <div class="footer-bottom">
              <div class="footer-col">
                <span class="col-title">NAVIGATION</span>
                <a href="/" class="col-item">Home</a>
                <a href="/#showreel" class="col-item">About</a>
                <a href="/#work" class="col-item">Work</a>
              </div>
              <div class="footer-col">
                <span class="col-title">OFFICE</span>
                <p class="col-item" style="pointer-events: none;">Austin, Texas</p>
                <p style="font-size: 0.8rem; margin-top: 10px; color: rgba(12,13,18,0.5);">© 2026 GOATEDDD.</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>

  <script type="module" src="/main.js"></script>
</body>
</html>`;

  fs.writeFileSync(path.join(ROOT_DIR, 'blog', 'index.html'), blogFeedHtml, 'utf8');

  // 6. UPDATE DYNAMIC SITEMAP GENERATION PATHS
  console.log('[Content Compiler] Updating /scripts/generate-sitemap.js routes list');

  const sitemapRoutes = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/services', changefreq: 'daily', priority: '0.9' },
    { path: '/blog', changefreq: 'daily', priority: '0.9' }
  ];

  // Push all dynamic services
  services.forEach(s => {
    sitemapRoutes.push({ path: `/services/${s.slug}`, changefreq: 'weekly', priority: '0.8' });
  });

  // Push all dynamic locations
  locations.forEach(l => {
    sitemapRoutes.push({ path: `/location/${l.slug}`, changefreq: 'weekly', priority: '0.8' });
  });

  // Push all dynamic blogs
  blogs.forEach(b => {
    sitemapRoutes.push({ path: `/blog/${b.slug}`, changefreq: 'weekly', priority: '0.8' });
  });

  // Format the updated script
  const sitemapScriptContent = `import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute base domain for the production deployment
const DOMAIN = 'https://goateddd.com';

// Define core pages / routes dynamically generated by Content Compiler Engine
const routes = ${JSON.stringify(sitemapRoutes, null, 2)};

const generateSitemap = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemapXml = \`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
\`;

  routes.forEach((route) => {
    sitemapXml += \`  <url>
    <loc>\${DOMAIN}\${route.path}</loc>
    <lastmod>\${currentDate}</lastmod>
    <changefreq>\${route.changefreq}</changefreq>
    <priority>\${route.priority}</priority>
  </url>\\n\`;
  });

  sitemapXml += \`</urlset>\\n\`;

  const publicDir = path.resolve(__dirname, '../public');
  const outputPath = path.join(publicDir, 'sitemap.xml');

  try {
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(outputPath, sitemapXml, 'utf8');
    console.log(\`[Sitemap Generator] Success: Generated sitemap.xml at \${outputPath}\`);
  } catch (err) {
    console.error(\`[Sitemap Generator] Error: Failed to write sitemap.xml\`, err);
    process.exit(1);
  }
};

generateSitemap();
`;

  fs.writeFileSync(path.join(ROOT_DIR, 'scripts', 'generate-sitemap.js'), sitemapScriptContent, 'utf8');

  // Invoke Sitemap Generator
  console.log('[Content Compiler] Invoking sitemap generator script...');
  try {
    execSync('node scripts/generate-sitemap.js', { cwd: ROOT_DIR, stdio: 'inherit' });
    console.log('[Content Compiler] Compilation completed successfully with 0 errors.');
  } catch (err) {
    console.error('[Content Compiler] Critical Error: Failed running generate-sitemap.js', err);
    process.exit(1);
  }
};

compileEngine();
