// src/utils/pdfUtils.ts

import { PDFDocument, PDFTextField, PDFCheckBox } from "pdf-lib";

/**
 * Given the original PDF bytes (ArrayBuffer) and a map of fieldName → value,
 * fill every AcroForm field that exists in the PDF, flatten the form, and
 * return a new Uint8Array of the filled PDF.
 */
export async function fillAndFlattenPdf(
  originalPdfBytes: ArrayBuffer,
  formData: { [fieldName: string]: string | boolean }
): Promise<Uint8Array> {
  // 1) Load the PDFDocument from raw bytes
  const pdfDoc = await PDFDocument.load(originalPdfBytes);

  // 2) Get the AcroForm instance
  const form = pdfDoc.getForm();

  // 3) Loop through each fieldName/value pair and set it in the PDF form
  for (const [fieldName, value] of Object.entries(formData)) {
    try {
      const field = form.getField(fieldName);

      // If it’s a text‐input field:
      if (field instanceof PDFTextField) {
        field.setText(String(value || ""));
      }
      // If it’s a checkbox field:
      else if (field instanceof PDFCheckBox) {
        if (value === true) {
          field.check();
        } else {
          field.uncheck();   // <<< corrected to lowercase “u”
        }
      }
      // (Add radio‐button or dropdown handling here if needed)
    } catch (err) {
      // If getField throws (no such field name), skip it quietly
      console.warn(`Field "${fieldName}" not found in PDF, skipping.`);
    }
  }

  // 4) Flatten the form so no fields remain editable
  form.flatten();

  // 5) Serialize to bytes and return
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Given a Uint8Array of PDF bytes, trigger a browser download with the given filename.
 */
export function downloadPdf(pdfBytes: Uint8Array, filename: string) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
