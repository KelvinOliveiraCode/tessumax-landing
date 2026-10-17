# Tessumax — Landing Page

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

Single-page static institutional landing page for Tessumax — a technology company that delivers websites, custom systems, apps, advertising videos, and digital marketing with a clear process, proprietary code, and verifiable results, from brief to launch.

## Problem / Why it exists

Companies need a digital presence, but often find providers who disappear mid-project, deliver generic templates, do not document what was done, and hold the code hostage. The client does not know what stage the project is at, receives deadline surprises, and cannot maintain what was delivered.

Tessumax exists to be a single partner from design to release: honest quote before any line of code, regular updates during construction, code in the client's repository with history and minimal documentation so another developer can continue without having to ask.

## What it does

The page presents Tessumax's work in eight sections:

- Four delivery fronts — Websites, Systems, Apps, and Video & Marketing — each with its deliverables, typical timelines, and stack used (for example, websites in HTML5, CSS, JavaScript, Tailwind, and Vite; systems in Java, Spring Boot, Python, PostgreSQL, MySQL, and Docker; apps in React Native with Expo and TypeScript).
- Two published and verifiable products — Garimpo (curation of 131 Shopee offers, 100% in the browser, no backend) and KODAROS (platform with 8 e-books and diagnostic funnel) — both with direct links to the live version and the repository.
- Collection of 17 website templates by niche — medical clinic, gym, law firm, fashion e-commerce, EAD courses, real estate, aesthetics, SaaS, restaurant, finance, wedding, dentistry, digital marketing, solar energy, civil construction, travel, and crypto/web3 — each openable in the browser with a direct link.
- Technology stack with filter by area — frontend, backend, mobile, desktop, data, infrastructure, video, AI, and marketing — with a notice that the list varies by project.
- Three-stage process — Scope, Construction, and Delivery — with what the client receives at each stage.
- Serverless brief form: browser validation, message assembly, and sending via WhatsApp or email; nothing leaves the browser until the user sends.

## Stack

From the site itself:

- HTML5 and CSS3 in a single file (assets/css/main.css), with layout primitives in the @layer od-layout layer.
- Dependency-free vanilla JavaScript (assets/js/main.js): theme, preloader, tabs, filters, horizontal rails, form, reveal on scroll, and particle canvas in the hero.
- Self-hosted Arquivo and JetBrains Mono fonts (woff2, preloaded).
- Two themes, Ink (dark) and Paper (light), with system preference detection and localStorage persistence.

Technologies listed on the page for client deliveries (not a closed list; varies by scope): Python, JavaScript, TypeScript, Java, Rust, React, Node.js, Docker, PostgreSQL, MySQL, Spring Boot, Tailwind CSS, Git, Tauri, Vite, Linux, Expo, Ruby, Next.js, Astro, GSAP, Three.js, p5.js, Lottie, Framer Motion, Remotion, HyperFrames, FFmpeg, Whisper, Gemini, Supabase, Stripe, npm, Playwright, Puppeteer, OpenCV, Tesseract OCR, Cloudflare, Figma, Search Console, Google Business Profile, DataForSEO, and OpenSEO.

The provenance of fonts, logos, icons, and screenshots is documented in assets/SOURCES.txt.

## How it works

1. Open index.html in the browser. There is no build step, server, or installation dependencies.
2. Navigation uses section anchors (#frentes, #processo, #produtos, #exemplos, #stack, #sobre, #depoimentos, #faq, #contato) and a drawer menu on small screens.
3. JavaScript initializes isolated modules: theme switching without screen flash, preloader tied to font and document loading, reveal on scroll, accessible tabs, stack filter, draggable horizontal rails, brief form validation, and animations using only transform and opacity.
4. The site respects prefers-reduced-motion: with reduced motion, reveals appear immediately, the preloader is skipped, and animations are turned off.
5. The brief form has no server: on send, it assembles the message with the filled data and opens the WhatsApp conversation (or copies the summary to the clipboard).

## How to run

Clone the repository:

git clone https://github.com/KelvinOliveiraCode/tessumax-landing.git
cd tessumax-landing

Open the page:

- double-click on index.html, or
- serve the folder with any static server, for example python -m http.server 8000, and access http://localhost:8000.

Does not require Node.js, npm, build tools, or cloud account. The page is published at https://kelvinoliveiracode.github.io/tessumax-landing/.

## Project structure

tessumax-landing/
├── index.html                 # single page: HTML, layout primitives in embedded CSS and inline theme script
├── logo-Tessumax.svg          # favicon
├── README.md
└── assets/
    ├── css/main.css           # product styles
    ├── js/main.js             # dependency-free runtime
    ├── fonts/                 # Arquivo and JetBrains Mono (woff2 and fonts.css)
    ├── logos/                 # technology brand SVGs
    ├── icons/                 # social media icons
    ├── screens/               # 17 800x800 px screenshots of niche templates
    ├── logo-tessumax.svg
    ├── banner-tessumax-arte.svg
    ├── apple-touch-icon.png
    ├── og-image.png
    └── SOURCES.txt            # provenance of fonts, logos, icons, and screenshots

## Trade-offs and decisions

- Static single page without build: immediate deploy on GitHub Pages, fast loading, zero tool dependencies; downside: content and markup mixed in a single long HTML.
- CSS split into the @layer od-layout layer (structure: display, flex, grid, ratio, clipping) and product CSS outside the layer, which always wins: separates concerns and avoids unexpected specificity.
- Theme script run inline before first paint: avoids incorrect theme flash on load; cost of critical style in HTML.
- Preloader with minimum duration tied to font and document loading; disabled with prefers-reduced-motion or on repeat visits.
- Hero particle canvas uses only transform/opacity, stops when it leaves the viewport and on visibilitychange to save battery.
- No backend: the brief is assembled on the client and sent via the user's WhatsApp or email. Advantage: zero server infrastructure and nothing leaves the browser without user action; downside: no automatic receipt or message storage.
- Self-hosted fonts with preload: full control and no external font requests; cost of binary files in the repository.
- Third-party logos rendered in monochrome by CSS (.logo-img); brands belong to their respective owners.
- Testimonials are fictional example texts, as noted in the HTML itself, to be replaced with real statements before publishing.

## Known limitations

- No build scripts, automated tests, or continuous integration in the landing page repository.
- The brief form does not store or automatically forward messages; depends on the user's WhatsApp or email.
- Testimonials are fictional examples and need to be replaced with real statements before publishing.
- No backend or CMS: any content change requires editing the files directly.
- The collection templates are pages without client visual identity, used only to demonstrate technical capability; they are not ready-to-use websites for a real company.
- With JavaScript disabled, the default theme is dark and reveals remain visible; the rest of the interactivity does not work.

## License

MIT

## Author

Kelvin Oliveira — github.com/KelvinOliveiraCode
