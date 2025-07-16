// src/components/Responsive130UForm.tsx
import {useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { STATE_ABBREVIATIONS} from '../utils/stateAbbreviations';


interface FieldDef {
  id: string;
  label: string;
  type: "text" | "checkbox" | "signature" | "dropdown";
  required?: boolean;
}

export interface Responsive130UFormProps {
  /** Called on every change with the full form state */
  onChange?: (state: Record<string, string | boolean>) => void;
  /** CSS class to apply to each section wrapper */
  sectionClass?: string;
  /** CSS class to apply to each section's inner grid container */
  gridClass?: string;
  initialValues?: Record<string, string | boolean>;
}

const STATE_FIELDS = new Set([
  "applicantState",
  "stateOfId",
  "previousOwnerState",
  "renewalState",
  "vehicalLocationState",
  "FirstLienholderState",
  "taxPaidToState",
  "residentPreviousState"
]);

// Updated fields array with signature type instead of image
export const fields: FieldDef[] = [
  // 0–3: "Applying for" checkboxes
  { id: "titleRegistration",           label: "Title & Registration",                  type: "checkbox" },
  { id: "titleOnly",                   label: "Title Only",                              type: "checkbox" },
  { id: "registrationPurposesOnly",    label: "Registration Purposes Only",               type: "checkbox" },
  { id: "nonTitleRegistration",        label: "Nontitle Registration",                   type: "checkbox" },

  // 4–6: "Corrected title or registration, check reason"
  { id: "vehicleDescription",          label: "Vehicle Description",                     type: "checkbox" },
  { id: "addRemoveLien",               label: "Add/Remove Lien",                        type: "checkbox" },
  { id: "otherReason",                 label: "Other (specify below)",                  type: "checkbox" },

  // 7: "Other reason" free-form
  { id: "otherReasonText",             label: "Other Reason For Correction",             type: "text" },

  // 8–14: Vehicle details
  { id: "vehicleIdentificationNumber", label: "1. Vehicle Identification Number",        type: "text" },
  { id: "vehicleYear",                 label: "2. Year",                                 type: "text" },
  { id: "vehicleMake",                 label: "3. Make",                                 type: "text" },
  { id: "vehicleBodyStyle",            label: "4. Body Style",                           type: "text" },
  { id: "vehicleModel",                label: "5. Model",                                type: "text" },
  { id: "majorColor",                  label: "6. Major Color",                          type: "text" },
  { id: "minorColor",                  label: "7. Minor Color",                          type: "text" },

  //15-22
  { id: "texasLicensePlate",          label: "8. Texas License Plate No",                       type: "text" },
  { id: "odometerReading",            label: "9. Odometer Reading (no tenths)",                 type: "text" },
  { id: "notActualMileage",           label: "10.Not Actual",                                      type: "checkbox" },
  { id: "exceedsMechanicalLimits",    label: "10.Exceeds Mechanical Limits",                       type: "checkbox" },
  { id: "exemptMileage",              label: "10.Exempt",                                          type: "checkbox" },
  { id: "emptyWeight",                label: "11. Empty Weight",                                type: "text" },
  { id: "carryingCapacity",           label: "12. Carrying Capacity (if any)",                  type: "text" },

  //23-29
  { id: "individual",                 label: "13.Individual",                                      type: "checkbox" },
  { id: "business",                   label: "13.Business",                                        type: "checkbox" },
  { id: "government",                 label: "13.Government",                                      type: "checkbox" },
  { id: "trust",                      label: "13.Trust",                                           type: "checkbox" },
  { id: "nonProfit",                  label: "13.NonProfit",                                       type: "checkbox" },
  { id: "photoIdNumber",             label: "14. Applicant Photo ID Number or FEIN/EIN",       type: "text" },

  //
  { id: "usDriverLicense",           label: "15.U.S. Driver License/ID Card",                     type: "checkbox" },
  { id: "stateOfId",                 label: "15.State of ID/DL",                                  type: "dropdown" },
  { id: "passport",                  label: "15.Passport",                                        type: "checkbox" },
  { id: "passportIssued",           label: "15.Passport Issued",                                  type: "text" },
  { id: "uscisId",                   label: "15.U.S. Citizenship & Immigration Services/DOJ ID",   type: "checkbox" },
  { id: "natoId",                    label: "15.NATO ID",                                          type: "checkbox" },
  { id: "usMilitaryId",             label: "15.US Military ID",                                   type: "checkbox" },
  { id: "militaryStatusId",         label: "15.Other Military Status of Forces Photo ID",         type: "checkbox" },
  { id: "usDeptStateId",            label: "15.US Dept of State ID",                              type: "checkbox" },
  { id: "usDeptHomelandId",         label: "15.US Dept of Homeland Security ID",                  type: "checkbox" },

//
  { id: "applicantName",            label: "16. Applicant First Name or Entity Name...",       type: "text" },
  { id: "applicantMiddleName",      label: "16.Applicant Middle Name",       type: "text" },
  { id: "applicantLastName",      label: "16.Applicant Last Name",       type: "text" },
  { id: "applicantSuffix",            label: "16. Applicant Suffix",       type: "text" },

//
  { id: "additionalApplicantName",  label: "17. Additional Applicant First Name...",           type: "text" },
  { id: "additionalApplicantMiddleName",      label: "17.Applicant Middle Name",       type: "text" },
  { id: "additionalApplicantLastName",      label: "17.Applicant Last Name",       type: "text" },
  { id: "additionalApplicantSuffix",            label: "17. Applicant Suffix",       type: "text" },

// 18
  { id: "applicantMailingAddress",         label: "18. Applicant Mailing Address",     type: "text" },
  { id: "applicantCity",         label: "18.Applicant City",     type: "text" },
  { id: "applicantState",         label: "18.Applicant State",     type: "dropdown" },
  { id: "applicantZip",         label: "18.Applicant Zip",     type: "text" },
  { id: "applicantCounty",          label: "19. Applicant County of Residence",                type: "text" },
//
  { id: "previousOwner",            label: "20. Previous Owner Name ",        type: "text" },
  { id: "previousCity",            label: "20.Previous Owner City",        type: "text" },
  { id: "previousOwnerState",            label: "20.Previous Owner State ",        type: "dropdown" },
  { id: "dealerGDN",                label: "21. Dealer GDN (if applicable)",                   type: "text" },
  { id: "unitNumber",               label: "22. Unit Number (if applicable)",                  type: "text" },
//
  { id: "renewalRecipientFirstName",         label: "23. Renewal Recipient First Name", type: "text" },
  { id: "renewalRecipientMiddleName",         label: "23.Renewal Recipient Middle Name", type: "text" },
  { id: "renewalRecipientLastName",         label: "23.Renewal Recipient Last Name", type: "text" },
  { id: "renewalRecipientSuffix",         label: "23.Renewal Recipient Suffix", type: "text" },
//
  { id: "renewalMailingAddress",           label: "24. Renewal Notice Mailing Address",            type: "text" },
  { id: "renewalCity",           label: "24.Renewal Notice City",            type: "text" },
  { id: "renewalState",           label: "24.Renewal Notice Mailing State",            type: "dropdown" },
  { id: "renewalZip",           label: "24.Renewal Notice Mailing Zip",            type: "text" },
//
  { id: "phoneNumber",              label: "25. Applicant Phone Number (optional)",            type: "text" },
  { id: "email",                    label: "26. Email (optional)",                             type: "text" },
  { id: "emailConsent",             label: "27.Yes Provide Email in 26",                          type: "checkbox" },
  { id: "attachVTR216",             label: "28.Yes Attach Form VTR-216",                          type: "checkbox" },
//
  { id: "vehicleLocation",          label: "29.Vehicle Location Address if different",     type: "text" },
  { id: "vehicleLocationCity",          label: "29.Vehicle Location City",     type: "text" },
  { id: "vehicalLocationState",          label: "29.Vehicle Location State",     type: "dropdown" },
  { id: "vehicleLocationZip",          label: "29.Vehicle Location Zip",     type: "text" },
//
  { id: "attachVTR267",             label: "30.Yes Attach Form VTR-267",                          type: "checkbox" },
  { id: "noElectronicTitle",        label: "31.Yes Cannot check 30",                              type: "checkbox" },
  { id: "lienholderId",             label: "32. Certified/eTitle Lienholder ID Number",        type: "text" },
  { id: "firstLienDate",            label: "33. First Lien Date (if any)",                     type: "text" },
//
  { id: "lienholderNameAddress",    label: "34.First Lienholder Name",     type: "text" },
  { id: "lienholderMailingAddress",    label: "34.First Lienholder Mailing Address",     type: "text" },
  { id: "lienholderCity",    label: "34.First Lienholder City",     type: "text" },
  { id: "FirstLienholderState",    label: "34.First Lienholder State",     type: "dropdown" },
  { id: "lienholderZip",    label: "34.First Lienholder Zip",     type: "text" },
//
  { id: "rentalPermit",             label: "35.I Hold Motor Vehicle Retailer (Rental) Permit Number", type: "checkbox" },
  { id: "permitNumber",             label: "35.Permit Number",                                    type: "text" },
  { id: "dealerOrLessor",           label: "35.Yes, I am a dealer or lessor that qualifies...",    type: "checkbox" },
  { id: "gdnOrLessorNumber",        label: "35.GDN or Lessor Number",                             type: "text" },
//
  { id: "tradeIn",                  label: "36.Trade-in (if any)",                                type: "checkbox" },
  { id: "tradeInYear",           label: "36.Trade-In Year",                type: "text" },
  { id: "tradeInMake",           label: "36.Trade-In Make",                type: "text" },
  { id: "tradeInVin",           label: "36.Trade-In Vehicle Identification Number",                type: "text" },
  { id: "additionalTradeIns",       label: "37.Additional Trade-ins",                             type: "checkbox" },
//
  { id: "salesAndUseTax",           label: "38.Sales and Use Tax",                                type: "checkbox" },
  { id: "rebateAmount",             label: "38.a.Rebate Amount",                                    type: "text" },
  { id: "salesPriceMinusRebate",    label: "38.a.Sales Price Minus Rebate Amount",                  type: "text" },
  { id: "tradeInAmount",            label: "38.b.Trade In Amount",                                  type: "text" },
  { id: "fmvDeduction",             label: "38.c.Fair Market Value Deduction",                      type: "text" },
  { id: "taxableAmount",            label: "38.d.Taxable Amount",                                   type: "text" },
  { id: "taxOnTaxableAmount",       label: "38.e.6.25% Tax on Taxable Amount",                      type: "text" },
  { id: "penalty5Percent",          label: "38.f.Late Tax Payment Penalty of 5%",                   type: "checkbox" },
  { id: "penalty10Percent",         label: "38.f.Late Tax Payment Penalty of 10%",                  type: "checkbox" },
  { id: "penaltyAmount",            label: "38.g.Late Tax Payment Penalty Amount",                  type: "text" },
  { id: "taxPaidToState",         label: "38.g.State Taxes Were Paid To",                         type: "dropdown" },
  { id: "amountTaxesPaid",          label: "38.g.Amount of Taxes Paid to Previous State",           type: "text" },
  { id: "amountDue",                label: "38.h.Amount of Tax and Penalty Due",                    type: "text" },
  { id: "newResidentTax",           label: "$90 New Resident Tax",                             type: "checkbox" },
  { id: "residentPreviousState",    label: "Resident's previous state",                        type: "dropdown" },
  { id: "evenTradeTax",             label: "$5 Even Trade Tax",                                type: "checkbox" },
  { id: "giftTax",                  label: "$10 Gift Tax Attach Comptroller Form 14-317",      type: "checkbox" },
  { id: "salvageFee",               label: "$65 Rebuilt Salvage Fee",                          type: "checkbox" },
  { id: "emissionsFee25",           label: "2.5% Emissions Fee",                               type: "text" },
  { id: "emissionsFee25Diesel",     label: "2.5% Emissions Fee Diesel Vehicles 1996...",       type: "checkbox" },
  { id: "emissionsFee1",            label: "1% Emissions Fee",                                 type: "text" },
  { id: "emissionsFee1Diesel",      label: "1% Emissions Fee Diesel Vehicles 1997...",         type: "checkbox" },
  { id: "taxExemptionReason",       label: "Sales Tax Exemption Reason",                       type: "text" },
  { id: "taxExemption",           label: "Exemption claimed under the Motor vehicle Sales and Use Tax Law because:",type: "checkbox" },
  { id: "applicationFee",           label: "$28 or $33 Application Fee for Texas Title",       type: "checkbox" },
  
  //
  { id: "inspectionVerified",       label: "Check if applicable I have physically inspected...", type: "checkbox" },
  { id: "unrecoveredStolen",        label: "The vehicle is unrecovered stolen...",             type: "checkbox" },
  { id: "correctedTitleLost",       label: "I certify I am applying for a corrected title...", type: "checkbox" },
  //
  { id: "sellerName",               label: "Seller Name",                                      type: "text" },
  { id: "sellerDate",               label: "Date",                                             type: "text" },
  { id: "applicantOwner",           label: "Applicant Owner",                                  type: "text" },
  { id: "applicantDate",            label: "Date_2",                                           type: "text" },
  { id: "additionalApplicant",      label: "Additional Applicant",                             type: "text" },
  { id: "additionalApplicantDate",  label: "Date_3",                                           type: "text" },
  //
];
// Define sections by index ranges
const sections = [
  { title: "Applying For",                         from: 0,   to: 3   },
  { title: "Correction Reason",                    from: 4,   to: 7   },
  { title: "Vehicle Details",                      from: 8,   to: 14  },
  { title: "Odometer & Weights",                   from: 15,  to: 21  },
  { title: "Applicant Type & Identification",      from: 22,  to: 37  },
  { title: "Names & Addresses",                    from: 38,  to: 50  },
  { title: "Previous Owner & Dealer Info",         from: 51,  to: 55  },
  { title: "Renewal Recipient & Mailing",          from: 56,  to: 63  },
  { title: "Contact & Attachments",                from: 64,  to: 67  },
  { title: "Vehicle Location & E-Title",           from: 68,  to: 73  },
  { title: "Lien Information",                     from: 74,  to: 80  },
  { title: "Dealership & Trade-Ins",               from: 81,  to: 89  },
  { title: "Sales & Use Tax",                      from: 90,  to: 114 },
  { title: "Certify & Signatures",                 from: 118, to: 123 },
];


type SigPad = InstanceType<typeof SignatureCanvas>;

export default function Responsive130UForm({
  onChange,
  sectionClass = "",
  gridClass = "",
  initialValues = {},
}: Responsive130UFormProps) {
  // Refs for signature pads
  const sellerSigRef = useRef<SigPad>(null);
  const ownerSigRef = useRef<SigPad>(null);
  const additionalSigRef = useRef<SigPad>(null);

  const getSigRef = (id: string) => {
    switch (id) {
      case "SellerSignature": return sellerSigRef;
      case "OwnerSignature": return ownerSigRef;
      case "AdditionalSignature": return additionalSigRef;
      default: return null;
    }
  };

  const getSignatureData = (id: string): string | null => {
    const ref = getSigRef(id);
    if (!ref?.current || ref.current.isEmpty()) return null;
    return ref.current.getCanvas().toDataURL("image/png");
  };

  const updateSignature = (id: string) => {
    const sigData = getSignatureData(id);
    const updated = { ...initialValues, [id]: sigData || "" };
    onChange?.(updated);
  };

  const handleChange = (id: string, value: string | boolean) => {
    const updated = { ...initialValues, [id]: value };
    onChange?.(updated);
  };

   const renderField = (f: FieldDef) => {
    if (f.type === "checkbox") {
      return (
        <div key={f.id} className="form-field">
          <label className="checkbox-container">
            <input
              id={f.id}
              type="checkbox"
              checked={!!initialValues[f.id]}
              onChange={(e) => handleChange(f.id, e.target.checked)}
              className="form-checkbox"
            />
            <span className="checkbox-label">
              {f.label}
              {f.required && <span className="text-red-500">*</span>}
            </span>
          </label>
        </div>
      );
    }

    if (f.type === "signature") {
      const ref = getSigRef(f.id);
      return (
        <div key={f.id} className="form-field signature-field">
          <label className="form-label">
            {f.label}
            {f.required && <span className="text-red-500">*</span>}
          </label>
          <div className="signature-container">
            <SignatureCanvas
              ref={ref}
              penColor="black"
              canvasProps={{
                width: 400,
                height: 100,
                className: "signature-canvas",
                style: { border: "1px solid #ccc", borderRadius: "4px" }
              }}
              onEnd={() => updateSignature(f.id)}
            />
            <button
              type="button"
              onClick={() => { ref?.current?.clear(); updateSignature(f.id); }}
              className="clear-signature-btn"
            >
              Clear
            </button>
          </div>
        </div>
      );
    }

    // Handle dropdowns for state fields
    if (STATE_FIELDS.has(f.id)) {
      return (
        <div key={f.id} className="form-field">
          <label htmlFor={f.id} className="form-label">
            {f.label}
            {f.required && <span className="text-red-500">*</span>}
          </label>
          <select
            id={f.id}
            value={String(initialValues[f.id] || "")}
            onChange={(e) => handleChange(f.id, e.target.value)}
            className="form-input"
          >
            <option value="">Select State</option>
            {STATE_ABBREVIATIONS.map(abbr => (
              <option key={abbr} value={abbr}>{abbr}</option>
            ))}
          </select>
        </div>
      );
    }

    // Handle text inputs
    return (
      <div key={f.id} className="form-field">
        <label htmlFor={f.id} className="form-label">
          {f.label}
          {f.required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={f.id}
          type="text"
          value={String(initialValues[f.id] || "")}
          onChange={(e) => handleChange(f.id, e.target.value)}
          className="form-input"
        />
      </div>
    );
  };

  return (
    <>
      {sections.map(({ title, from, to }) => (
        <section key={title} className={sectionClass}>
          <div className="section-header">
            <h2 className="section-title">{title}</h2>
            <hr />
          </div>
          <div className={gridClass}>
            {fields.slice(from, to + 1).map(renderField)}
          </div>
        </section>
      ))}
    </>
  );
}