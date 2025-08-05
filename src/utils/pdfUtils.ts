

// src/utils/pdfUtils.ts
import {
  PDFDocument,
  StandardFonts,
  PDFCheckBox,
  PDFDropdown,
  PDFTextField,
  PDFButton,
  PDFField
} from "pdf-lib";

type PDFFieldType = PDFCheckBox | PDFDropdown | PDFTextField | PDFButton | PDFField;

export interface PdfSignature {
  key: string;
  dataUrl: string | null;
}

const SIGNATURE_POSITIONS = {
  SellerSignature: { pageIndex: 0, x: 25, y: 690, width: 200, height: 15 },
  OwnerSignature: { pageIndex: 0, x: 25, y: 720, width: 200, height: 15 },
  AdditionalSignature: { pageIndex: 0, x: 25, y: 747, width: 200, height: 15 },
} as const;

function isPDFCheckBox(field: PDFFieldType): field is PDFCheckBox {
  return 'check' in field && typeof field.check === 'function';
}

function isPDFDropdown(field: PDFFieldType): field is PDFDropdown {
  return 'select' in field && typeof field.select === 'function' && 
         'getOptions' in field && typeof field.getOptions === 'function';
}

function isPDFTextField(field: PDFFieldType): field is PDFTextField {
  return 'setText' in field && typeof field.setText === 'function';
}

function isPDFButton(field: PDFFieldType): field is PDFButton {
  return field.constructor.name === 'PDFButton';
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

async function handleField(
  form: { getField: (name: string) => PDFFieldType },
  key: string,
  value: unknown
): Promise<void> {
  try {
    const field = form.getField(key);
    const stringValue = safeString(value);

    if (isPDFCheckBox(field)) {
      const shouldCheck = [true, "true", 1, "1"].some(v => v === value || String(v) === stringValue);
      shouldCheck ? field.check() : field.uncheck();
      
      // Force appearance update
      field.enableReadOnly();
      field.disableReadOnly();
      
      console.log(`✓ Checkbox ${key} set to: ${shouldCheck}`);
    } 
    else if (isPDFDropdown(field)) {
      try {
        // First try selecting by exact value match
        const options = field.getOptions();
        const exactMatch = options.find(opt => opt === stringValue);
        
        if (exactMatch) {
          field.select(exactMatch);
          console.log(`▼ Dropdown ${key} set to: ${exactMatch}`);
        } else {
          // Try case-insensitive match
          const caseInsensitiveMatch = options.find(opt => 
            opt.toLowerCase() === stringValue.toLowerCase()
          );
          
          if (caseInsensitiveMatch) {
            field.select(caseInsensitiveMatch);
            console.log(`🔍 Dropdown ${key} matched case-insensitive: ${caseInsensitiveMatch}`);
          } else {
            console.warn(`⚠️ Value "${stringValue}" not in dropdown ${key} options`);
            try {
              // Try to add the option if not found
              field.addOptions([stringValue]);
              field.select(stringValue);
              console.log(`➕ Added new option to ${key}`);
            } catch (addError) {
              console.error(`❌ Could not add option to dropdown ${key}:`, addError);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error setting dropdown ${key}:`, error);
      }
    }
    else if (isPDFTextField(field)) {
      field.setText(stringValue);
      console.log(`ℹ️ Text field ${key} set to: ${stringValue.slice(0, 50)}`);
    }
    else if (isPDFButton(field)) {
      console.log(`🔘 Button field ${key} - no action taken`);
    }
    else {
      console.warn(`⚠️ Unknown field type for ${key}: ${field.constructor.name}`);
      try {
        // Final fallback attempt
        if ('setText' in field && typeof field.setText === 'function') {
          (field as PDFTextField).setText(stringValue);
        }
      } catch (error) {
        console.error(`❌ Failed to set field ${key}:`, error);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing field ${key}:`, error);
  }
}

export async function fillAndFlattenPdf(
  templateBytes: Uint8Array,
  formData: Record<string, unknown>,
  signatures: PdfSignature[] = []
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Debug: Log all field names and types
  console.log("📋 Form fields:");
  form.getFields().forEach(field => {
    console.log(`- ${field.getName()}: ${field.constructor.name}`);
  });

  // Fill all form fields
  for (const [key, val] of Object.entries(formData)) {
    if (val == null) {
      console.log(`🚫 Skipping null value for ${key}`);
      continue;
    }
    await handleField(form, key, val);
  }

  // Update appearances with embedded font
  try {
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    await form.updateFieldAppearances(font);
    console.log("🔄 Field appearances updated");
  } catch (error) {
    console.error("❌ Failed to update field appearances:", error);
    // Try fallback font
    try {
      const fallbackFont = await pdfDoc.embedFont(StandardFonts.Courier);
      await form.updateFieldAppearances(fallbackFont);
      console.log("🔄 Used fallback font (Courier)");
    } catch (fallbackError) {
      console.error("❌ Fallback font failed:", fallbackError);
    }
  }

  // Handle signatures
  for (const { key, dataUrl } of signatures) {
    if (!dataUrl || dataUrl === "data:,") {
      console.log(`🚫 Empty signature for ${key}, skipping`);
      continue;
    }
    
    const pos = SIGNATURE_POSITIONS[key as keyof typeof SIGNATURE_POSITIONS];
    if (!pos) {
      console.warn(`⚠️ No position defined for signature ${key}`);
      continue;
    }

    try {
      const page = pdfDoc.getPage(pos.pageIndex);
      const base64 = dataUrl.split(",")[1];
      if (!base64) {
        console.warn(`⚠️ Invalid data URL for signature ${key}`);
        continue;
      }

      const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      
      // Try PNG first, then JPG
      const img = await pdfDoc.embedPng(imgBytes).catch(async () => {
        console.log("🖼️ Falling back to JPG embedding");
        return await pdfDoc.embedJpg(imgBytes);
      });

      // Calculate position
      const pageHeight = page.getHeight();
      const yPos = pageHeight - pos.y - pos.height;
      
      page.drawImage(img, {
        x: pos.x,
        y: yPos,
        width: pos.width,
        height: pos.height
      });
      
      console.log(`✅ Signature placed for ${key}`);
    } catch (error) {
      console.error(`❌ Failed to place signature ${key}:`, error);
    }
  }

  // Save without flattening to preserve form fields
  const pdfBytes = await pdfDoc.save();
  console.log(`💾 PDF saved (${(pdfBytes.length / 1024 / 1024).toFixed(2)} MB)`);
  
  return pdfBytes;
}
