# Vanuit Ambacht — Quotation template (HTML/CSS → PDF)

This package is the HTML/CSS source for the 6-page A4 quotation. It is rebuilt from the approved reference
`Offerte-OF-2026325-Bjorn-Valk-nieuw-ontwerp_5.pdf` and checked against it page by page. Text positions and
widths match within 1 px, and boxes, lines and images match within 1–2 px.

## Contents

| File | Purpose |
| --- | --- |
| `offerte.html` | The template, filled with the reference data (quotation OF-2026325) |
| `offerte.css` | All styling: tokens, typography, layout per page |
| `assets/fonts/` | Montserrat 300/400/500/600 and Playfair Display 500/600/400 italic (woff2, SIL Open Font License) |
| `assets/img/` | Logos (light/dark), brand-mark watermark, cover photos, configuration photo, photo of Tim & Bram |
| `render.js` | Renders the HTML to PDF with headless Chromium (Playwright) |
| `offerte-voorbeeld.pdf` | Output of `render.js`: what a correct build looks like |

## Rendering

```bash
npm install playwright
npx playwright install chromium   # only if Chromium is not installed yet
node render.js offerte.html offerte.pdf
```

The render settings matter:

- `printBackground: true`, `preferCSSPageSize: true` and `scale: 1`, with no browser header or footer
- Wait for `document.fonts.ready` before printing. Otherwise the PDF uses a fallback font and every
  measurement shifts.
- Load the fonts locally from `assets/fonts` (as `offerte.css` does), not from Google Fonts at render time.

Puppeteer works the same way: `page.pdf({ printBackground: true, preferCSSPageSize: true })`.

## How the layout is built

- Each `<section class="page">` is a fixed 794 × 1123 px canvas (A4 at 96 dpi) with `overflow: hidden`.
  Content never flows to the next page.
- Large blocks (headers, tiles, tables, cards, footers) are placed absolutely at the coordinates from the
  reference. Text inside a block flows normally. A longer or shorter text therefore never moves other blocks.
- Left/right margin is 68 px on every page, giving a content width of 658 px.
- Uppercase labels are plain text in the HTML, styled with `text-transform: uppercase` + `letter-spacing`.
  Never type spaces between letters.
- Do not change font sizes, line heights or letter spacing in `offerte.css`. They are measured values
  (e.g. 11.73 px, 17.25 px) and reproduce the reference exactly.

## Variable fields

Every value that comes from quotation data is marked with `data-veld="…"` in `offerte.html`:

| Field | Where |
| --- | --- |
| `klant.naam`, `klant.voornaam`, `klant.plaats` | Cover, page headers, salutation, signature card, delivery lines |
| `offerte.nummer`, `offerte.datum`, `offerte.geldig_tot` | Cover, headers, footers, validity bar, terms |
| `product.*` | Cover subline, tiles (p3), wood card, lead-time pill (p6) |
| `configuratie` | Spec groups (p3) |
| `configuratie.vooraanzicht` | Front-view diagram (p3): one `.unit` per cabinet, `.unit.egg` for the cut-out, left to right |
| `regels` | Price table rows (p4). Free items show `<span class="included">Inbegrepen</span>` instead of an amount |
| `totaal.excl`, `totaal.btw`, `totaal.incl`, `termijn.1`, `termijn.2` | Totals block and instalment cards (p4) |
| `foto.*` | Cover photos and configuration photo |

Amounts use Dutch notation: `€ 3.495,00`. VAT (21%) and the two 50% instalments are calculated from the total
incl. VAT and rounded to the cent.

Fixed copy (letter text, steps, terms, company details) stays as it is.

## Checking your build

Overlay your PDF on `offerte-voorbeeld.pdf` (or the original reference) at 100% with 50% opacity. Text and
boxes should line up within 1 px. Also test a 30-character customer name and 4 price lines: rows in the price
table have a fixed height for the reference content, so adjust `.p4 .lines tr td { height }` per row type when
descriptions get longer.

Known, accepted quirks of the reference (keep them): the formal "Uw"/"UW" on the cover and p3 eyebrow, smaller
headings on p2, and the footer centre text not being exactly centred (`space-between`). The reference PDF has a
2 px white strip at the bottom of the cover; this template does not, and that is intended.
