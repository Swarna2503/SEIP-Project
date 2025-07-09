// src/utils/pdfUtils.ts
import { PDFDocument, PDFCheckBox, PDFTextField, rgb } from "pdf-lib";

export interface PdfSignature {
  key: string;
  dataUrl: string | null;
}

const SIGNATURE_POSITIONS: Record<
  string,
  { pageIndex: number; x: number; y: number; width: number; height: number }
> = {
  SellerSignature:     { pageIndex: 0, x:  25, y:  690, width: 200, height:  15 },
  OwnerSignature:      { pageIndex: 0, x:  25, y:  720, width: 200, height:  15 },
  AdditionalSignature: { pageIndex: 0, x:  25, y:  747, width: 200, height:  15 },
};

export async function fillAndFlattenPdf(
  templateBytes: Uint8Array,
  formData: Record<string, any>,
  signatures: PdfSignature[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form   = pdfDoc.getForm();

  // Cache all fields for fallback lookups:
  const allFields = form.getFields();

  // Generic getter by name (exact or case-insensitive partial)
  function getFieldByName(name: string) {
    try {
      return form.getField(name);
    } catch {
      const lower = name.toLowerCase();
      return allFields.find((f) => {
        const n = f.getName().toLowerCase();
        return n === lower || n.includes(lower);
      });
    }
  }

  // 1) Fill every non-signature entry
  for (const [key, val] of Object.entries(formData)) {
    if (val == null || signatures.some((s) => s.key === key)) continue;

    const field = getFieldByName(key);
    if (!field) {
      console.warn(`❌ No PDF field matched for "${key}"`);
      continue;
    }

    // Checkbox?
    if (field instanceof PDFCheckBox) {
      const checked =
        val === true ||
        val === "true" ||
        val === "1";
      try {
        if (checked) field.check();
        else        field.uncheck();
      } catch (e) {
        console.warn(`⚠️ Couldn’t (un)check "${key}":`, e);
      }
      continue;
    }

    // Text?
    if (field instanceof PDFTextField) {
      try {
        field.setText(String(val).slice(0, 1000));
      } catch (e) {
        console.warn(`⚠️ Couldn’t set text "${key}":`, e);
      }
      continue;
    }

    console.warn(`⚠️ Field "${key}" is neither checkbox nor text (is ${field.constructor.name})`);
  }

  // 2) Embed each signature image
  for (const { key, dataUrl } of signatures) {
    if (!dataUrl || dataUrl === "data:,") continue;
    const pos = SIGNATURE_POSITIONS[key];
    if (!pos) {
      console.warn(`❌ No position for signature "${key}"`);
      continue;
    }

    const page       = pdfDoc.getPage(pos.pageIndex);
    const H          = page.getHeight();
    const drawY      = H - pos.y - pos.height; // flip Y-axis

    // debug box (optional)
    page.drawRectangle({
      x: pos.x, y: drawY,
      width: pos.width, height: pos.height,
      borderColor: rgb(1, 0, 0), borderWidth: 0.5,
    });

    // decode the image
    const base64   = dataUrl.split(",")[1]!;
    const bytes    = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    let   img;
    try { img = await pdfDoc.embedPng(bytes); }
    catch { img = await pdfDoc.embedJpg(bytes); }

    // preserve aspect ratio
    const ratio = img.width / img.height;
    let   w     = pos.width;
    let   h     = pos.height;
    if (w / h > ratio) w = h * ratio;
    else               h = w / ratio;

    const x = pos.x + (pos.width  - w) / 2;
    const y = drawY   + (pos.height - h) / 2;

    page.drawImage(img, { x, y, width: w, height: h });
  }

  form.flatten();
  return pdfDoc.save();
}
