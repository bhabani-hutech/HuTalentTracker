import * as pdfjs from "pdfjs-dist";

// Set worker path to CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

/**
 * Parse PDF data in browser environment
 * @param data ArrayBuffer containing the PDF data
 * @returns Object with text, metadata and font information
 */
export async function parsePdf(
  data: ArrayBuffer,
): Promise<{ text: string; metadata: any; fonts: string[] }> {
  try {
    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data });
    const pdf = await loadingTask.promise;

    // Get metadata
    const metadata = await pdf.getMetadata().catch(() => ({}));

    // Extract text from all pages
    let fullText = "";
    const fonts = new Set<string>();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Extract text
      const pageText = textContent.items.map((item: any) => item.str).join(" ");

      fullText += pageText + "\n";

      // Try to extract font information if available
      textContent.items.forEach((item: any) => {
        if (item.fontName) {
          fonts.add(item.fontName);
        }
      });
    }

    return {
      text: fullText,
      metadata: metadata.info || {},
      fonts: Array.from(fonts),
    };
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return {
      text: "",
      metadata: {},
      fonts: [],
    };
  }
}
