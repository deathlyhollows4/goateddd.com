# GOATEDDD Studio - Production Security Directives & Headers Configuration

This document serves as a reference guide and architectural overview of the production security directives implemented across GOATEDDD's interactive web platform.

---

## 1. Core Security Headers Overview

To achieve a 100/100 performance and top-tier security rating (e.g., A+ on Mozilla Observatory / securityheaders.com), the following HTTP headers are configured for all web responses:

| Security Header | Directive / Value | Purpose |
| :--- | :--- | :--- |
| **`Content-Security-Policy` (CSP)** | `default-src 'self'; ...` | Prevents XSS, data injections, and malicious scripting. |
| **`Strict-Transport-Security` (HSTS)** | `max-age=63072000; includeSubDomains; preload` | Enforces absolute HTTPS transport for the root domain and subdomains. |
| **`X-Frame-Options`** | `DENY` | Mitigates Clickjacking attacks by forbidding page embedding in `<iframe>` tags. |
| **`X-Content-Type-Options`** | `nosniff` | Disables MIME-type sniffing to prevent executing unauthorized content. |
| **`Referrer-Policy`** | `strict-origin-when-cross-origin` | Protects sensitive user data by restricting referrer leakages across origins. |
| **`Permissions-Policy`** | `camera=(), microphone=(), ...` | Restricts browser-level feature accesses to only necessary sandbox scopes. |

---

## 2. Platform-Specific Configurations

For seamless multi-cloud production deployment orchestration, the platform incorporates three auto-detected environment configurations:

### A. Netlify Configuration (`netlify.toml`)
Netlify uses the `netlify.toml` file located in the root. The build publish folder is set to `dist`, and specific `[[headers]]` blocks apply security headers and long-term immutable caching (`max-age=31536000`) for Vite's cache-busted `/assets/*` bundle directories.

### B. Vercel Configuration (`vercel.json`)
Vercel is configured via the `vercel.json` file in the root. It contains matching routing header rules mapped perfectly to Vercel's Edge Server specs.

### C. Cloudflare Pages (`public/_headers`)
Cloudflare reads the `_headers` file directly inside the static public directory during deployment. This file configures the exact same headers at Cloudflare's Edge locations.

---

## 3. Strict Content Security Policy (CSP) Breakdown

The CSP directive ensures third-party scripts/materials cannot compromise site integrity while retaining active support for GSAP animation dependencies, Google Web Fonts, and Vimeo video systems.

```http
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline' https://player.vimeo.com; 
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
  font-src 'self' https://fonts.gstatic.com; 
  img-src 'self' data: https://goateddd.com; 
  media-src 'self' https://player.vimeo.com; 
  connect-src 'self'; 
  frame-src 'self' https://player.vimeo.com; 
  object-src 'none'; 
  base-uri 'self'; 
  form-action 'self';
```

- **`default-src 'self'`**: Sets a secure fallback to only allow requests from the same domain.
- **`script-src` / `frame-src`**: Restricts scripts and frames to self and Vimeo (for interactive loop showcases).
- **`style-src` / `font-src`**: Securely links standard styling and Google Web Fonts.
- **`object-src 'none'`**: Disables outdated, highly vulnerable browser elements (Flash, Java plugins, etc.).

---

## 4. Verification & Continuous Validation

To audit that the security policies remain uncompromised:
1. Deploy to preview environments (Vercel, Netlify, or Cloudflare Pages).
2. Scan the URL using [Web Observatory](https://observatory.mozilla.org/) or [Security Headers](https://securityheaders.com/).
3. Audit browser console warnings for any CSP constraint violations during dynamic JS execution.
