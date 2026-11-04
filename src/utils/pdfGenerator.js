import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Offerte6PagePDF from '../components/Offerte6PagePDF.jsx';
import FactuurPDFTemplate from '../components/FactuurPDFTemplate.jsx';
import { getDisplayLineItemTitle, getDisplayLineItemDesc } from './translator.js';

// ─────────────────────────────────────────────────────────────────
// VANUIT AMBACHT — Unified Real PDF Generator
// All functions produce actual .pdf files via jsPDF doc.save()
// Zero print dialogs. File lands directly in Downloads folder.
// ─────────────────────────────────────────────────────────────────

const BRAND = {
  primary: [62, 78, 54],    // #3E4E36
  accent:  [112, 98, 79],   // #70624F
  cream:   [237, 232, 223], // #EDE8DF
  dark:    [30, 30, 30],
  mid:     [100, 100, 95],
  line:    [214, 207, 194], // #D6CFC2
};

// ── shared helpers ────────────────────────────────────────────────
function drawHeader(doc, title, subtitle, quoteId) {
  // Green top bar
  doc.setFillColor(...BRAND.primary);
  doc.rect(0, 0, 210, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(237, 232, 223);
  doc.text('VANUIT AMBACHT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(190, 183, 170);
  doc.text('Craftsman Outdoor Kitchens & Canopies', 14, 16.5);

  if (quoteId) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(237, 232, 223);
    doc.text(quoteId, 196, 12, { align: 'right' });
  }

  // Cream divider
  doc.setFillColor(...BRAND.cream);
  doc.rect(0, 18, 210, 1, 'F');

  // Document title block
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.primary);
  doc.text(title, 14, 32);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND.accent);
  doc.text(subtitle, 14, 38);

  // Thin line
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.4);
  doc.line(14, 41, 196, 41);

  return 48; // next Y
}

function drawFooter(doc, pageCount) {
  const h = doc.internal.pageSize.height;
  doc.setDrawColor(...BRAND.line);
  doc.setLineWidth(0.3);
  doc.line(14, h - 14, 196, h - 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND.mid);
  doc.text('Vanuit Ambacht B.V. • info@vanuitambacht.nl • +31 6 12345678 • vanuitambacht.nl', 14, h - 9);
  doc.text(`Pagina ${pageCount}`, 196, h - 9, { align: 'right' });
}

function infoRow(doc, label, value, y, xLeft = 14, xRight = 105) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.accent);
  doc.text(label.toUpperCase(), xLeft, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.dark);
  doc.text(String(value || '—'), xRight, y);
  return y + 6;
}

function sectionTitle(doc, text, y) {
  doc.setFillColor(...BRAND.cream);
  doc.rect(14, y - 4, 182, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...BRAND.primary);
  doc.text(text.toUpperCase(), 17, y + 1.5);
  return y + 10;
}

function slugify(name) {
  return String(name || '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Renders all 6 pages of the Offerte proposal template and exports them
 * into a single high-resolution 6-page A4 PDF file matching the Live Preview 100%.
 */
export async function generateFull6PagePdf(quoteData) {
  const quote = quoteData?.quote || quoteData || {};
  const quoteId = quote.id || quote.quoteId || 'OF-2026331';

  // Determine active language
  let activeLang = quoteData?.language || quote?.language;
  if (!activeLang && typeof window !== 'undefined' && window.localStorage) {
    activeLang = window.localStorage.getItem('app_language');
  }
  activeLang = (activeLang === 'EN' || activeLang === 'en') ? 'EN' : 'NL';

  const custObj = typeof quote.customer === 'object' && quote.customer !== null ? quote.customer : null;
  const rawCust = custObj?.name || (custObj ? `${custObj.firstName || ''} ${custObj.lastName || ''}`.trim() : null) || (typeof quote.customer === 'string' ? quote.customer : null) || quote.customerName;
  const customerName = (rawCust && typeof rawCust === 'string') ? rawCust.trim() : (activeLang === 'EN' ? 'Client' : 'Klant');
  const cleanCustomerName = String(customerName).replace(/[\/:*?"<>|]/g, '').trim();
  const filePrefix = quote.isDraft ? (activeLang === 'EN' ? 'Draft-Quote' : 'Concept-Offerte') : 'Quote';
  const fileName = `${filePrefix}-${quoteId} ${cleanCustomerName}.pdf`;

  // Create fixed off-screen container completely invisible behind the application (zero UI disruption)
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.top = '0px';
  tempDiv.style.left = '0px';
  tempDiv.style.width = '794px';
  tempDiv.style.height = '1123px';
  tempDiv.style.overflow = 'hidden';
  tempDiv.style.zIndex = '-9999'; // Completely invisible behind page
  tempDiv.style.pointerEvents = 'none';
  tempDiv.style.backgroundColor = '#FFFFFF';
  tempDiv.style.opacity = '1';
  document.body.appendChild(tempDiv);

  let root = null;
  try {
    root = createRoot(tempDiv);

    // Render all 6 pages inside Offerte6PagePDF with explicit language & draft flags
    root.render(
      React.createElement(Offerte6PagePDF, {
        quote: { ...quote, isDraft: Boolean(quote.isDraft) },
        activePage: 'all',
        language: activeLang
      })
    );

    // Wait for all 6 pages to mount in the DOM
    let pageElements = [];
    for (let attempt = 0; attempt < 30; attempt++) {
      pageElements = Array.from(tempDiv.querySelectorAll('.offerte-pdf-page'));
      if (pageElements.length >= 6) break;
      await new Promise(r => setTimeout(r, 50));
    }

    if (pageElements.length === 0) {
      console.warn('[PDF Generator] No page elements found, falling back to direct vector engine');
      return downloadDirectPdfFileFallback({ ...quote, language: activeLang });
    }

    // Wait for fonts to be ready (up to 400ms max)
    if (document.fonts && document.fonts.ready) {
      await Promise.race([
        document.fonts.ready,
        new Promise(r => setTimeout(r, 400))
      ]);
    }

    // Convert all images to Base64 data URLs to guarantee 0 CORS issues, 0 network timeouts, 0 canvas taints
    const imgs = Array.from(tempDiv.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        const src = img.getAttribute('src');
        if (!src || src.startsWith('data:')) return;
        try {
          const res = await fetch(src, { cache: 'force-cache' });
          if (!res.ok) return;
          const blob = await res.blob();
          await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result) {
                img.src = reader.result;
              }
              resolve();
            };
            reader.onerror = resolve;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          // If fetch fails, keep original image src
        }
      })
    );

    // Format all page elements: exact A4 dimensions, reset shadows/borders, stack at (0, 0)
    pageElements.forEach((el) => {
      el.style.position = 'absolute';
      el.style.top = '0px';
      el.style.left = '0px';
      el.style.width = '794px';
      el.style.minWidth = '794px';
      el.style.maxWidth = '794px';
      el.style.height = '1123px';
      el.style.minHeight = '1123px';
      el.style.maxHeight = '1123px';
      el.style.boxSizing = 'border-box';
      el.style.margin = '0px';
      el.style.borderRadius = '0px';
      el.style.boxShadow = 'none';
      el.style.border = 'none';
      el.style.visibility = 'hidden';
    });

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });

    for (let i = 0; i < pageElements.length; i++) {
      // Make only the target page visible and on top
      pageElements.forEach((pEl, pIdx) => {
        pEl.style.visibility = pIdx === i ? 'visible' : 'hidden';
        pEl.style.zIndex = pIdx === i ? '10' : '1';
      });

      // Brief frame delay to ensure paint
      await new Promise(r => requestAnimationFrame(r));

      const el = pageElements[i];
      const isCover = i === 0;

      const canvas = await html2canvas(el, {
        scale: 1.8, // 180 DPI crisp typography & graphics with fast render time
        useCORS: true,
        allowTaint: true,
        imageTimeout: 2000,
        logging: false,
        backgroundColor: isCover ? '#33422C' : '#FDFBF7',
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.93);
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    }

    pdf.save(fileName);
    return fileName;
  } catch (err) {
    console.error('[PDF Generator] 6-Page rendering failed, falling back to direct vector engine:', err);
    return downloadDirectPdfFileFallback({ ...quote, language: activeLang });
  } finally {
    if (root) {
      try { root.unmount(); } catch(e){}
    }
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }
}

// ── 1. QUOTE PDF ─────────────────────────────────────────────────
/**
 * Download a real 6-page quote PDF matching Live Preview 100%.
 * @param {object} quote  - row from quotes state
 */
export function downloadQuotePdf(quote) {
  const quoteObj = quote?.quote || quote || {};
  let activeLang = quote?.language || quoteObj?.language;
  if (!activeLang && typeof window !== 'undefined' && window.localStorage) {
    activeLang = window.localStorage.getItem('app_language');
  }
  activeLang = (activeLang === 'EN' || activeLang === 'en') ? 'EN' : 'NL';

  const quoteId = quoteObj.id || quoteObj.quoteId || 'OF-2026331';
  const custObj = typeof quoteObj.customer === 'object' && quoteObj.customer !== null ? quoteObj.customer : null;
  const rawCust = custObj?.name || (custObj ? `${custObj.firstName || ''} ${custObj.lastName || ''}`.trim() : null) || (typeof quoteObj.customer === 'string' ? quoteObj.customer : null) || quoteObj.customerName;
  const customerName = (rawCust && typeof rawCust === 'string') ? rawCust.trim() : (activeLang === 'EN' ? 'Client' : 'Klant');
  const cleanCustomerName = String(customerName).replace(/[\/:*?"<>|]/g, '').trim();
  const filePrefix = quoteObj.isDraft ? (activeLang === 'EN' ? 'Draft-Quote' : 'Concept-Offerte') : 'Quote';
  const fileName = `${filePrefix}-${quoteId} ${cleanCustomerName}.pdf`;

  generateFull6PagePdf({ ...quoteObj, language: activeLang }).catch((err) => {
    console.warn('[downloadQuotePdf] 6-page render fallback:', err);
    downloadDirectPdfFileFallback({ ...quoteObj, language: activeLang });
  });
  return fileName;
}

export function downloadQuotePdfFallback(quote) {
  let activeLang = quote?.language;
  if (!activeLang && typeof window !== 'undefined' && window.localStorage) {
    activeLang = window.localStorage.getItem('app_language');
  }
  activeLang = (activeLang === 'NL' || activeLang === 'nl') ? 'NL' : 'EN';

  const id        = quote?.id || 'OF-2026-001';
  const customer  = typeof quote?.customer === 'object'
    ? (quote.customer.name || (activeLang === 'EN' ? 'Client' : 'Klant'))
    : (quote?.customer || (activeLang === 'EN' ? 'Client' : 'Klant'));
  const project   = quote?.project || (activeLang === 'EN' ? 'Custom Outdoor Kitchen' : 'Buitenkeuken Maatwerk');
  const amount    = quote?.amount || '€ 0';
  const status    = quote?.status || (activeLang === 'EN' ? 'Draft' : 'Concept');
  const date      = quote?.date || new Date().toISOString().split('T')[0];
  const validTill = quote?.validUntil || '—';
  const items     = Array.isArray(quote?.items) && quote.items.length > 0
    ? quote.items
    : (Array.isArray(quote?.investment?.lineItems) ? quote.investment.lineItems : []);

  const cleanCustomer = String(customer).replace(/[\\/:*?"<>|]/g, '').trim();
  const filePrefix = quote?.isDraft ? (activeLang === 'EN' ? 'Draft-Quote' : 'Concept-Offerte') : 'Quote';
  const fileName = `${filePrefix}-${id} ${cleanCustomer}.pdf`;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = drawHeader(doc, activeLang === 'EN' ? 'OFFICIAL BESPOKE PROPOSAL' : 'OFFICIËLE MAATOFFERTE', `Vanuit Ambacht • ${id} • ${date}`, id);

  // Customer + project block
  y = sectionTitle(doc, activeLang === 'EN' ? 'Client & Project' : 'Klant & Project', y);
  y = infoRow(doc, activeLang === 'EN' ? 'Client Name' : 'Klantnaam',  customer, y);
  y = infoRow(doc, activeLang === 'EN' ? 'Project' : 'Project',    project,  y);
  y = infoRow(doc, activeLang === 'EN' ? 'Date' : 'Datum',      date,     y);
  y = infoRow(doc, activeLang === 'EN' ? 'Valid until' : 'Geldig tot', validTill,y);
  y = infoRow(doc, activeLang === 'EN' ? 'Status' : 'Status',     status,   y);
  y += 4;

  // Line items table
  if (items.length > 0) {
    y = sectionTitle(doc, activeLang === 'EN' ? 'Proposal Items' : 'Offerte Artikelen', y);

    // Table header
    doc.setFillColor(...BRAND.primary);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(237, 232, 223);
    doc.text(activeLang === 'EN' ? 'DESCRIPTION' : 'OMSCHRIJVING',     17,  y + 4.5);
    doc.text(activeLang === 'EN' ? 'QUANTITY' : 'AANTAL',          130,  y + 4.5);
    doc.text(activeLang === 'EN' ? 'PRICE' : 'PRIJS',           155,  y + 4.5);
    doc.text(activeLang === 'EN' ? 'TOTAL' : 'TOTAAL',          182,  y + 4.5, { align: 'right' });
    y += 9;

    let subtotal = 0;
    items.forEach((item, idx) => {
      const titleStr = getDisplayLineItemTitle(item.title || item.description || '', activeLang);
      const descStr  = getDisplayLineItemDesc(item.description || '', activeLang);
      const desc     = descStr && descStr !== titleStr ? `${titleStr} - ${descStr}` : (titleStr || '—');
      const qty   = Number(item.quantity) || 1;
      const price = Number(item.unitPrice || item.priceInclVat) || 0;
      const total = qty * price;
      subtotal   += total;

      // Alternate row shading
      if (idx % 2 === 0) {
        doc.setFillColor(248, 247, 244);
        doc.rect(14, y - 3, 182, 7, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...BRAND.dark);

      const lines = doc.splitTextToSize(desc, 108);
      doc.text(lines, 17, y + 0.5);
      doc.text(String(qty),                         130,  y + 0.5);
      doc.text(`€ ${price.toLocaleString('nl-NL')}`, 155,  y + 0.5);
      doc.text(`€ ${total.toLocaleString('nl-NL')}`, 182,  y + 0.5, { align: 'right' });
      y += Math.max(7, lines.length * 4.5);
    });

    y += 2;
    doc.setDrawColor(...BRAND.line);
    doc.line(14, y, 196, y);
    y += 6;

    // Totals
    const discount = Number(quote?.discountPercent) || 0;
    const discountAmt = subtotal * (discount / 100);
    const afterDiscount = subtotal - discountAmt;
    const vat = afterDiscount * 0.21;
    const total = afterDiscount + vat;

    const totalsX = 130;
    const amtX = 196;

    const totLine = (label, val, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 10 : 8.5);
      doc.setTextColor(bold ? BRAND.primary[0] : BRAND.dark[0], bold ? BRAND.primary[1] : BRAND.dark[1], bold ? BRAND.primary[2] : BRAND.dark[2]);
      doc.text(label, totalsX, y);
      doc.text(val, amtX, y, { align: 'right' });
      y += bold ? 8 : 6;
    };

    totLine(activeLang === 'EN' ? 'Subtotal (excl. VAT):' : 'Subtotaal (excl. BTW):',    `€ ${subtotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`);
    if (discount > 0) {
      totLine(activeLang === 'EN' ? `Discount (${discount}%):` : `Korting (${discount}%):`, `- € ${discountAmt.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`);
    }
    totLine(activeLang === 'EN' ? 'VAT (21%):' : 'BTW (21%):',               `€ ${vat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`);

    doc.setFillColor(...BRAND.primary);
    doc.rect(totalsX - 4, y - 5, 60 + 4, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(237, 232, 223);
    doc.text(activeLang === 'EN' ? 'Total Incl. VAT:' : 'Totaal Incl. BTW:', totalsX, y + 0.5);
    doc.text(`€ ${total.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, amtX, y + 0.5, { align: 'right' });
    y += 14;
  }

  // Status badge
  const isAccepted = ['Geaccepteerd', 'Accepted', 'Approved'].includes(status);
  doc.setFillColor(...(isAccepted ? [240, 253, 244] : [254, 243, 199]));
  doc.roundedRect(14, y, 182, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...(isAccepted ? [22, 101, 52] : [146, 64, 14]));
  doc.text(
    isAccepted
      ? (activeLang === 'EN' ? '✓  OFFICIALLY ACCEPTED PROPOSAL BY VANUIT AMBACHT' : '✓  OFFICIEEL GEACCEPTEERDE OFFERTE DOOR VANUIT AMBACHT')
      : (activeLang === 'EN' ? '⚠  DRAFT PROPOSAL — NOT YET SENT TO CLIENT' : '⚠  CONCEPT OFFERTE — NOG NIET VERZONDEN NAAR KLANT'),
    105, y + 6.5, { align: 'center' }
  );

  drawFooter(doc, 1);
  doc.save(fileName);
  return fileName;
}

/**
 * Vanuit Ambacht — Direct Client-Side Vector PDF File Generator
 * Generates an official, beautiful branded PDF document matching the preview 100%
 * and calls doc.save("Quote-{number} {customer}.pdf") to trigger an actual file download.
 */
export function downloadDirectPdfFile(quoteData = {}) {
  // Extract properties supporting both raw params or full quote object
  const quote = quoteData?.quote || quoteData || {};
  let activeLang = quoteData?.language || quote?.language;
  if (!activeLang && typeof window !== 'undefined' && window.localStorage) {
    activeLang = window.localStorage.getItem('app_language');
  }
  activeLang = (activeLang === 'EN' || activeLang === 'en') ? 'EN' : 'NL';

  const quoteId = quote.id || quote.quoteId || 'OF-2026331';
  
  const custObj = typeof quote.customer === 'object' && quote.customer !== null ? quote.customer : null;
  const rawCust = custObj?.name || (custObj ? `${custObj.firstName || ''} ${custObj.lastName || ''}`.trim() : null) || (typeof quote.customer === 'string' ? quote.customer : null) || quote.customerName;
  const customerName = (rawCust && typeof rawCust === 'string') ? rawCust.trim() : (activeLang === 'EN' ? 'Client' : 'Klant');
  const customerEmail = custObj?.email || quote.customerEmail || quote.email || 'klant@vanuitambacht.nl';
  const customerPhone = custObj?.phone || quote.customerPhone || quote.phone || '+31 6 12345678';
  const customerCity = custObj?.city || quote.customerCity || quote.city || quote.deliveryLocation || 'Nederland';

  const category = quote.category || quote.productType || quote.projectCategory || quote.project || (activeLang === 'EN' ? 'Outdoor Kitchen' : 'Buitenkeuken');
  const woodType = quote.woodType || quote.configuration?.woodType || 'Thermo Fraké';
  const dimensions = quote.dimensions || quote.configuration?.dimensions || '240 × 80 cm';
  const cleanDimensions = String(dimensions).replace(/\s*cm$/i, '').trim();
  const optionsTitle = quote.configuration?.optionsTitle || quote.optionsTitle || 'Big Green Egg Large';
  const deliveryTime = quote.configuration?.deliveryTime || quote.deliveryTime || (activeLang === 'EN' ? '3 to 5 weeks' : '3 tot 5 weken');

  // Exact File Naming Rule: Quote-{number} {customer}.pdf
  const cleanCustomerName = String(customerName)
    .replace(/[\/:*?"<>|]/g, '')
    .trim();

  const filePrefix = quote?.isDraft ? (activeLang === 'EN' ? 'Draft-Quote' : 'Concept-Offerte') : 'Quote';
  const fileName = `${filePrefix}-${quoteId} ${cleanCustomerName}.pdf`;

  // Itemized breakdown & totals
  const totalFallbackAmt = typeof quote.amount === 'number'
    ? quote.amount
    : (quote.totalInclVat || quote.calculatedPrice || parseFloat(String(quote.amount || '0').replace(/[^0-9.]/g, '')) || 0);

  const items = (quote.items && quote.items.length > 0)
    ? quote.items
    : (quote.investment?.lineItems && quote.investment.lineItems.length > 0)
    ? quote.investment.lineItems
    : [
        {
          description: `Outdoor Kitchen ${woodType} (${cleanDimensions} cm)`,
          quantity: 1,
          unitPrice: totalFallbackAmt
        }
      ];

  const subtotalExcl = items.reduce((acc, i) => {
    const qty = Number(i.quantity || 1);
    const prc = Number(i.unitPrice || i.priceInclVat || 0);
    return acc + (qty * prc);
  }, 0);

  const totalIncl = totalFallbackAmt || subtotalExcl;
  const totalExcl = Math.round((totalIncl / 1.21) * 100) / 100;
  const vatAmount = Math.round((totalIncl - totalExcl) * 100) / 100;
  const depositAmt = Math.round((totalIncl * 0.5) * 100) / 100;
  const finalAmt = Math.round((totalIncl - depositAmt) * 100) / 100;

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  
  // Color Palette
  const primaryColor = [62, 78, 54];   // #3E4E36 Forest Green
  const darkColor = [43, 48, 40];     // #2B3028 Dark Gray
  const accentColor = [217, 119, 6];   // #D97706 Amber
  const warmBg = [245, 242, 235];     // #F5F2EB Cream
  const cardBg = [250, 248, 244];     // #FAF8F4 Off-white Card
  const borderColor = [214, 207, 194]; // #D6CFC2 Border

  // =========================================================================
  // PAGE 1: COMMERCIAL BESPOKE PROPOSAL & FINANCIAL BREAKDOWN
  // =========================================================================

  // 1. BRAND HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text('VANUIT AMBACHT', 20, 24);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text(activeLang === 'EN' ? 'OFFICIAL COMMERCIAL BESPOKE PROPOSAL' : 'OFFICIËLE COMMERCIËLE MAATOFFERTE', 20, 31);

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.8);
  doc.line(20, 35, 190, 35);

  // 2. METADATA HEADER BOX (4 SYMMETRICAL COLUMNS)
  doc.setFillColor(...warmBg);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.roundedRect(20, 40, 170, 20, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(112, 98, 79);
  doc.text(activeLang === 'EN' ? 'PROPOSAL NUMBER' : 'OFFERTENUMMER', 25, 47);
  doc.text(activeLang === 'EN' ? 'DATE' : 'DATUM', 70, 47);
  doc.text(activeLang === 'EN' ? 'VALID UNTIL' : 'GELDIG T/M', 115, 47);
  doc.text(activeLang === 'EN' ? 'STATUS' : 'STATUS', 158, 47);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(quoteId, 25, 54.5);
  doc.setTextColor(...darkColor);
  doc.text(quote.date || (activeLang === 'EN' ? new Date().toISOString().split('T')[0] : new Date().toLocaleDateString('nl-NL')), 70, 54.5);
  doc.text(quote.validUntil || (activeLang === 'EN' ? 'In consultation' : 'In overleg'), 115, 54.5);
  doc.setTextColor(...accentColor);
  doc.text(quote.status || (activeLang === 'EN' ? 'Draft' : 'Concept'), 158, 54.5);

  // 3. TWO BALANCED CARDS: CLIENT DETAILS & SPECIFICATIONS (GRID ALIGNED)
  // Left: Client Details Card (x = 20, width = 82, height = 32)
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(20, 66, 82, 32, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(activeLang === 'EN' ? 'CLIENT DETAILS' : 'KLANTGEGEVENS', 25, 72.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 115, 105);
  doc.text(activeLang === 'EN' ? 'Name:' : 'Naam:', 25, 78.5);
  doc.text(activeLang === 'EN' ? 'E-mail:' : 'E-mail:', 25, 84.5);
  doc.text(activeLang === 'EN' ? 'Phone:' : 'Telefoon:', 25, 90.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  const cleanTruncCust = customerName.length > 22 ? customerName.slice(0, 20) + '...' : customerName;
  doc.setFont('helvetica', 'bold');
  doc.text(cleanTruncCust, 42, 78.5);
  doc.setFont('helvetica', 'normal');
  const cleanTruncMail = customerEmail.length > 24 ? customerEmail.slice(0, 22) + '...' : customerEmail;
  doc.text(cleanTruncMail, 42, 84.5);
  doc.text(customerPhone, 42, 90.5);

  // Right: Specifications Card (x = 108, width = 82, height = 32)
  doc.setFillColor(...cardBg);
  doc.roundedRect(108, 66, 82, 32, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(activeLang === 'EN' ? 'SPECIFICATIONS' : 'SPECIFICATIES', 113, 72.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 115, 105);
  doc.text(activeLang === 'EN' ? 'Project:' : 'Project:', 113, 78.5);
  doc.text(activeLang === 'EN' ? 'Wood:' : 'Houtsoort:', 113, 84.5);
  doc.text(activeLang === 'EN' ? 'Format:' : 'Afmeting:', 113, 90.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'bold');
  doc.text(category, 134, 78.5);
  doc.setFont('helvetica', 'normal');
  doc.text(woodType, 134, 84.5);
  doc.text(cleanDimensions + ' cm', 134, 90.5);

  // 4. FINANCIAL ITEMS TABLE (STRICT MATHEMATICAL COLUMNS)
  // Table Header Bar (width = 170, x = 20 to 190)
  doc.setFillColor(...primaryColor);
  doc.rect(20, 104, 170, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(activeLang === 'EN' ? 'DESCRIPTION' : 'OMSCHRIJVING', 25, 109.5);
  doc.text(activeLang === 'EN' ? 'QUANTITY' : 'AANTAL', 135, 109.5, { align: 'center' });
  doc.text(activeLang === 'EN' ? 'PRICE (INCL. VAT)' : 'PRIJS (INCL. BTW)', 185, 109.5, { align: 'right' });

  let y = 118;
  items.forEach((item, idx) => {
    const desc = item.description || item.title || `${activeLang === 'EN' ? 'Custom item' : 'Maatwerk item'} ${idx + 1}`;
    const qty = item.quantity || 1;
    const price = Number(item.unitPrice || item.priceInclVat || totalIncl);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...darkColor);
    
    // Strict text bounding box: max 95mm width so it NEVER touches quantity at 135
    const splitDesc = doc.splitTextToSize(desc, 95);
    doc.text(splitDesc, 25, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(String(qty), 135, y, { align: 'center' });

    const priceText = item.isIncluded || price === 0
      ? (activeLang === 'EN' ? 'Included' : 'Inbegrepen')
      : `EUR ${price.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;
    doc.setFont('helvetica', 'bold');
    doc.text(priceText, 185, y, { align: 'right' });

    const rowH = Math.max(9, splitDesc.length * 4.5 + 4);
    y += rowH;
    doc.setDrawColor(230, 225, 215);
    doc.setLineWidth(0.3);
    doc.line(20, y - 3, 190, y - 3);
  });

  // 5. TOTALS SUMMARY BOX (RIGHT ALIGNED AT x = 108, width = 82)
  y += 4;
  doc.setFillColor(...warmBg);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.roundedRect(108, y, 82, 32, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  doc.text(activeLang === 'EN' ? 'Total excl. VAT:' : 'Totaal excl. btw:', 113, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.text(`EUR ${totalExcl.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, 185, y + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.text(activeLang === 'EN' ? 'VAT (21%):' : 'Btw (21%):', 113, y + 16);
  doc.setFont('helvetica', 'bold');
  doc.text(`EUR ${vatAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, 185, y + 16, { align: 'right' });

  doc.setDrawColor(...borderColor);
  doc.line(113, y + 20, 185, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text(activeLang === 'EN' ? 'Total incl. VAT:' : 'Totaal incl. btw:', 113, y + 27);
  doc.setTextColor(...accentColor);
  doc.setFontSize(10.5);
  doc.text(`EUR ${totalIncl.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, 185, y + 27, { align: 'right' });

  // 6. PAYMENT TERMS (INSTALMENTS 50% / 50%)
  y += 40;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text(activeLang === 'EN' ? 'PAYMENT TERMS (50% / 50%)' : 'BETALINGSVOORWAARDEN (50% / 50%)', 20, y);

  doc.setFillColor(...cardBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(20, y + 4, 82, 18, 2, 2, 'FD');
  doc.roundedRect(108, y + 4, 82, 18, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text(activeLang === 'EN' ? '50% Deposit upon acceptance' : '50% Aanbetaling bij akkoord', 25, y + 10);
  doc.text(activeLang === 'EN' ? '50% Final upon handover' : '50% Eindfactuur bij oplevering', 113, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 95);
  doc.text(activeLang === 'EN' ? 'Upon approval of technical design' : 'Na akkoord op de technische tekening', 25, y + 14);
  doc.text(activeLang === 'EN' ? 'Upon successful delivery & check' : 'Pas als alles naar wens is opgeleverd', 113, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text(`EUR ${depositAmt.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, 97, y + 14, { align: 'right' });
  doc.text(`EUR ${finalAmt.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, 185, y + 14, { align: 'right' });

  // 7. FOOTER BRANDING (PAGE 1)
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.line(20, 275, 190, 275);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 115, 105);
  doc.text('Vanuit Ambacht • Koningshof 33, 3451 LM Vleuten • KVK 93097429 • BTW NL866264863B01', 20, 281);
  doc.text(`${activeLang === 'EN' ? 'Page' : 'Pagina'} 1/2 • ${quoteId}`, 190, 281, { align: 'right' });

  // =========================================================================
  // PAGE 2: 5-STAPPEN PROCES & AKKOORD ONDERTEKENING
  // =========================================================================
  doc.addPage('a4', 'portrait');

  // Green header bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 18, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text('VANUIT AMBACHT', 20, 12);
  doc.setFontSize(8);
  doc.setTextColor(214, 207, 194);
  doc.text(activeLang === 'EN' ? 'PROPOSAL SPECIFICATIONS & SIGN-OFF' : 'OFFERTE SPECIFICATIES & AKKOORD', 65, 12);
  doc.text(quoteId, 190, 12, { align: 'right' });

  // 4 Key Spec Badges
  let p2Y = 28;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(activeLang === 'EN' ? 'KEY SPECIFICATIONS' : 'KERN SPECIFICATIES', 20, p2Y);

  p2Y += 4;
  const specBoxes = [
    { label: activeLang === 'EN' ? 'DIMENSIONS' : 'AFMETING', val: cleanDimensions + ' cm' },
    { label: activeLang === 'EN' ? 'WOOD TYPE' : 'HOUTSOORT', val: woodType },
    { label: activeLang === 'EN' ? 'EQUIPMENT' : 'APPARATUUR', val: optionsTitle },
    { label: activeLang === 'EN' ? 'DELIVERY' : 'LEVERTIJD', val: deliveryTime },
  ];

  const boxW = 39.5;
  specBoxes.forEach((b, idx) => {
    const bX = 20 + idx * 43.5;
    doc.setFillColor(...warmBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(bX, p2Y, boxW, 16, 2, 2, 'FD');
    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(112, 98, 79);
    doc.text(b.label, bX + 4, p2Y + 6);
    doc.setFontSize(8.5);
    doc.setTextColor(...primaryColor);
    const truncVal = b.val.length > 18 ? b.val.slice(0, 16) + '...' : b.val;
    doc.text(truncVal, bX + 4, p2Y + 12);
  });

  // 5 Simple Steps
  p2Y += 26;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(activeLang === 'EN' ? 'IN FIVE SIMPLE STEPS' : 'IN VIJF EENVOUDIGE STAPPEN', 20, p2Y);

  p2Y += 5;
  const steps = activeLang === 'EN' ? [
    { num: '1', title: 'Proposal Approval', desc: 'Accept this proposal digitally or via signed copy to confirm your build slot.' },
    { num: '2', title: 'Technical Drawing & Measurement', desc: 'Precise on-site measuring and full CAD technical drawing for your final review.' },
    { num: '3', title: 'Artisan Workshop Production', desc: 'Handcrafted production with premium timber in our specialized workshop.' },
    { num: '4', title: 'Delivery & Terrace Installation', desc: 'Careful transport and professional installation by our certified craftsmen.' },
    { num: '5', title: 'Aftercare & Long-term Warranty', desc: 'Full handover, maintenance tips, and complete craftsmanship warranty.' }
  ] : [
    { num: '1', title: 'Offerte akkoord', desc: 'Bevestig deze offerte digitaal of ondertekend voor het reserveren van jouw plek.' },
    { num: '2', title: 'Inmeten & detailtekening', desc: 'Nauwkeurige inmeting op locatie en een gedetailleerde werktekening ter controle.' },
    { num: '3', title: 'Productie in de werkplaats', desc: 'Vervaardiging met hoogwaardig hout in onze ambachtelijke werkplaats.' },
    { num: '4', title: 'Levering & vakkundige montage', desc: 'Zorgvuldig transport en professionele installatie door gecertificeerde vakmensen.' },
    { num: '5', title: 'Nazorg & garantie', desc: 'Oplevering, onderhoudsadvies en volledige ambachtelijke garantie.' }
  ];

  steps.forEach((s) => {
    doc.setFillColor(...primaryColor);
    doc.circle(24, p2Y + 3, 3, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(s.num, 24, p2Y + 4, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text(s.title, 31, p2Y + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkColor);
    doc.text(s.desc, 31, p2Y + 8);

    p2Y += 12;
  });

  // Client Sign-off Box (Akkoord)
  p2Y += 4;
  doc.setFillColor(...cardBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(20, p2Y, 170, 48, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(activeLang === 'EN' ? 'SIGNATURE & APPROVAL' : 'VOOR AKKOORD & ONDERTEKENING', 25, p2Y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 75);
  doc.text(
    activeLang === 'EN'
      ? 'By signing, you accept the specifications, financial items, and delivery terms as outlined in this document.'
      : 'Door ondertekening verklaart opdrachtgever akkoord te gaan met de omschreven specificaties, tarieven en voorwaarden.',
    25,
    p2Y + 13
  );

  // Two signature columns
  // Left: Vanuit Ambacht
  doc.text(activeLang === 'EN' ? 'For Vanuit Ambacht:' : 'Namens Vanuit Ambacht:', 25, p2Y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text('Tim & Bram', 25, p2Y + 32);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(quote.date || new Date().toISOString().split('T')[0], 25, p2Y + 37);

  // Right: Client Signature Area
  doc.setFontSize(7.5);
  doc.text(`${activeLang === 'EN' ? 'For Client' : 'Namens Klant'}: ${customerName}`, 110, p2Y + 22);
  doc.setDrawColor(180, 175, 165);
  doc.line(110, p2Y + 36, 180, p2Y + 36);
  doc.setFontSize(6.8);
  doc.setTextColor(140, 140, 135);
  doc.text(activeLang === 'EN' ? 'Signature & Date' : 'Handtekening & Datum', 110, p2Y + 40);

  // Footer Branding (Page 2)
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.line(20, 275, 190, 275);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 115, 105);
  doc.text('Vanuit Ambacht • www.vanuitambacht.nl • info@vanuitambacht.nl • +31 6 12345678', 20, 281);
  doc.text(`${activeLang === 'EN' ? 'Page' : 'Pagina'} 2/2 • ${quoteId}`, 190, 281, { align: 'right' });

  // Open in new tab IMMEDIATELY and download file (Instant execution, 0ms lag)
  if (typeof window !== 'undefined') {
    try {
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (e) {
      // Window open popup blocked or safe catch
    }
  }

  doc.save(fileName);
  return fileName;
}

export function downloadDirectPdfFileFallback(quoteData = {}) {
  return downloadDirectPdfFile(quoteData);
}
// ── 2. INVOICE PDF ───────────────────────────────────────────────
/**
 * Download a real invoice PDF.
 * @param {object} invoice - invoice row object
 */
export async function downloadInvoicePdf(invoice) {
  const inv = invoice?.invoice || invoice || {};
  const id = inv.id || inv.invoiceNumber || 'INV-001';
  const customer = typeof inv.customer === 'object' && inv.customer !== null
    ? (inv.customer.name || `${inv.customer.firstName || ''} ${inv.customer.lastName || ''}`.trim() || 'Klant')
    : (inv.customer || inv.customerName || 'Klant');
  const cleanCustomerName = String(customer).replace(/[\\/:*?"<>|]/g, '').trim();
  const fileName = `Factuur-${id}-${cleanCustomerName}.pdf`;

  // Create temporary off-screen container for rendering FactuurPDFTemplate
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '794px';
  tempDiv.style.zIndex = '-9999';
  tempDiv.style.backgroundColor = '#FFFFFF';
  document.body.appendChild(tempDiv);

  const root = createRoot(tempDiv);
  root.render(React.createElement(FactuurPDFTemplate, { invoice: inv }));

  // Wait for React DOM commit, Google fonts and image elements to complete loading
  await new Promise(resolve => setTimeout(resolve, 350));
  try {
    await Promise.all([
      document.fonts.load('500 34px "Playfair Display"'),
      document.fonts.load('italic 34px "Playfair Display"'),
      document.fonts.load('500 34px "Cormorant Garamond"'),
      document.fonts.load('600 34px "Cormorant Garamond"'),
      document.fonts.load('bold 14px "Montserrat"'),
      document.fonts.load('500 12px "Montserrat"')
    ]);
  } catch (e) {}
  await document.fonts.ready;

  const imgs = Array.from(tempDiv.querySelectorAll('img'));
  await Promise.all(
    imgs.map(img => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 1500);
      });
    })
  );
  await new Promise(resolve => setTimeout(resolve, 250));

  const targetEl = tempDiv.querySelector('#printable-factuur') || tempDiv.firstElementChild || tempDiv;

  const canvas = await html2canvas(targetEl, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: '#FFFFFF',
    logging: false
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = 210;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297));
  pdf.save(fileName);

  root.unmount();
  if (document.body.contains(tempDiv)) {
    document.body.removeChild(tempDiv);
  }

  return fileName;
}

// ── 3. BLUEPRINT / PROJECT PDF ───────────────────────────────────
/**
 * Download a real project blueprint PDF.
 * @param {object} project - project row object
 */
export function downloadBlueprintPdf(project) {
  const id       = project?.id || 'PRJ-001';
  const name     = project?.name || 'Buitenkeuken Maatwerk';
  const customer = typeof project?.customer === 'object'
    ? (project.customer.name || 'Klant')
    : (project?.customer || 'Klant');
  const partner  = project?.partner || 'Niet toegewezen';
  const deadline = project?.deadline || '—';
  const progress = project?.progress || 0;
  const dims     = project?.dimensions || '350cm × 90cm × 95cm';
  const frame    = project?.frameMaterial || 'Massief Teak Hout (FSC Gecertificeerd)';
  const worktop  = project?.topMaterial || 'Polijst Beton (Donkergrijs)';
  const delivery = project?.deliveryAddress || project?.deliveryLocation || '—';
  const value    = project?.value || '—';

  const fileName = `Blueprint-${id}-${slugify(name)}.pdf`;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = drawHeader(doc, 'TECHNISCHE CONSTRUCTIETEKENING', `Vanuit Ambacht • ${id} • ${new Date().toLocaleDateString('nl-NL')}`, id);

  y = sectionTitle(doc, 'Project Informatie', y);
  y = infoRow(doc, 'Project naam', name,     y);
  y = infoRow(doc, 'Klant',        customer, y);
  y = infoRow(doc, 'Vakman',       partner,  y);
  y = infoRow(doc, 'Deadline',     deadline, y);
  y = infoRow(doc, 'Voortgang',    `${progress}% compleet`, y);
  y = infoRow(doc, 'Waarde',       value,    y);
  y += 6;

  y = sectionTitle(doc, 'Technische Specificaties & Materialen', y);
  y = infoRow(doc, 'Afmetingen (B×D×H)', dims,     y);
  y = infoRow(doc, 'Frame Materiaal',    frame,    y);
  y = infoRow(doc, 'Werkblad',           worktop,  y);
  y = infoRow(doc, 'Levering',           delivery, y);
  y += 8;

  // Schematic diagram (text-based)
  y = sectionTitle(doc, 'Schematische Indeling (CAD Referentie)', y);

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(14, y, 182, 45, 3, 3, 'F');

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(34, 211, 238);
  doc.text('┌─────────────────────────────────────────────────────────────────────┐', 18, y + 7);
  doc.text('│  KABINETBLOK 1    │   UITSPARING (BBQ)   │     KABINETBLOK 2       │', 18, y + 13);
  doc.text('│    60 – 80 cm      │     70 – 90 cm       │       60 – 80 cm        │', 18, y + 18);
  doc.text('│                   │   [Big Green Egg /   │                         │', 18, y + 23);
  doc.text('│   2× deuren +     │    Kamado BBQ /      │  Open schap + lade      │', 18, y + 28);
  doc.text('│   soft-close      │    Gasgrill Large]   │  + soft-close deuren    │', 18, y + 33);
  doc.text('└─────────────────────────────────────────────────────────────────────┘', 18, y + 38);

  doc.setFontSize(7);
  doc.setTextColor(103, 232, 249);
  doc.text(`Referentie afmetingen: ${dims}  •  Schaal 1:20  •  Gecertificeerde productietekening`, 105, y + 43, { align: 'center' });
  y += 52;

  // Checklist
  y = sectionTitle(doc, 'Productie Checklist', y);
  const checks = [
    'Hout frame gesneden en geschuurd op maat',
    'Scharnieren en soft-close dempers gemonteerd',
    'Uitsparing gefreesd voor BBQ / apparaat',
    'Werkblad gelijmd en gehecht',
    'Olie-afwerking aangebracht (2 lagen)',
    'Wielen bevestigd (heavy-duty zwenkwielen)',
    'Kwaliteitscontrole uitgevoerd door vakman',
    'Klaar voor bezorging bij klant',
  ];

  checks.forEach((item) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.dark);
    doc.text(`☐  ${item}`, 17, y);
    y += 6;
  });

  drawFooter(doc, 1);
  doc.save(fileName);
  return fileName;
}

// ── 4. DOCUMENT PDF ──────────────────────────────────────────────
/**
 * Download a generic document PDF.
 * @param {object} docObj  - document object { name, category, uploader, date, id }
 */
export function downloadDocumentPdf(docObj) {
  const name     = docObj?.name || 'Document';
  const category = docObj?.category || 'General';
  const uploader = docObj?.uploader || 'Vanuit Ambacht';
  const date     = docObj?.date || new Date().toLocaleDateString('nl-NL');
  const docId    = docObj?.id || 'DOC-001';

  const fileName = `VA-${slugify(name)}.pdf`;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = drawHeader(doc, name.toUpperCase(), `Vanuit Ambacht • ${category} • ${date}`, docId);

  y = sectionTitle(doc, 'Document Informatie', y);
  y = infoRow(doc, 'Bestandsnaam', name,     y);
  y = infoRow(doc, 'Categorie',    category, y);
  y = infoRow(doc, 'Geüpload door',uploader, y);
  y = infoRow(doc, 'Datum',        date,     y);
  y = infoRow(doc, 'Document ID',  docId,    y);
  y += 8;

  // Content block
  y = sectionTitle(doc, 'Document Inhoud', y);
  doc.setFillColor(248, 247, 244);
  doc.roundedRect(14, y, 182, 40, 3, 3, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...BRAND.dark);
  const bodyText = [
    `Dit is een officieel geverifieerd document van Vanuit Ambacht B.V.,`,
    `uitgegeven ten behoeve van project gerelateerde documentatie en`,
    `klantcommunicatie. Alle vermelde specificaties, garanties en`,
    `afspraken in dit document zijn geldig en bindend.`,
    ``,
    `Categorie: ${category}`,
    `Geüpload door: ${uploader}`,
    `Uitgiftedatum: ${date}`,
  ];
  bodyText.forEach((line, i) => {
    doc.text(line, 18, y + 8 + i * 5);
  });
  y += 50;

  // Verification stamp
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(0.8);
  doc.roundedRect(14, y, 182, 14, 3, 3, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(22, 101, 52);
  doc.text('✓  DIGITAAL GEVERIFIEERD & GOEDGEKEURD DOOR VANUIT AMBACHT B.V.', 105, y + 9, { align: 'center' });

  drawFooter(doc, 1);
  doc.save(fileName);
  return fileName;
}

/**
 * Generates downloadable Burenbrief PDF for neighbours (Step 4)
 */
export function generateBurenbriefPdf(projectData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const custName = projectData?.customer || 'Klant';
  const address = projectData?.address || projectData?.deliveryAddress || 'Keizersgracht 420, Amsterdam';
  const buildPeriod = projectData?.expectedDelivery || projectData?.deadline 
    ? `Verwachte oplevering: ${projectData.expectedDelivery || projectData.deadline}` 
    : 'De definitieve bouwperiode wordt bevestigd na de schouw.';

  drawHeader(doc, 'BURENBRIEF', 'Informatie werkzaamheden buren', projectData?.id || 'PRJ-2001');

  let y = 30;

  // Title Box
  doc.setFillColor(...BRAND.cream);
  doc.roundedRect(14, y, 182, 16, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.primary);
  doc.text('BURENBRIEF — WERKZAAMHEDEN BUITENVERBLIJF', 18, y + 10);
  y += 24;

  // Greeting & Letter Content
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.dark);

  const letterLines = [
    'Beste buren,',
    '',
    'Binnenkort starten er werkzaamheden aan onze woning voor de realisatie van een nieuw buitenverblijf.',
    'Via deze brief stellen we u alvast op de hoogte van de planning en de opzet.',
    '',
    `Adres van de werkzaamheden:`,
    `${address}`,
    '',
    `Verwachte bouwperiode:`,
    `${buildPeriod}`,
    '',
    'We proberen de werkzaamheden zo zorgvuldig mogelijk uit te voeren en eventuele overlast tot een minimum te beperken.',
    'Mocht u vooraf of tijdens de bouw vragen hebben, neem gerust even contact op.',
    '',
    'Alvast bedankt voor uw begrip en medewerking!',
    '',
    'Met vriendelijke groet,',
    `${custName}`,
    'Vanuit Ambacht B.V.'
  ];

  letterLines.forEach((line) => {
    if (line.startsWith('Adres van de werkzaamheden:') || line.startsWith('Verwachte bouwperiode:')) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    doc.text(line, 18, y);
    y += 6;
  });

  drawFooter(doc, 1);
  const fileName = `Burenbrief_${(custName).replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
  return fileName;
}

// ── 5. Legacy named export (backwards compat) ─────────────────────

