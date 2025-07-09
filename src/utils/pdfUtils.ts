// src/utils/pdfUtils.ts
import {
  PDFDocument,
  PDFCheckBox,
  PDFTextField,
  StandardFonts,
  rgb,
  PDFField,
  PDFDropdown,
  PDFOptionList,
  PDFButton,
} from "pdf-lib";
import { STATE_NAMES } from './stateAbbreviations';

export interface PdfSignature {
  key: string;
  dataUrl: string | null;
}

const SIGNATURE_POSITIONS: Record<
  string,
  { pageIndex: number; x: number; y: number; width: number; height: number }
> = {
  SellerSignature:     { pageIndex: 0, x:  25, y:  690, width: 200, height:  15 },
  OwnerSignature:      { pageIndex: 0, x: 25, y:  720, width: 200, height:  15 },
  AdditionalSignature: { pageIndex: 0, x:  25, y:  747, width: 200, height:  15 },
};

// State fields to convert abbreviations to full names
const STATE_FIELDS = [
  "applicantState",
  "stateOfId",
  "previousOwnerState",
  "renewalState",
  "vehicalLocationState",
  "FirstLienholderState",
  "taxPaidToState",
  "residentPreviousState"
];

// Helper function to safely get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

// Enhanced field handler
async function handleField(
  form: any,
  key: string,
  value: any
): Promise<void> {
  try {
    // Try to get field by name
    const field = form.getField(key);
    const fieldType = field.constructor.name;
    console.log(`📊 Field ${key} is of type: ${fieldType}`);

    // Handle all field types generically
    if (fieldType.includes('CheckBox')) {
      const shouldCheck = value === true || value === "true" || value === 1 || value === "1";
      console.log(`🔘 Checkbox ${key}: shouldCheck = ${shouldCheck}`);
      
      if (shouldCheck) {
        field.check();
        console.log(`✅ Checked ${key}`);
      } else {
        field.uncheck();
        console.log(`☑️ Unchecked ${key}`);
      }
    }
    else if (fieldType.includes('TextField')) {
      const textVal = String(value).slice(0, 1000);
      field.setText(textVal);
      console.log(`📝 Set text field ${key} to: "${textVal.slice(0, 50)}${textVal.length > 50 ? '...' : ''}"`);
    }
    else if (fieldType.includes('Dropdown') || fieldType.includes('OptionList')) {
      try {
        field.select(value);
        console.log(`🔽 Set dropdown ${key} to: ${value}`);
      } catch {
        // Fallback to text if option doesn't exist
        const textVal = String(value).slice(0, 1000);
        field.setText(textVal);
        console.log(`📝 Set dropdown (as text) ${key} to: "${textVal.slice(0, 50)}${textVal.length > 50 ? '...' : ''}"`);
      }
    }
    else if (fieldType.includes('Button')) {
      // Handle buttons if needed
      console.log(`🔘 Button field ${key} detected - no action taken`);
    }
    else {
      // Generic field value setting
      try {
        field.setText(String(value));
        console.log(`ℹ️ Set generic field ${key} to: ${String(value).slice(0, 50)}`);
      } catch (error) {
        console.warn(`⚠️ Could not set value for field ${key} (${fieldType})`);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing field ${key}: ${getErrorMessage(error)}`);
  }
}

export async function fillAndFlattenPdf(
  templateBytes: Uint8Array,
  formData: Record<string, any>,
  signatures: PdfSignature[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Debug: Log all form fields
  const allFields = form.getFields().map(f => ({ 
    name: f.getName(), 
    type: f.constructor.name
  }));
  console.log("📋 All form fields:", allFields);

  // 1) Fill all form fields using enhanced handler
  for (const [key, val] of Object.entries(formData)) {
    if (val == null) {
      console.log(`🚫 Skipping null value for key: ${key}`);
      continue;
    }

    // Convert state abbreviations to full names
    if (STATE_FIELDS.includes(key) && typeof val === 'string') {
      const fullName = STATE_NAMES[val] || val;
      console.log(`🗺️ Converting state ${val} to ${fullName} for ${key}`);
      await handleField(form, key, fullName);
    } else {
      await handleField(form, key, val);
    }
  }

  // 2) Update appearances to ensure fields are visible
  try {
    console.log("🎨 Updating field appearances...");
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    form.updateFieldAppearances(helvetica);
    console.log("✅ Field appearances updated");
  } catch (error) {
    console.error("❌ Failed to update field appearances:", getErrorMessage(error));
  }

  // 3) Remove signature fields to prevent overlap
  console.log("🗑️ Removing signature form fields...");
  signatures.forEach(({ key }) => {
    try {
      const field = form.getField(key);
      form.removeField(field);
      console.log(`✅ Removed signature field: ${key}`);
    } catch (error) {
      console.warn(`⚠️ Could not remove signature field ${key}: ${getErrorMessage(error)}`);
    }
  });

  // 4) Draw signatures as page content
  for (const { key, dataUrl } of signatures) {
    if (!dataUrl || dataUrl === "data:,") {
      console.log(`🚫 Empty signature for ${key}, skipping`);
      continue;
    }
    
    const pos = SIGNATURE_POSITIONS[key];
    if (!pos) {
      console.warn(`⚠️ No signature position for "${key}"`);
      continue;
    }

    try {
      console.log(`🖋️ Placing signature at ${key} position:`, pos);
      const page = pdfDoc.getPage(pos.pageIndex);
      const pageH = page.getHeight();
      const y = pageH - pos.y - pos.height;

      // Process image
      const base64 = dataUrl.split(",")[1]!;
      const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      
      let img;
      try {
        img = await pdfDoc.embedPng(imgBytes);
        console.log(`🖼️ Embedded PNG signature`);
      } catch {
        try {
          img = await pdfDoc.embedJpg(imgBytes);
          console.log(`🖼️ Embedded JPG signature`);
        } catch (error) {
          console.error(`❌ Failed to embed signature image: ${getErrorMessage(error)}`);
          continue;
        }
      }

      // Calculate dimensions
      const ratio = img.width / img.height;
      let w = pos.width;
      let h = pos.height;
      if (w / h > ratio) w = h * ratio;
      else h = w / ratio;

      const x = pos.x + (pos.width - w) / 2;
      const yy = y + (pos.height - h) / 2;

      page.drawImage(img, { x, y: yy, width: w, height: h });
      console.log(`✅ Signature placed for ${key}`);
    } catch (error) {
      console.error(`❌ Failed to place signature for ${key}: ${getErrorMessage(error)}`);
    }
  }

  // 5) Preserve form functionality by not flattening
  console.log("ℹ️ Skipping form flattening to preserve editable fields");

  console.log("💾 Saving PDF...");
  const pdfBytes = await pdfDoc.save();
  console.log(`✅ PDF saved successfully (${pdfBytes.length} bytes)`);
  
  return pdfBytes;
}
