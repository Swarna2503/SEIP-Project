// src/types/formSchema.ts

/** 
 * Describes one editable region on the PDF. 
 *   - key: unique string (used in state and when merging)
 *   - pageNumber: 1 or 2
 *   - x, y, width, height: in CSS pixels relative to the canvas’s top-left
 *   - required: true if the user must fill it before submit
 */
export interface PDFFieldDescriptor {
  key: string;
  pageNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  required: boolean;
}

/**
 * Below is a skeleton of page 1. 
 * Replace each x/y/width/height with measurements from Acrobat.
 */
export const formSchema: PDFFieldDescriptor[] = [
  // ─── Section: Applying for (checkboxes) ─────────────────────────────────
  {
    key: "applying.titleAndRegistration",
    pageNumber: 1,
    x:  60,   // ← measured “Left” for the first checkbox (“Title & Registration”)
    y:  50,   // ← measured “Top”
    width: 15,
    height: 15,
    required: true, // or false, if it’s optional
  },
  {
    key: "applying.titleOnly",
    pageNumber: 1,
    x: 160,  // ← “Left” for “Title Only” checkbox
    y: 50,
    width: 15,
    height: 15,
    required: false,
  },
  {
    key: "applying.registrationOnly",
    pageNumber: 1,
    x: 260,  // ← “Left” for “Registration Purposes Only” checkbox
    y: 50,
    width: 15,
    height: 15,
    required: false,
  },
  {
    key: "applying.nontitle",
    pageNumber: 1,
    x: 380,  // ← “Left” for “Nontitle Registration” checkbox
    y: 50,
    width: 15,
    height: 15,
    required: false,
  },

  // ─── Section: Vehicle Identification & Description ─────────────────────
  {
    key: "vehicle.vin",
    pageNumber: 1,
    x: 110,   // ← measured “Left” for “Vehicle Identification Number” box
    y: 100,   // ← measured “Top”
    width: 200,
    height: 20,
    required: true,
  },
  {
    key: "vehicle.year",
    pageNumber: 1,
    x: 350,   // ← “Left” for “Year”
    y: 100,
    width: 50,
    height: 20,
    required: true,
  },
  {
    key: "vehicle.make",
    pageNumber: 1,
    x: 440,   // ← “Left” for “Make”
    y: 100,
    width: 120,
    height: 20,
    required: true,
  },
  {
    key: "vehicle.bodyStyle",
    pageNumber: 1,
    x: 620,   // ← “Left” for “Body Style”
    y: 100,
    width: 100,
    height: 20,
    required: true,
  },
  {
    key: "vehicle.model",
    pageNumber: 1,
    x: 110,   // ← “Left” for “Model”
    y: 140,   // ← “Top” for next row
    width: 120,
    height: 20,
    required: true,
  },
  {
    key: "vehicle.majorColor",
    pageNumber: 1,
    x: 350,   // ← “Left” for “Major Color”
    y: 140,
    width: 120,
    height: 20,
    required: true,
  },
  {
    key: "vehicle.minorColor",
    pageNumber: 1,
    x: 620,   // ← “Left” for “Minor Color”
    y: 140,
    width: 120,
    height: 20,
    required: false,
  },
  {
    key: "vehicle.licensePlate",
    pageNumber: 1,
    x: 110,   // ← “Left” for “Texas License Plate No.”
    y: 180,
    width: 140,
    height: 20,
    required: true,
  },
  {
    key: "vehicle.odometer",
    pageNumber: 1,
    x: 300,   // ← “Left” for “Odometer Reading (no tenths)”
    y: 180,
    width: 100,
    height: 20,
    required: true,
  },
  {
    key: "vehicle.emptyWeight",
    pageNumber: 1,
    x: 440,   // ← “Left” for “Empty Weight”
    y: 180,
    width: 100,
    height: 20,
    required: false,
  },
  {
    key: "vehicle.carryingCapacity",
    pageNumber: 1,
    x: 620,   // ← “Left” for “Carrying Capacity (if any)”
    y: 180,
    width: 120,
    height: 20,
    required: false,
  },

  // ─── Section: Applicant Type & Photo ID ────────────────────────────────
  {
    key: "applicant.individual",
    pageNumber: 1,
    x: 110,   // ← “Left” for “Individual” checkbox
    y: 230,
    width: 15,
    height: 15,
    required: false,
  },
  {
    key: "applicant.business",
    pageNumber: 1,
    x: 180,   // ← “Left” for “Business” checkbox
    y: 230,
    width: 15,
    height: 15,
    required: false,
  },
  {
    key: "applicant.government",
    pageNumber: 1,
    x: 260,   // ← “Left” for “Government” checkbox
    y: 230,
    width: 15,
    height: 15,
    required: false,
  },
  {
    key: "applicant.trust",
    pageNumber: 1,
    x: 340,   // ← “Left” for “Trust” checkbox
    y: 230,
    width: 15,
    height: 15,
    required: false,
  },
  {
    key: "applicant.nonprofit",
    pageNumber: 1,
    x: 420,   // ← “Left” for “Non-Profit” checkbox
    y: 230,
    width: 15,
    height: 15,
    required: false,
  },
  {
    key: "applicant.photoId",
    pageNumber: 1,
    x: 110,   // ← “Left” for “Applicant Photo ID Number or FEIN/EIN” text box
    y: 260,
    width: 250,
    height: 20,
    required: true,
  },

  // ─── Section: Applicant Name & Address ────────────────────────────────
  {
    key: "applicant.firstName",
    pageNumber: 1,
    x: 110,   // ← “Left” for “Applicant First Name (or Entity Name)”
    y: 300,
    width: 200,
    height: 20,
    required: true,
  },
  {
    key: "applicant.middleName",
    pageNumber: 1,
    x: 330,   // ← “Left” for “Middle Name”
    y: 300,
    width: 150,
    height: 20,
    required: false,
  },
  {
    key: "applicant.lastName",
    pageNumber: 1,
    x: 500,   // ← “Left” for “Last Name”
    y: 300,
    width: 200,
    height: 20,
    required: true,
  },
  {
    key: "applicant.suffix",
    pageNumber: 1,
    x: 740,   // ← “Left” for “Suffix (if any)”
    y: 300,
    width: 80,
    height: 20,
    required: false,
  },
  {
    key: "applicant.address",
    pageNumber: 1,
    x: 110,   // ← “Left” for “Applicant Mailing Address”
    y: 340,
    width: 600,
    height: 20,
    required: true,
  },
  {
    key: "applicant.city",
    pageNumber: 1,
    x: 110,   // ← “Left” for “City”
    y: 380,
    width: 180,
    height: 20,
    required: true,
  },
  {
    key: "applicant.state",
    pageNumber: 1,
    x: 310,   // ← “Left” for “State”
    y: 380,
    width: 60,
    height: 20,
    required: true,
  },
  {
    key: "applicant.zip",
    pageNumber: 1,
    x: 390,   // ← “Left” for “Zip”
    y: 380,
    width: 80,
    height: 20,
    required: true,
  },
  {
    key: "applicant.countyOfResidence",
    pageNumber: 1,
    x: 500,   // ← “Left” for “Applicant County of Residence”
    y: 380,
    width: 180,
    height: 20,
    required: true,
  },

  // ─── Section: Previous Owner & Dealer GDN (if applicable) ──────────────
  {
    key: "previousOwner.name",
    pageNumber: 1,
    x: 110,   // ← “Left” for “Previous Owner Name (or Entity Name)”
    y: 420,
    width: 200,
    height: 20,
    required: false,
  },
  {
    key: "previousOwner.city",
    pageNumber: 1,
    x: 330,   // ← “Left” for that field’s “City”
    y: 420,
    width: 120,
    height: 20,
    required: false,
  },
  {
    key: "previousOwner.state",
    pageNumber: 1,
    x: 500,   // ← “Left” for “State”
    y: 420,
    width: 60,
    height: 20,
    required: false,
  },
  {
    key: "previousOwner.dealerGDN",
    pageNumber: 1,
    x: 580,   // ← “Left” for “Dealer GDN (if applicable)”
    y: 420, 
    width: 120,
    height: 20,
    required: false,
  },
  {
    key: "previousOwner.unitNumber",
    pageNumber: 1,
    x: 740,   // ← “Left” for “Unit No. (if applicable)”
    y: 420,
    width: 80,
    height: 20,
    required: false,
  },

  // ─── Section: Renewal Recipient & Mailing (if different) ─────────────────
  {
    key: "renewalRecipient.firstName",
    pageNumber: 1,
    x: 110,   // ← “Left” for “Renewal Recipient First Name (if different)”
    y: 460,
    width: 200,
    height: 20,
    required: false,
  },
  {
    key: "renewalRecipient.middleName",
    pageNumber: 1,
    x: 330,   // ← “Left” for “Middle Name”
    y: 460,
    width: 150,
    height: 20,
    required: false,
  },
  {
    key: "renewalRecipient.lastName",
    pageNumber: 1,
    x: 500,   // ← “Left” for “Last Name”
    y: 460,
    width: 200,
    height: 20,
    required: false,
  },
  {
    key: "renewalRecipient.suffix",
    pageNumber: 1,
    x: 740,   // ← “Left” for “Suffix (if any)”
    y: 460,
    width: 80,
    height: 20,
    required: false,
  },
  {
    key: "renewalMail.address",
    pageNumber: 1,
    x: 110,   // ← “Left” for “Renewal Notice Mailing Address (if different)”
    y: 500,
    width: 600,
    height: 20,
    required: false,
  },
  {
    key: "renewalMail.city",
    pageNumber: 1,
    x: 110,   // ← “Left” for “City”
    y: 540,
    width: 180,
    height: 20,
    required: false,
  },
  {
    key: "renewalMail.state",
    pageNumber: 1,
    x: 310,   // ← “Left” for “State”
    y: 540,
    width: 60,
    height: 20,
    required: false,
  },
  {
    key: "renewalMail.zip",
    pageNumber: 1,
    x: 390,   // ← “Left” for “Zip”
    y: 540,
    width: 80,
    height: 20,
    required: false,
  },

  // ─── Section: Applicant Phone & Email (optional), Renewal eReminder ──────
  {
    key: "applicant.phone",
    pageNumber: 1,
    x: 110,  // ← “Left” for “Applicant Phone Number (optional)”
    y: 580,
    width: 150,
    height: 20,
    required: false,
  },
  {
    key: "applicant.email",
    pageNumber: 1,
    x: 300,  // ← “Left” for “Email (optional)”
    y: 580,
    width: 200,
    height: 20,
    required: false,
  },
  {
    key: "applicant.eReminder",
    pageNumber: 1,
    x: 540,  // ← “Left” for “Registration Renewal eReminder – Yes (Provide Email in #26)”
    y: 580,
    width: 15,
    height: 15,
    required: false,
  },
  {
    key: "applicant.communicationImpediment",
    pageNumber: 1,
    x: 640,  // ← “Left” for “Communication Impediment – Yes (Attach Form VTR-216)”
    y: 580,
    width: 15,
    height: 15,
    required: false,
  },

  // ─── Section: Vehicle Location Address (if different) ────────────────────
  {
    key: "vehicle.locationAddress",
    pageNumber: 1,
    x: 110,   // ← “Left” for “Vehicle Location Address (if different)”
    y: 620,
    width: 500,
    height: 20,
    required: false,
  },
  {
    key: "vehicle.locationCity",
    pageNumber: 1,
    x: 110,   // ← “Left” for “City”
    y: 660,
    width: 180,
    height: 20,
    required: false,
  },
  {
    key: "vehicle.locationState",
    pageNumber: 1,
    x: 310,   // ← “Left” for “State”
    y: 660,
    width: 60,
    height: 20,
    required: false,
  },
  {
    key: "vehicle.locationZip",
    pageNumber: 1,
    x: 390,   // ← “Left” for “Zip”
    y: 660,
    width: 80,
    height: 20,
    required: false,
  },

  // ─── Section: Multiple (Additional) Lien, Electronic Title Request, etc. ───
  {
    key: "lien.multiple",
    pageNumber: 1,
    x: 110,  // ← “Left” for “Multiple (Additional) Liens – Yes (Attach Form VTR-267)”
    y: 700,
    width: 15,
    height: 15,
    required: false,
  },
  {
    key: "lien.electronicTitleRequest",
    pageNumber: 1,
    x: 260,  // ← “Left” for “Electronic Title Request – Yes (Cannot check #30)”
    y: 700,
    width: 15,
    height: 15,
    required: false,
  },
  {
    key: "lien.certifiedLienholderId",
    pageNumber: 1,
    x: 400,  // ← “Left” for “Certified/eTitle Lienholder ID Number (if any)”
    y: 700,
    width: 200,
    height: 20,
    required: false,
  },
  {
    key: "lien.firstLienDate",
    pageNumber: 1,
    x: 630,  // ← “Left” for “First Lien Date (if any)”
    y: 700,
    width: 120,
    height: 20,
    required: false,
  },

  // ─── Section: First Lienholder Name & Mailing (if any) ────────────────────
  {
    key: "firstLienholder.name",
    pageNumber: 1,
    x: 110,  // ← “Left” for “First Lienholder Name (if any)”
    y: 740,
    width: 200,
    height: 20,
    required: false,
  },
  {
    key: "firstLienholder.mailingAddress",
    pageNumber: 1,
    x: 350,  // ← “Left” for “Mailing Address”
    y: 740,
    width: 300,
    height: 20,
    required: false,
  },
  {
    key: "firstLienholder.city",
    pageNumber: 1,
    x: 110,  // ← “Left” for “City”
    y: 780,
    width: 150,
    height: 20,
    required: false,
  },
  {
    key: "firstLienholder.state",
    pageNumber: 1,
    x: 300,  // ← “Left” for “State”
    y: 780,
    width: 60,
    height: 20,
    required: false,
  },
  {
    key: "firstLienholder.zip",
    pageNumber: 1,
    x: 380,  // ← “Left” for “Zip”
    y: 780,
    width: 80,
    height: 20,
    required: false,
  },

  // ─── …and so on for any remaining fields on page 1 that need editing.───

  // (If you need page 2 fields, add objects here with pageNumber: 2 and their x/y/width/height)
];
