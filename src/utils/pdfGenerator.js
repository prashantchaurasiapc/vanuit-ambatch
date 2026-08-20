import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Offerte6PagePDF from '../components/Offerte6PagePDF';

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

  const custObj = typeof quote.customer === 'object' ? quote.customer : null;
  const customerName = custObj?.name || quote.customer || quote.customerName || 'Bjorn Valk';
  const cleanCustomerName = String(customerName).replace(/[\\/:*?"<>|]/g, '').trim().replace(/\s+/g, '-');
  const fileName = `Offerte-${quoteId}-${cleanCustomerName}.pdf`;

  // Create temporary off-screen container for 6 pages
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '794px';
  tempDiv.style.zIndex = '-9999';
  tempDiv.style.backgroundColor = '#FFFFFF';
  document.body.appendChild(tempDiv);

  const root = createRoot(tempDiv);

  // Render all 6 pages inside Offerte6PagePDF (activePage="all")
  root.render(
    React.createElement(Offerte6PagePDF, { quote: quote, activePage: 'all' })
  );

  // Wait 600ms for images, fonts and React layout render
  await new Promise(resolve => setTimeout(resolve, 600));

  const pageElements = Array.from(tempDiv.querySelectorAll('.offerte-pdf-page'));

  if (pageElements.length > 0) {
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    for (let i = 0; i < pageElements.length; i++) {
      const el = pageElements[i];
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FFFFFF',
        logging: false
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }

    pdf.save(fileName);

    root.unmount();
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
    return fileName;
  } else {
    root.unmount();
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
    return downloadQuotePdfFallback(quote);
  }
}

// ── 1. QUOTE PDF ─────────────────────────────────────────────────
/**
 * Download a real 6-page quote PDF matching Live Preview 100%.
 * @param {object} quote  - row from quotes state
 */
export function downloadQuotePdf(quote) {
  generateFull6PagePdf(quote).catch(() => downloadQuotePdfFallback(quote));
  return `Offerte-${quote?.id || 'OF-2026331'}.pdf`;
}

export function downloadQuotePdfFallback(quote) {
  const id        = quote?.id || 'OF-2026-001';
  const customer  = typeof quote?.customer === 'object'
    ? (quote.customer.name || 'Klant')
    : (quote?.customer || 'Klant');
  const project   = quote?.project || 'Buitenkeuken Maatwerk';
  const amount    = quote?.amount || '€ 0';
  const status    = quote?.status || 'Concept';
  const date      = quote?.date || new Date().toISOString().split('T')[0];
  const validTill = quote?.validUntil || '—';
  const items     = Array.isArray(quote?.items) && quote.items.length > 0
    ? quote.items
    : (Array.isArray(quote?.investment?.lineItems) ? quote.investment.lineItems : []);

  const fileName = `Offerte-${id}-${slugify(customer)}.pdf`;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = drawHeader(doc, 'OFFICIËLE MAATOFFERTE', `Vanuit Ambacht • ${id} • ${date}`, id);

  // Customer + project block
  y = sectionTitle(doc, 'Klant & Project', y);
  y = infoRow(doc, 'Klantnaam',  customer, y);
  y = infoRow(doc, 'Project',    project,  y);
  y = infoRow(doc, 'Datum',      date,     y);
  y = infoRow(doc, 'Geldig tot', validTill,y);
  y = infoRow(doc, 'Status',     status,   y);
  y += 4;

  // Line items table
  if (items.length > 0) {
    y = sectionTitle(doc, 'Offerte Artikelen', y);

    // Table header
    doc.setFillColor(...BRAND.primary);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(237, 232, 223);
    doc.text('OMSCHRIJVING',     17,  y + 4.5);
    doc.text('AANTAL',          130,  y + 4.5);
    doc.text('PRIJS',           155,  y + 4.5);
    doc.text('TOTAAL',          182,  y + 4.5, { align: 'right' });
    y += 9;

    let subtotal = 0;
    items.forEach((item, idx) => {
      const desc  = String(item.description || item.title || '—');
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

    totLine('Subtotaal (excl. BTW):',    `€ ${subtotal.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`);
    if (discount > 0) {
      totLine(`Korting (${discount}%):`, `- € ${discountAmt.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`);
    }
    totLine('BTW (21%):',               `€ ${vat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`);

    doc.setFillColor(...BRAND.primary);
    doc.rect(totalsX - 4, y - 5, 60 + 4, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(237, 232, 223);
    doc.text('Totaal Incl. BTW:', totalsX, y + 0.5);
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
      ? '✓  OFFICIEEL GEACCEPTEERDE OFFERTE DOOR VANUIT AMBACHT'
      : '⚠  CONCEPT OFFERTE — NOG NIET VERZONDEN NAAR KLANT',
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
  generateFull6PagePdf(quoteData).catch(() => downloadQuotePdfFallback(quoteData?.quote || quoteData));
  return `Offerte-${(quoteData?.quote || quoteData)?.id || 'OF-2026331'}.pdf`;
}

export function downloadDirectPdfFileFallback(quoteData = {}) {
  // Extract properties supporting both raw params or full quote object
  const quote = quoteData.quote || quoteData;
  const quoteId = quote.id || quote.quoteId || 'OF-2026331';
  
  const rawCustomer = typeof quote.customer === 'object' ? quote.customer.name : quote.customer;
  const customerName = rawCustomer || quote.customerName || 'Sonu Jain';
  const customerEmail = quote.customerEmail || quote.email || 'klant@vanuitambacht.nl';
  const customerPhone = quote.customerPhone || quote.phone || '+31 6 12345678';

  const category = quote.category || quote.project || 'Buitenkeukens';
  const woodType = quote.woodType || quote.configuration?.woodType || 'Thermo Fraké';
  const dimensions = quote.dimensions || quote.configuration?.dimensions || '240 × 80 cm';

  // Exact File Naming Rule: Quote-{number} {customer}.pdf
  const cleanCustomerName = String(customerName)
    .replace(/[\\/:*?"<>|]/g, '')
    .trim();

  const fileName = `Quote-${quoteId} ${cleanCustomerName}.pdf`;

  // Itemized breakdown & totals
  const items = (quote.items && quote.items.length > 0)
    ? quote.items
    : (quote.investment?.lineItems && quote.investment.lineItems.length > 0)
    ? quote.investment.lineItems
    : [
        {
          description: `Outdoor Kitchen ${woodType} (${dimensions})`,
          quantity: 1,
          unitPrice: typeof quote.amount === 'number' ? quote.amount : parseFloat(String(quote.amount || '3495').replace(/[^0-9.]/g, '')) || 3495
        }
      ];

  const subtotalExcl = items.reduce((acc, i) => {
    const qty = Number(i.quantity || 1);
    const prc = Number(i.unitPrice || i.priceInclVat || 0);
    return acc + (qty * prc);
  }, 0);

  const totalIncl = typeof quote.amount === 'number'
    ? quote.amount
    : (parseFloat(String(quote.amount || '0').replace(/[^0-9.]/g, '')) || subtotalExcl || 3495);

  const totalExcl = Math.round((totalIncl / 1.21) * 100) / 100;
  const vatAmount = Math.round((totalIncl - totalExcl) * 100) / 100;

  const doc = new jsPDF();
  
  // Color Palette
  const primaryColor = [62, 78, 54];   // #3E4E36 Forest Green
  const darkColor = [43, 48, 40];     // #2B3028 Dark Gray
  const accentColor = [217, 119, 6];   // #D97706 Amber
  const warmBg = [245, 242, 235];     // #F5F2EB Cream

  // 1. BRAND HEADER
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text('VANUIT AMBACHT', 20, 24);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('OFFICIËLE COMMERCIËLE MAATOFFERTE', 20, 31);

  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.8);
  doc.line(20, 35, 190, 35);

  // 2. METADATA HEADER BOX (4 COLUMNS)
  doc.setFillColor(...warmBg);
  doc.roundedRect(20, 42, 170, 24, 2, 2, 'F');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 100, 100);
  doc.text('OFFERTENUMMER', 25, 49);
  doc.text('DATUM', 70, 49);
  doc.text('GELDIG T/M', 110, 49);
  doc.text('STATUS', 150, 49);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text(quoteId, 25, 57);
  doc.text(quote.date || new Date().toLocaleDateString('nl-NL'), 70, 57);
  doc.text(quote.validUntil || 'In overleg', 110, 57);

  doc.setTextColor(...accentColor);
  doc.text(quote.status || 'Concept', 150, 57);

  // 3. CUSTOMER & PROJECT SPECIFICATION CARDS
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('KLANTGEGEVENS', 20, 75);
  doc.text('SPECIFICATIES', 105, 75);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkColor);
  doc.text(`Naam: ${customerName}`, 20, 83);
  doc.text(`E-mail: ${customerEmail}`, 20, 89);
  doc.text(`Telefoon: ${customerPhone}`, 20, 95);

  doc.text(`Project: ${category}`, 105, 83);
  doc.text(`Houtsoort: ${woodType}`, 105, 89);
  doc.text(`Afmeting: ${dimensions}`, 105, 95);

  // 4. FINANCIAL ITEMS TABLE
  doc.setFillColor(...primaryColor);
  doc.rect(20, 106, 170, 9, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('OMSCHRIJVING', 25, 112);
  doc.text('AANTAL', 125, 112);
  doc.text('BEDRAG', 160, 112);

  let y = 122;
  items.forEach((item, idx) => {
    const desc = item.description || item.title || `Maatwerk item ${idx + 1}`;
    const qty = item.quantity || 1;
    const price = Number(item.unitPrice || item.priceInclVat || totalIncl);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...darkColor);
    doc.text(desc, 25, y);

    doc.setFont('helvetica', 'normal');
    doc.text(String(qty), 130, y);

    const priceText = item.isIncluded || price === 0
      ? 'Inbegrepen'
      : `EUR ${price.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;
    doc.text(priceText, 160, y);

    y += 10;
    doc.setDrawColor(230, 225, 215);
    doc.line(20, y - 4, 190, y - 4);
  });

  // 5. TOTALS SUMMARY BOX
  y += 5;
  doc.setFillColor(...warmBg);
  doc.roundedRect(105, y, 85, 36, 2, 2, 'F');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  doc.text('Totaal excl. btw:', 110, y + 9);
  doc.text(`EUR ${totalExcl.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, 155, y + 9);

  doc.text('Btw (21%):', 110, y + 17);
  doc.text(`EUR ${vatAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, 155, y + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('Totaal incl. btw:', 110, y + 28);
  doc.setTextColor(...accentColor);
  doc.text(`EUR ${totalIncl.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, 150, y + 28);

  // 6. PAYMENT TERMS & INSTALMENTS
  y += 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...primaryColor);
  doc.text('BETALINGSVOORWAARDEN (50% / 50%)', 20, y);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(214, 207, 194);
  doc.roundedRect(20, y + 5, 80, 18, 2, 2, 'DF');
  doc.roundedRect(110, y + 5, 80, 18, 2, 2, 'DF');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...accentColor);
  doc.text('50% Aanbetaling bij akkoord', 25, y + 12);
  doc.text('50% Eindfactuur bij oplevering', 115, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkColor);
  doc.text(`EUR ${(totalIncl * 0.5).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, 25, y + 18);
  doc.text(`EUR ${(totalIncl * 0.5).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, 115, y + 18);

  // 7. FOOTER BRANDING & FILE STAMP
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text(`Vanuit Ambacht • Koningshof 33, 3451 LM Vleuten • KVK 93097429 • BTW NL866264863B01`, 20, 280);
  doc.text(`Bestand: ${fileName}`, 20, 285);

  // DIRECT AUTOMATIC FILE DOWNLOAD TO USER'S DOWNLOADS FOLDER
  doc.save(fileName);
  return fileName;
}

// ── 2. INVOICE PDF ───────────────────────────────────────────────
/**
 * Download a real invoice PDF.
 * @param {object} invoice - invoice row object
 */
export function downloadInvoicePdf(invoice) {
  const id       = invoice?.id || 'INV-001';
  const customer = typeof invoice?.customer === 'object'
    ? (invoice.customer.name || 'Klant')
    : (invoice?.customer || 'Klant');
  const quoteId  = invoice?.quoteId || '—';
  const type     = invoice?.type || 'Factuur';
  const rawAmount = invoice?.amount || '€ 0';
  let numAmt = Number(invoice?.numericAmount) || 0;
  if (!numAmt && rawAmount) {
    // Parse "€ 12.500,00" or "€ 12500"
    const cleaned = String(rawAmount).replace(/[^0-9,/.-]/g, '').replace(/\./g, '').replace(',', '.');
    numAmt = parseFloat(cleaned) || 0;
  }
  const amount = rawAmount !== '€ 0' ? rawAmount : `€ ${numAmt.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`;
  const status   = invoice?.status || 'Openstaand';
  const dueDate  = invoice?.dueDate || '—';
  const creDate  = invoice?.createdDate || new Date().toISOString().split('T')[0];

  const fileName = `Factuur-${id}-${slugify(customer)}.pdf`;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  let y = drawHeader(doc, 'OFFICIËLE FACTUUR', `Vanuit Ambacht • ${id} • ${creDate}`, id);

  y = sectionTitle(doc, 'Factuur Details', y);
  y = infoRow(doc, 'Factuur Nr.',    id,       y);
  y = infoRow(doc, 'Klant',         customer, y);
  y = infoRow(doc, 'Offerte Ref.',   quoteId,  y);
  y = infoRow(doc, 'Factuurdatum',   creDate,  y);
  y = infoRow(doc, 'Vervaldatum',    dueDate,  y);
  y = infoRow(doc, 'Status',         status,   y);
  y += 6;

  // Amount table
  y = sectionTitle(doc, 'Bedrag Overzicht', y);

  doc.setFillColor(...BRAND.primary);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(237, 232, 223);
  doc.text('OMSCHRIJVING', 17, y + 4.5);
  doc.text('BEDRAG', 182, y + 4.5, { align: 'right' });
  y += 9;

  const exclVat  = numAmt / 1.21;
  const vatAmt   = numAmt - exclVat;

  const row = (label, val, shade = false) => {
    if (shade) {
      doc.setFillColor(248, 247, 244);
      doc.rect(14, y - 3, 182, 7, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.dark);
    doc.text(label, 17, y + 0.5);
    doc.text(val, 182, y + 0.5, { align: 'right' });
    y += 7;
  };

  row(type,     `€ ${exclVat.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`, true);
  row('BTW 21%',`€ ${vatAmt.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,  false);

  y += 2;
  doc.setFillColor(...BRAND.primary);
  doc.rect(14, y - 3, 182, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(237, 232, 223);
  doc.text('TOTAAL INCL. BTW', 17, y + 3.5);
  doc.text(amount, 182, y + 3.5, { align: 'right' });
  y += 16;

  // Payment info box
  y = sectionTitle(doc, 'Betalingsinformatie', y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.dark);
  doc.text('Bankrekeningnummer:', 17, y + 1);
  doc.setFont('helvetica', 'bold');
  doc.text('NL91 ABNA 0412 8892 10',  80, y + 1);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('Bedrijfsnaam:', 17, y + 1);
  doc.setFont('helvetica', 'bold');
  doc.text('Vanuit Ambacht B.V.', 80, y + 1);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.text('KVK / BTW:', 17, y + 1);
  doc.setFont('helvetica', 'bold');
  doc.text('KVK 84729102 • BTW NL863492817B01', 80, y + 1);
  y += 14;

  // Status badge
  const isPaid = ['Betaald', 'Paid'].includes(status);
  doc.setFillColor(...(isPaid ? [240, 253, 244] : [254, 243, 199]));
  doc.roundedRect(14, y, 182, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...(isPaid ? [22, 101, 52] : [146, 64, 14]));
  doc.text(
    isPaid ? `✓  BETAALD — Dank voor uw betaling` : `⚠  OPENSTAAND — Gelieve te betalen voor ${dueDate}`,
    105, y + 6.5, { align: 'center' }
  );

  drawFooter(doc, 1);
  doc.save(fileName);
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

