# White House Bansal PG

Website for **White House Bansal PG**, a boys PG 300 m (about a 10-minute walk) from
Bennett University, Greater Noida.

**Live site:** https://whitehousebansalpg.netlify.app

## Features

- AC and Non-AC room cards with a "Get price" button that opens WhatsApp with a pre-written message
- Amenities, food (3 pure-veg meals), gallery with lightbox, location map, house rules and FAQ
- Enquiry form that sends the student's details to the owner on WhatsApp (no backend needed)
- Floating WhatsApp button
- Scroll animations (GSAP + ScrollTrigger), smooth scrolling (Lenis), animated building illustration
- Mobile-first, keyboard accessible, and respects the "reduce motion" setting
- Local SEO: `Hostel` structured data, Open Graph link previews, `robots.txt` and `sitemap.xml`

## Tech

Plain HTML, CSS and JavaScript with no build step. GSAP and Lenis load from public CDNs.

```
index.html        Page markup, icon sprite, structured data
css/style.css     Design tokens, layout, components, animations
js/main.js        Nav, menu, smooth scroll, GSAP motion, gallery lightbox, enquiry form
images/           Photos (see images/README.md for file names)
favicon.svg
netlify.toml      Netlify config (publish root, cache and security headers)
robots.txt, sitemap.xml
```

## Run locally

Open the folder with any static file server, for example:

```bash
npx http-server . -p 5173
```

Then visit http://localhost:5173. Opening `index.html` directly from disk also works,
but some browsers restrict local files.

## Update photos

Replace a file in `images/` with a new photo under the **same file name**. The list of
names and where each one appears is in [images/README.md](images/README.md).

## Deploy

Hosted on Netlify. To publish changes from this folder:

```bash
npx netlify-cli deploy --prod --dir .
```

## Contact

Manish Baisla (owner): +91 99991 47052 ·
[WhatsApp](https://wa.me/919999147052) ·
[Instagram](https://www.instagram.com/baislamanish7777/)
