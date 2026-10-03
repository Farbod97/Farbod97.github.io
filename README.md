# farbodh.com

Personal portfolio of **Farbod Haeri**, a mechanical engineer focused on robotics, controls, and hardware. M.S. Mechanical Engineering student, UC San Diego.

**Live site:** [farbodh.com](https://farbodh.com)

## Highlights

- Fully-actuated fixed-tilt hexacopter (CAD → build → 6-DoF flight control)
- Automated cognitive-training system for group-housed lab mice (senior capstone)
- Machined hardware, materials metrology, and numerical-methods work

## Tech

Hand-built static site: no frameworks, no build step. Semantic HTML, one shared stylesheet, one shared script.

- Responsive from small phones to 4K TVs (rem-based device tiers)
- Dark/light theme (system-aware, persisted toggle)
- WebP images with JPEG fallback, lazy loading, and real image dimensions so nothing shifts while photos load
- Fast first paint: a self-hosted display font, the system font for body text, and slideshow photos that load after the page
- Smooth motion: animations use only transform and opacity, and buttons respond the moment they're pressed
- Accessible: keyboard-navigable lightbox, skip links, reduced-motion support
- Open Graph / Twitter cards, JSON-LD structured data, sitemap

Hosted on GitHub Pages.
