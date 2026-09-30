import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { WerkorderTemplate, OpleverrapportTemplate } from '../components/PartnerPdfTemplates';

async function generateReactPdf(Component, props, fileName) {
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.top = '0';
  tempDiv.style.left = '0';
  tempDiv.style.width = '794px';
  tempDiv.style.height = '1123px';
  tempDiv.style.zIndex = '-99999';
  tempDiv.style.opacity = '1';
  tempDiv.style.pointerEvents = 'none';
  tempDiv.style.backgroundColor = '#FFFFFF';
  document.body.appendChild(tempDiv);

  let root = null;
  try {
    root = createRoot(tempDiv);
    root.render(React.createElement(Component, props));

    // Wait for React DOM commit and fonts to load
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#FFFFFF',
      logging: false,
      windowWidth: 1200
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    
    pdf.save(fileName);
    return fileName;
  } catch (err) {
    console.error('[PDF Generator] React rendering failed:', err);
    throw err;
  } finally {
    if (root) {
      try { root.unmount(); } catch(e){}
    }
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }
}

export function downloadWerkorderPdf(project) {
  const name = project?.name || 'Buitenverblijf Douglas';
  const id = project?.id || 'OF-2026418';
  generateReactPdf(WerkorderTemplate, { project }, `Werkorder-${id}-${name.replace(/ /g, '-')}.pdf`);
}

export function downloadOpleverrapportPdf(project) {
  const name = project?.name || 'Buitenverblijf Douglas';
  const id = project?.id || 'OF-2026418';
  const customer = project?.customer || 'Sander de Vries';
  const shortName = customer.split(' ').pop();
  generateReactPdf(OpleverrapportTemplate, { project }, `Opleverrapport-${id}-${shortName}.pdf`);
}
