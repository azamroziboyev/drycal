import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Generates and downloads a multi-page PDF from DOM elements with page-break containers
 */
export async function downloadElementAsPdf(
  elementIds: string[],
  fileName: string = 'Kalibrlash_Sertifikati.pdf',
  onProgress?: (progress: number, status: string) => void
): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const totalPages = elementIds.length;
  let addedPages = 0;

  for (let i = 0; i < totalPages; i++) {
    const elId = elementIds[i];
    const el = document.getElementById(elId);
    if (!el) {
      console.warn(`Element with ID ${elId} not found`);
      continue;
    }

    if (onProgress) {
      onProgress(Math.round(((i + 0.3) / totalPages) * 100), `${i + 1}-sahifa tayyorlanmoqda...`);
    }

    // Ensure element is visible during capture even if filtered/hidden
    const wasHidden = el.classList.contains('hidden') || el.style.display === 'none';
    if (wasHidden) {
      el.classList.remove('hidden');
      el.style.display = 'flex';
    }

    try {
      // Capture element at 2x resolution using html2canvas-pro (native oklch & modern CSS support)
      const canvas = await html2canvas(el, {
        scale: 2.0,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: 1123
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      if (addedPages > 0) {
        pdf.addPage('a4', 'portrait');
      }

      // A4 dimensions: 210mm x 297mm
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      addedPages++;
    } catch (pageErr) {
      console.error(`Error rendering page ${elId}`, pageErr);
      throw pageErr;
    } finally {
      if (wasHidden) {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    }
  }

  if (addedPages === 0) {
    throw new Error('Hech qanday sahifa topilmadi');
  }

  if (onProgress) {
    onProgress(100, 'Sertifikat yuklanmoqda...');
  }

  // Double-safe download trigger: pdf.save + manual blob link fallback
  try {
    pdf.save(fileName);
  } catch (err) {
    console.warn('pdf.save failed, using blob link fallback', err);
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
  }
}

/**
 * Prints the certificate pages directly using a dedicated hidden iframe
 * ensuring exact A4 formatting, Arial typography, and complete bypass of UI layout
 */
export function printCertificatePages(elementIds: string[]): void {
  // Collect HTML of all certificate pages
  const pagesHtml = elementIds
    .map(id => {
      const el = document.getElementById(id);
      if (!el) return '';
      // Clone element and ensure display is flex/block
      const clone = el.cloneNode(true) as HTMLElement;
      clone.classList.remove('hidden');
      clone.style.display = 'flex';
      clone.style.margin = '0 auto';
      clone.style.boxShadow = 'none';
      return `<div class="print-page">${clone.outerHTML}</div>`;
    })
    .filter(Boolean)
    .join('');

  if (!pagesHtml) {
    window.print();
    return;
  }

  // Create isolated printing iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '210mm';
  iframe.style.height = '297mm';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="uz">
      <head>
        <meta charset="UTF-8">
        <title>Rasmiy Kalibrlash Sertifikati</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #000000;
            font-family: Arial, Helvetica, sans-serif;
          }
          .print-page {
            width: 210mm;
            min-height: 297mm;
            height: 297mm;
            page-break-after: always;
            break-after: page;
            overflow: hidden;
            background: #ffffff;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `);
  doc.close();

  // Wait for images and fonts in the iframe to layout
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print failed, falling back to window.print()', e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 400);
}
