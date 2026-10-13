/**
 * Dedicated high-fidelity print service for Executive Letter Sheets (Cuartilla Oficial).
 * Strict 1-page letter size compliance (8.5 x 11 in) with 100% exact colors, borders, and SVGs.
 */

export function generatePrintDocument(title: string, innerHtml: string): string {
  // Capture parent application stylesheets (including Tailwind v4 builds)
  const headStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  ${headStyles}
  <style>
    /* STRICT 1-PAGE LETTER PRINT CONFIGURATION */
    @page {
      size: letter portrait;
      margin: 0;
    }

    * {
      box-sizing: border-box !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
      width: 100% !important;
      height: 100% !important;
      overflow: visible !important;
    }

    /* Container configured for 8mm-10mm internal padding fitting exactly on 1 Letter sheet */
    .cuartilla-container,
    .cuartilla-print-target {
      width: 100% !important;
      max-width: 215.9mm !important;
      margin: 0 auto !important;
      padding: 8mm 10mm !important;
      box-sizing: border-box !important;
      background: #ffffff !important;
      color: #0f172a !important;
      box-shadow: none !important;
      border: none !important;
      min-height: unset !important;
      height: auto !important;
      overflow: hidden !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .page-break {
      page-break-after: always !important;
      break-after: page !important;
    }

    .page-break:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }

    /* Prevent breaking across pages for all major sections */
    section, header, footer, table, tr, .avoid-page-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Header styling */
    header {
      border-bottom: 2px solid #0f172a !important;
      padding-bottom: 6px !important;
      margin-bottom: 8px !important;
    }

    /* Radar Chart crispness & scaled viewport fit */
    .radar-chart-print-container svg,
    svg[aria-label="Gráfica de araña de la Rueda del Liderazgo"] {
      max-height: 230px !important;
      max-width: 230px !important;
      width: auto !important;
      height: auto !important;
      display: block !important;
      margin: 0 auto !important;
    }

    /* Findings boxes (Fortalezas & Oportunidades) with solid borders and soft backgrounds */
    .box-fortalezas,
    div[class*="bg-blue-50"] {
      background-color: #eff6ff !important;
      border: 1px solid #bfdbfe !important;
      border-left: 4px solid #1d4ed8 !important;
      border-radius: 0 4px 4px 0 !important;
      padding: 6px 8px !important;
    }

    .box-oportunidades,
    div[class*="bg-rose-50"] {
      background-color: #fff1f2 !important;
      border: 1px solid #fecdd3 !important;
      border-left: 4px solid #be123c !important;
      border-radius: 0 4px 4px 0 !important;
      padding: 6px 8px !important;
    }

    /* Executive Commitments Table: High-contrast dark header & crisp defined borders */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin: 4px 0 !important;
      font-size: 10px !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    th {
      background-color: #0f172a !important;
      color: #ffffff !important;
      font-weight: 700 !important;
      font-size: 9.5px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.05em !important;
      padding: 4px 6px !important;
      border: 1px solid #334155 !important;
    }

    td {
      border: 1px solid #cbd5e1 !important;
      padding: 3.5px 6px !important;
      font-size: 10px !important;
      line-height: 1.25 !important;
      vertical-align: top !important;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc !important;
    }

    /* Badges */
    span[class*="bg-blue-100"] {
      background-color: #dbeafe !important;
      color: #1e3a8a !important;
      border: 1px solid #93c5fd !important;
      padding: 1px 4px !important;
      border-radius: 3px !important;
      font-weight: bold !important;
      font-size: 9px !important;
    }

    span[class*="bg-amber-100"] {
      background-color: #fef3c7 !important;
      color: #92400e !important;
      border: 1px solid #fde68a !important;
      padding: 1px 4px !important;
      border-radius: 3px !important;
      font-weight: bold !important;
      font-size: 9px !important;
    }

    /* Follow-up & Enfoque SLII Cards */
    div[class*="bg-slate-100"] {
      background-color: #f1f5f9 !important;
      border: 1px solid #cbd5e1 !important;
      border-radius: 4px !important;
      padding: 6px 8px !important;
    }

    /* Signatures container at the bottom */
    footer {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      margin-top: 6px !important;
      padding-top: 6px !important;
    }

    /* Strip editing indicators, outlines and focus rings completely on print */
    [contenteditable],
    [contenteditable="true"] {
      outline: none !important;
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
      background-color: transparent !important;
    }

    /* Print utility */
    @media print {
      body {
        padding: 0 !important;
        margin: 0 !important;
      }
      .no-print, button, [role="button"] {
        display: none !important;
      }
      [contenteditable],
      [contenteditable="true"] {
        outline: none !important;
        border: none !important;
        box-shadow: none !important;
        background: transparent !important;
        background-color: transparent !important;
      }
    }
  </style>
</head>
<body>
  ${innerHtml}
</body>
</html>`;
}

/**
 * Robust dispatcher: attempts window.open, falls back to hidden iframe, or native window.print()
 */
export function executePrintDocument(htmlDocument: string, fallbackNative?: () => void): void {
  // 1. Try window.open popup
  let printWindow: Window | null = null;
  try {
    printWindow = window.open('', '_blank', 'width=850,height=1100');
  } catch (err) {
    console.warn('Popup blocked, attempting iframe print fallback...', err);
  }

  if (printWindow && !printWindow.closed) {
    printWindow.document.open();
    printWindow.document.write(htmlDocument);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      try {
        printWindow?.focus();
        printWindow?.print();
      } catch (err) {
        console.error('Error invoking printWindow.print():', err);
        fallbackToIframe(htmlDocument, fallbackNative);
      }
    }, 350);
    return;
  }

  // 2. Fallback: Hidden iframe printing
  fallbackToIframe(htmlDocument, fallbackNative);
}

function fallbackToIframe(htmlDocument: string, fallbackNative?: () => void) {
  try {
    const existingFrame = document.getElementById('hidden-print-frame');
    if (existingFrame) existingFrame.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'hidden-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(htmlDocument);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (iframeErr) {
          console.error('Iframe print failed, executing fallback:', iframeErr);
          if (fallbackNative) fallbackNative();
          else window.print();
        } finally {
          setTimeout(() => iframe.remove(), 2500);
        }
      }, 350);
      return;
    }
  } catch (e) {
    console.error('Failed to create hidden print frame:', e);
  }

  // 3. Final fallback: trigger native window.print()
  if (fallbackNative) fallbackNative();
  else window.print();
}

/**
 * Print a single participant executive report
 */
export function printSingleExecutiveReport(
  elementId: string = 'cuartilla-reporte',
  participantName: string = 'Participante'
): void {
  const targetElement = document.getElementById(elementId) || 
                        document.querySelector('.cuartilla-container');

  if (!targetElement) {
    console.error(`Element #${elementId} not found for printing.`);
    window.print();
    return;
  }

  const title = `Reporte de Liderazgo — ${participantName}`;
  const contentHtml = `<article class="cuartilla-container">${targetElement.innerHTML}</article>`;
  const fullDocument = generatePrintDocument(title, contentHtml);

  executePrintDocument(fullDocument, () => {
    document.body.classList.remove('print-entire-batch');
    window.focus();
    window.print();
  });
}

/**
 * Print the entire batch of completed executive reports with page breaks
 */
export function printBatchExecutiveReports(
  sheetElements: HTMLElement[],
  batchTitle: string = 'Paquete de Reportes de Liderazgo'
): void {
  if (!sheetElements || sheetElements.length === 0) {
    console.error('No sheets provided for batch printing.');
    return;
  }

  const contentHtml = sheetElements
    .map((el) => `<article class="cuartilla-container page-break">${el.innerHTML}</article>`)
    .join('\n');

  const fullDocument = generatePrintDocument(batchTitle, contentHtml);

  executePrintDocument(fullDocument, () => {
    document.body.classList.add('print-entire-batch');
    window.focus();
    window.print();
    setTimeout(() => {
      document.body.classList.remove('print-entire-batch');
    }, 1500);
  });
}
