// src/utils/pdfUtils.ts
import { PDFDocument } from "pdf-lib";

/**
 * Fill in all the named AcroForm fields (text & checkboxes) and
 * return a PDF with every widget still present.
 */
export async function fillAndFlattenPdf(
  templateBytes: ArrayBuffer,
  formData: Record<string, string | boolean>
): Promise<Uint8Array> {
  // 1) Load once, ignoring encryption if needed
  const pdfDoc = await PDFDocument.load(templateBytes, {
    ignoreEncryption: true,
  });

  // 2) Grab the AcroForm
  const form = pdfDoc.getForm();

  // 3) Populate each field
  for (const [key, val] of Object.entries(formData)) {
    try {
      if (typeof val === "boolean") {
        form.getCheckBox(key)[val ? "check" : "uncheck"]();
      } else {
        form.getTextField(key).setText(val);
      }
    } catch {
      console.warn(`⚠️ No field named "${key}" in PDF.`);
    }
  }

  // 4) **DO NOT** flatten — leave all widgets (including signatures) in place
  // form.flatten();

  // 5) Save and return the bytes
  return pdfDoc.save();
}
