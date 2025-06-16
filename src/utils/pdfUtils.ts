// src/utils/pdfUtils.ts
import { PDFDocument } from "pdf-lib";

/**
 * Takes an ArrayBuffer of the blank 130-U PDF and a map of fieldName→value,
 * fills & flattens the form, and returns the new PDF bytes.
 */
export async function fillAndFlattenPdf(
  templateBytes: ArrayBuffer,
  formData: Record<string, string | boolean>
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form   = pdfDoc.getForm();

  Object.entries(formData).forEach(([key, val]) => {
    try {
      if (typeof val === "boolean") {
        form.getCheckBox(key)[val ? "check" : "uncheck"]();
      } else {
        form.getTextField(key).setText(val);
      }
    } catch {
      console.warn(`Field "${key}" not found in PDF.`);
    }
  });

  form.flatten();
  return pdfDoc.save();
}
