# The Canonical On-Page SEO Checklist (80+ Items)
### Engineered for Premium High-Performance B2B Design & Development Studios

This checklist is the ultimate reference standard for deploying websites that rank, load instantly, and command authority. Every client site we ship must fulfill these requirements before production release.

---

## Part 1: Technical Foundations & Crawling (10 Items)

*   [ ] **1. Canonical Robots.txt:** Ensure `/robots.txt` is present at the root, properly pointing to the XML sitemap index.
*   [ ] **2. Clean XML Sitemap:** The sitemap must be dynamically generated, containing *only* HTTP 200 URLs. No redirects, 404s, or canonicalized pages.
*   [ ] **3. Noindex Tag Audit:** Scan all production pages to confirm that no `<meta name="robots" content="noindex">` tags remain from the staging or development phase.
*   [ ] **4. Crawl Budget Efficiency:** Minimize HTML output size to under 100KB to ensure rapid parsing and high crawl frequency.
*   [ ] **5. HTTPS Enforced:** Ensure all HTTP traffic is redirected to HTTPS (TLS 1.3) at the edge, with HSTS headers active.
*   [ ] **6. Strict Canonical Tags:** Every indexable page must contain a self-referencing canonical URL (`<link rel="canonical" href="https://...">`) to prevent duplicate content indexation.
*   [ ] **7. Status Code Cleanliness:** No broken internal links (4xx or 5xx codes). All links must resolve directly to target content (0 chains of 301/302 redirects).
*   [ ] **8. 404 Page UX & Indexation:** Re-route broken links to a custom, high-converting 404 page that is served with an actual HTTP 404 response header (not a 200 OK soft 404).
*   [ ] **9. Server Response Times (TTFB):** Maintain server-side TTFB below 100ms globally by utilising edge-caching or static distribution networks.
*   [ ] **10. Strict Security Headers:** Verify CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy headers to secure search crawlers' trust.

---

## Part 2: URL & Site Architecture (10 Items)

*   [ ] **11. Clean URL Slug:** Slugs must be short, entirely lowercase, and contain no spaces, underscores, or special characters. Use hyphens (`-`) exclusively.
*   [ ] **12. Keyword-Rich URLs:** The primary target keyword must be placed directly in the page slug (e.g., `/services/woocommerce-development` instead of `/services/page-id-4921`).
*   [ ] **13. Shallow URL Depth:** Keep page slugs as close to the root domain as possible (e.g., `/fayetteville-seo` instead of `/locations/usa/arkansas/northwest/fayetteville/seo`).
*   [ ] **14. Breadcrumb Navigation:** Implement semantic breadcrumbs on nested pages to define logical parent-child hierarchies for search bots.
*   [ ] **15. High-Value Internal Links:** Link from high-authority pages (like the Home or Case Studies pages) directly to target service pages using exact or partial-match anchor text.
*   [ ] **16. Silo Architecture:** Group related content in tight thematic silos (e.g., all WooCommerce content links to the main WooCommerce service page, but not to unrelated local pages).
*   [ ] **17. Nofollow External Links:** Apply `rel="nofollow noopener noreferrer"` to untrusted external links or user-generated links.
*   [ ] **18. Contextual Anchor Text:** Never use generic anchor text like "click here" or "learn more." Always use descriptive, keyword-rich labels.
*   [ ] **19. Dynamic Orphan Page Check:** Ensure every indexable page has at least three internal inbound links from other relevant pages.
*   [ ] **20. Permanent Redirect Hygiene:** Ensure old paths are permanently redirected using clean 301 status codes, avoiding temporary 302s.

---

## Part 3: Meta Tags & Above-the-Fold Optimization (10 Items)

*   [ ] **21. Core Keyword Title Tag:** Place the primary keyword at the very beginning of the `<title>` tag (e.g., `Web Design Little Rock | Goateddd`).
*   [ ] **22. Title Tag Length:** Keep the title tag length strictly between 50 and 60 characters (or under 580 pixels) to avoid truncation in SERPs.
*   [ ] **23. High-CTR Meta Description:** Write a compelling meta description containing the target keyword and a strong call-to-action (CTA).
*   [ ] **24. Meta Description Length:** Keep meta descriptions between 120 and 155 characters (or under 990 pixels) to maintain mobile layout integrity.
*   [ ] **25. Single H1 Element:** Ensure there is exactly *one* `<h1>` tag on the page. It must function as the primary semantic headline.
*   [ ] **26. H1 Keyword Alignment:** The `<h1>` tag must contain the primary keyword or a close variation, aligning with the page's title tag.
*   [ ] **27. Subheading Hierarchy:** Use `<h2>`, `<h3>`, and `<h4>` tags sequentially for hierarchical section dividers. Never skip levels (e.g., do not jump from an `<h2>` directly to an `<h4>`).
*   [ ] **28. Schema Markup Alignment:** Ensure `<title>` and `<h1>` values are congruent with the structured schema data definitions.
*   [ ] **29. Open Graph Title:** Define `og:title` with a highly clickable, social-optimized headline.
*   [ ] **30. Open Graph Image:** Provide a bespoke, high-resolution OG image (`og:image`) sized at exactly 1200x630 pixels.

---

## Part 4: Semantic Content & Copywriting (15 Items)

*   [ ] **31. The First 100 Words:** Introduce the primary target keyword naturally within the first 100 words of the body copy.
*   [ ] **32. Natural LSI Keyword Density:** Weave in secondary Latent Semantic Indexing (LSI) terms throughout the content to provide topical breadth.
*   [ ] **33. Search Intent Match:** The copy must precisely target the visitor's intent (Commercial for landing pages, Informational for blog articles).
*   [ ] **34. Elimination of Fluff:** Audit copy against the brand voice; delete marketing jargon (like *lock*, *leverage*, *seamless*, *cutting-edge*).
*   [ ] **35. Short, Punchy Sentences:** Break up paragraphs. No sentence should exceed 16 words.
*   [ ] **36. Clear Call to Action (CTA):** Include at least two clear, high-intent call-to-action sections with unique button element IDs.
*   [ ] **37. Typographic Readability:** Set line height to at least 1.6 and font size to a minimum of 16px to prevent mobile accessibility bounce.
*   [ ] **38. Formatting Variety:** Use bullet lists, tables, bold text, and blockquotes to make the page highly scannable.
*   [ ] **39. Up-to-Date Content:** Reference the current year (`2026` or dynamic script) to verify fresh relevance to users and bots.
*   [ ] **40. Author E-E-A-T Schema:** For blog content, include a real author bio block with links to social/professional profiles.
*   [ ] **41. Contextual Synonyms:** Use diverse synonyms of the primary keyword to prevent keyword stuffing penalties.
*   [ ] **42. Table of Contents:** On articles exceeding 1,500 words, embed a functional Table of Contents using anchor links (`#section-id`).
*   [ ] **43. External Reference Quality:** Link outbound to at least two highly authoritative, non-competing external resources (e.g., W3C, Google Developers).
*   [ ] **44. Local Entity Names:** On local landing pages, explicitly mention surrounding landmarks, neighborhoods, and neighboring cities to anchor local relevance.
*   [ ] **45. Dynamic Content Freshness:** Ensure review blocks or case study logs pull recent dates dynamically.

---

## Part 5: Core Web Vitals & Asset Optimization (10 Items)

*   [ ] **46. Image Modern Formats:** Convert all static raster images to WebP or AVIF formats. Never deploy raw PNGs or JPEGs to production.
*   [ ] **47. Image Compression:** Run every single asset through lossless/lossy compression utilities to keep image files under 100KB.
*   [ ] **48. Explicit Width & Height:** Every `<img>` tag must have explicit `width` and `height` attributes to prevent Cumulative Layout Shift (CLS).
*   [ ] **49. Descriptive Alt Text:** Write accurate, descriptive `alt` tags containing primary or secondary keywords without keyword stuffing.
*   [ ] **50. Native Lazy Loading:** Apply `loading="lazy"` to all images below the fold to save bandwidth and prioritize LCP assets.
*   [ ] **51. Preload LCP Images:** Add `<link rel="preload" as="image" href="...">` for critical above-the-fold hero images or logo graphics.
*   [ ] **52. SVG Inline Optimization:** Clean inline SVGs by removing unnecessary XML namespaces, editor metadata, and hidden paths.
*   [ ] **53. Responsive Images:** Use `<picture>` or `srcset` tags for complex banners to serve optimized resolutions to mobile screens.
*   [ ] **54. Font Subsetting & Local Hosting:** Host fonts locally in `.woff2` format, subsetting characters to only what is actively used on the site.
*   [ ] **55. CSS Font Display:** Use `font-display: swap` in all `@font-face` declarations to prevent invisible text during font downloads.

---

## Part 6: Elite Code & DOM Performance (10 Items)

*   [ ] **56. Zero Render-Blocking CSS:** Inline critical styling rules directly into the HTML `<head>` and load secondary stylesheets asynchronously.
*   [ ] **57. Defer & Async JS:** Mark all non-essential scripts with `defer` or `async` tags to prevent main thread blocking during parsing.
*   [ ] **58. Minified Bundles:** Ensure the build script minifies, uglifies, and treeshakes CSS and JavaScript payloads.
*   [ ] **59. Inline JS Removal:** Move custom inline scripting blocks to external modular files that benefit from CDN cache headers.
*   [ ] **60. CSS Layout Over Page Builders:** Rely entirely on CSS Flexbox and Grid layouts. Eliminate page-builder wrappers and third-party UI frameworks.
*   [ ] **61. DOM Node Count:** Maintain a total DOM node count of less than 600 nodes, with a maximum depth of 32 nested tags.
*   [ ] **62. Zero Unused CSS/JS:** Run unused asset compilation audits to purge utility style rules not actively rendered on the page.
*   [ ] **63. Vanilla JavaScript Controls:** Replace complex third-party library components (e.g., sliders, tabs) with native, lightweight ES6 JS.
*   [ ] **64. Semantic HTML5 Elements:** Build structures using `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, and `<footer>` tags.
*   [ ] **65. Layout Instability Check:** Run layouts through performance profilers to ensure zero micro-shifts during interactive events.

---

## Part 7: Rich Schema & Structured Data (10 Items)

*   [ ] **66. LocalBusiness Schema:** Include customized JSON-LD schema with exact NAP (Name, Address, Phone) matching Google Business Profile.
*   [ ] **67. Organization Schema:** Deploy primary Organization structured data on the homepage, defining brand name, social handles, and logo assets.
*   [ ] **68. WebSite Schema:** Map search query parameters using the `potentialAction` property to support search boxes within Google SERPs.
*   [ ] **69. Article Schema:** On blog posts, include detailed Article schema detailing publishing dates, publisher organization, and modified timestamps.
*   [ ] **70. FAQ Schema:** Implement FAQ schema on service pages containing structured Q&A data to secure large, rich-snippet search listings.
*   [ ] **71. Review/Rating Schema:** Integrate schema showing customer review scores to display rich gold-star ratings in search results.
*   [ ] **72. BreadcrumbList Schema:** Map breadcrumb navigations directly into structured lists to help search bots understand exact directory paths.
*   [ ] **73. Schema Validation Cleanliness:** Test and validate all pages using the official Google Rich Results Test tool to confirm 0 errors or warnings.
*   [ ] **74. SameAs Same-Entity Mapping:** Map the `sameAs` array in organization/local business schemas to verify matching social profiles and directories.
*   [ ] **75. Service & Product Schemas:** Include detailed service descriptors on commercial pages to feed search bot intent engines.

---

## Part 8: Local UX & Conversion (10 Items)

*   [ ] **76. Flawless Responsive Breakpoints:** Verify responsive design from 320px screens up to 4K desktop setups.
*   [ ] **77. Accessible Touch Targets:** Tap targets (buttons, links, form inputs) must be at least 48x48 pixels in size, with adequate spacing.
*   [ ] **78. High Contrast Ratios:** Text must maintain a minimum contrast ratio of 4.5:1 against its background to pass WCAG 2.1 AA standards.
*   [ ] **79. Click-to-Call Integrations:** Wire up all telephone displays using semantic `tel:` links (`<a href="tel:+15555555555">`).
*   [ ] **80. Google Map Embed Optimization:** Replace heavy iframe map embeddings with optimized placeholder images that load the interactive map on-click.
*   [ ] **81. Secure Forms with Spam Checks:** Protect forms using lightweight, frontend-friendly spam honeypot elements rather than heavy, user-obstructive captchas.
*   [ ] **82. WCAG Screen Reader Audit:** Verify page structure using WAVE or AXE accessibility auditing tools to ensure proper ARIA labels and screen reader roles.
*   [ ] **83. Cross-Browser Consistency:** Test layouts on Safari iOS, Chrome Android, Chrome Desktop, Firefox, and Safari Desktop to ensure visual perfection.
*   [ ] **84. Immediate Interaction (INP):** Ensure all buttons trigger a direct, instantaneous visual response upon tapping.
*   [ ] **85. Auto-Filling Inputs:** Enable appropriate browser autocomplete tags (`autocomplete="email"`, `name="tel"`) on contact form inputs to maximize user conversion speeds.
