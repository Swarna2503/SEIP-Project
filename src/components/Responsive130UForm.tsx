// src/components/Responsive130UForm.tsx
import React, { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

interface FieldDef {
  id: string;
  label: string;
  type: "text" | "checkbox" | "signature";
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

// Updated fields array with signature type instead of image
const fields: FieldDef[] = [
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
  { id: "notActualMileage",           label: "Not Actual",                                      type: "checkbox" },
  { id: "exceedsMechanicalLimits",    label: "Exceeds Mechanical Limits",                       type: "checkbox" },
  { id: "exemptMileage",              label: "Exempt",                                          type: "checkbox" },
  { id: "emptyWeight",                label: "11. Empty Weight",                                type: "text" },
  { id: "carryingCapacity",           label: "12. Carrying Capacity (if any)",                  type: "text" },

  //23-29
  { id: "individual",                 label: "Individual",                                      type: "checkbox" },
  { id: "business",                   label: "Business",                                        type: "checkbox" },
  { id: "government",                 label: "Government",                                      type: "checkbox" },
  { id: "trust",                      label: "Trust",                                           type: "checkbox" },
  { id: "nonProfit",                  label: "NonProfit",                                       type: "checkbox" },
  { id: "photoIdNumber",             label: "14. Applicant Photo ID Number or FEIN/EIN",       type: "text" },

  //
  { id: "usDriverLicense",           label: "U.S. Driver License/ID Card",                     type: "checkbox" },
  { id: "stateOfId",                 label: "State of ID/DL",                                  type: "text" },
  { id: "passport",                  label: "Passport",                                        type: "checkbox" },
  { id: "passportIssued",           label: "Passport Issued",                                  type: "text" },
  { id: "uscisId",                   label: "U.S. Citizenship & Immigration Services/DOJ ID",   type: "checkbox" },
  { id: "natoId",                    label: "NATO ID",                                          type: "checkbox" },
  { id: "usMilitaryId",             label: "US Military ID",                                   type: "checkbox" },
  { id: "militaryStatusId",         label: "Other Military Status of Forces Photo ID",         type: "checkbox" },
  { id: "usDeptStateId",            label: "US Dept of State ID",                              type: "checkbox" },
  { id: "usDeptHomelandId",         label: "US Dept of Homeland Security ID",                  type: "checkbox" },

//
  { id: "applicantName",            label: "16. Applicant First Name or Entity Name...",       type: "text" },
  { id: "applicantMiddleName",      label: " Applicant Middle Name",       type: "text" },
  { id: "applicantLastName",      label: " Applicant Last Name",       type: "text" },
  { id: "applicantSuffix",            label: "16. Applicant Suffix",       type: "text" },

//
  { id: "additionalApplicantName",  label: "17. Additional Applicant First Name...",           type: "text" },
  { id: "additionalApplicantMiddleName",      label: " Applicant Middle Name",       type: "text" },
  { id: "additionalApplicantLastName",      label: " Applicant Last Name",       type: "text" },
  { id: "additionalApplicantSuffix",            label: "16. Applicant Suffix",       type: "text" },

// 18
  { id: "applicantMailingAddress",         label: "18. Applicant Mailing Address",     type: "text" },
  { id: "applicantCity",         label: " Applicant City",     type: "text" },
  { id: "applicantState",         label: "Applicant State",     type: "text" },
  { id: "applicantZip",         label: "Applicant Zip",     type: "text" },
  { id: "applicantCounty",          label: "19. Applicant County of Residence",                type: "text" },
//
  { id: "previousOwner",            label: "20. Previous Owner Name ",        type: "text" },
  { id: "previousCity",            label: "Previous Owner City",        type: "text" },
  { id: "previousOwnerState",            label: "Previous Owner State ",        type: "text" },
  { id: "dealerGDN",                label: "21. Dealer GDN (if applicable)",                   type: "text" },
  { id: "unitNumber",               label: "22. Unit Number (if applicable)",                  type: "text" },
//
  { id: "renewalRecipientFirstName",         label: "23. Renewal Recipient First Name", type: "text" },
  { id: "renewalRecipientMiddleName",         label: "Renewal Recipient Middle Name", type: "text" },
  { id: "renewalRecipientLastName",         label: "Renewal Recipient Last Name", type: "text" },
  { id: "renewalRecipientSuffix",         label: "Renewal Recipient Suffix", type: "text" },
//
  { id: "renewalMailingAddress",           label: "24. Renewal Notice Mailing Address",            type: "text" },
  { id: "renewalCity",           label: "Renewal Notice City",            type: "text" },
  { id: "renewalState",           label: "Renewal Notice Mailing State",            type: "text" },
  { id: "renewalZip",           label: "Renewal Notice Mailing Zip",            type: "text" },
//
  { id: "phoneNumber",              label: "25. Applicant Phone Number (optional)",            type: "text" },
  { id: "email",                    label: "26. Email (optional)",                             type: "text" },
  { id: "emailConsent",             label: "Yes Provide Email in 26",                          type: "checkbox" },
  { id: "attachVTR216",             label: "Yes Attach Form VTR-216",                          type: "checkbox" },
//
  { id: "vehicleLocation",          label: "29. Vehicle Location Address if different",     type: "text" },
  { id: "vehicleLocationCity",          label: "Vehicle Location City",     type: "text" },
  { id: "vehicleLocationState",          label: "Vehicle Location State",     type: "text" },
  { id: "vehicleLocationZip",          label: "Vehicle Location Zip",     type: "text" },
//
  { id: "attachVTR267",             label: "Yes Attach Form VTR-267",                          type: "checkbox" },
  { id: "noElectronicTitle",        label: "Yes Cannot check 30",                              type: "checkbox" },
  { id: "lienholderId",             label: "32. Certified/eTitle Lienholder ID Number",        type: "text" },
  { id: "firstLienDate",            label: "33. First Lien Date (if any)",                     type: "text" },
//
  { id: "lienholderNameAddress",    label: "34. First Lienholder Name",     type: "text" },
  { id: "lienholderMailingAddress",    label: "First Lienholder Mailing Address",     type: "text" },
  { id: "lienholderCity",    label: "First Lienholder City",     type: "text" },
  { id: "lienholderState",    label: "First Lienholder State",     type: "text" },
  { id: "lienholderZip",    label: "First Lienholder Zip",     type: "text" },
//
  { id: "rentalPermit",             label: "I Hold Motor Vehicle Retailer (Rental) Permit Number", type: "checkbox" },
  { id: "permitNumber",             label: "Permit Number",                                    type: "text" },
  { id: "dealerOrLessor",           label: "Yes, I am a dealer or lessor that qualifies...",    type: "checkbox" },
//
  { id: "gdnOrLessorNumber",        label: "GDN or Lessor Number",                             type: "text" },
  { id: "tradeIn",                  label: "Trade-in (if any)",                                type: "checkbox" },
  { id: "tradeInYear",           label: "Trade-In Year",                type: "text" },
  { id: "tradeInMake",           label: "Trade-In Make",                type: "text" },
  { id: "tradeInVin",           label: "Trade-In Vehicle Identification Number",                type: "text" },
  { id: "additionalTradeIns",       label: "Additional Trade-ins",                             type: "checkbox" },
//
  { id: "salesAndUseTax",           label: "Sales and Use Tax",                                type: "checkbox" },
  { id: "rebateAmount",             label: "Rebate Amount",                                    type: "text" },
  { id: "salesPriceMinusRebate",    label: "Sales Price Minus Rebate Amount",                  type: "text" },
  { id: "tradeInAmount",            label: "Trade In Amount",                                  type: "text" },
  { id: "fmvDeduction",             label: "Fair Market Value Deduction",                      type: "text" },
  { id: "taxableAmount",            label: "Taxable Amount",                                   type: "text" },
  { id: "taxOnTaxableAmount",       label: "6.25% Tax on Taxable Amount",                      type: "text" },
  { id: "penalty5Percent",          label: "Late Tax Payment Penalty of 5%",                   type: "checkbox" },
  { id: "penalty10Percent",         label: "Late Tax Payment Penalty of 10%",                  type: "checkbox" },
  { id: "penaltyAmount",            label: "Late Tax Payment Penalty Amount",                  type: "text" },
  { id: "stateTaxesPaidTo",         label: "State Taxes Were Paid To",                         type: "text" },
  { id: "amountTaxesPaid",          label: "Amount of Taxes Paid to Previous State",           type: "text" },
  { id: "amountDue",                label: "Amount of Tax and Penalty Due",                    type: "text" },
  { id: "newResidentTax",           label: "$90 New Resident Tax",                             type: "checkbox" },
  { id: "previousResidentState",            label: "Resident's previous state",                        type: "text" },
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
  { id: "sellerName",               label: "Seller Name",                                      type: "text" },
  { id: "sellerDate",               label: "Date",                                             type: "text" },
  { id: "applicantOwner",           label: "Applicant Owner",                                  type: "text" },
  { id: "applicantDate",            label: "Date_2",                                           type: "text" },
  { id: "additionalApplicant",      label: "Additional Applicant",                             type: "text" },
  { id: "additionalApplicantDate",  label: "Date_3",                                           type: "text" },
  //
  { id: "SellerSignature",  label: "Seller Signature",                                                  type: "signature" },
  { id: "OwnerSignature",  label: "Owner Signature",                                                  type: "signature" },
  { id: "AdditionalSignature",  label: "Additional Signature",                                                  type: "signature" }
];

// Define sections by index ranges
const sections = [
  { title: "Applying For",            from: 0,   to: 3   },
  { title: "Correction Reason",       from: 4,   to: 7   },
  { title: "Vehicle Details",         from: 8,   to: 14  },
  { title: "Odometer & Weights",      from: 15,  to: 21  },
  { title: "Applicant Type & ID",     from: 22,  to: 37  },
  { title: "Names & Addresses",       from: 38,  to: 46  },
  { title: "Contact & Renewal",       from: 47,  to: 51  },
  { title: "Lien Information",        from: 52,  to: 56  },
  { title: "Motor Vehicle Tax",       from: 57,  to: 88  },
  { title: "Certify & Sign",          from: 89,  to: 97  },
];

type SigPad = InstanceType<typeof SignatureCanvas>;

export default function Responsive130UForm({
  onChange,
  sectionClass = "",
  gridClass = "",
  initialValues = {},
}: Responsive130UFormProps) {
  // Initialize form state with proper boolean conversion
  const [formState, setFormState] = useState<Record<string, string | boolean>>(() => {
    const state: Record<string, string | boolean> = {};
    fields.forEach(f => {
      if (f.id in initialValues) {
        // For checkboxes, convert string to boolean if necessary
        if (f.type === "checkbox") {
          const val = initialValues[f.id];
          state[f.id] = typeof val === 'string' 
            ? (val === 'true' || val === '1' || val === 'on')
            : Boolean(val);
        } else {
          state[f.id] = initialValues[f.id];
        }
      } else {
        state[f.id] = f.type === "checkbox" ? false : "";
      }
    });
    return state;
  });

  // Refs for signature pads
  const sellerSigRef = useRef<SigPad>(null);
  const ownerSigRef = useRef<SigPad>(null);
  const additionalSigRef = useRef<SigPad>(null);

  // Get signature refs map
  const getSigRef = (id: string) => {
    switch (id) {
      case "SellerSignature": return sellerSigRef;
      case "OwnerSignature": return ownerSigRef;
      case "AdditionalSignature": return additionalSigRef;
      default: return null;
    }
  };

  // Extract signature data
  const getSignatureData = (id: string): string | null => {
    const ref = getSigRef(id);
    if (!ref?.current || ref.current.isEmpty()) return null;
    return ref.current.getCanvas().toDataURL("image/png");
  };

  // Update form state with signature data when signatures change
  const updateSignatureInState = (id: string) => {
    const sigData = getSignatureData(id);
    setFormState(prev => ({ ...prev, [id]: sigData || "" }));
  };

  // Notify parent on every change
  useEffect(() => {
    onChange?.(formState);
  }, [formState, onChange]);

  // Handle individual field updates
  const handleChange = (id: string, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [id]: value }));
  };

  // Render a single field
  const renderField = (f: FieldDef) => {
    if (f.type === "checkbox") {
      return (
        <div key={f.id} className="form-field">
          <label className="checkbox-container">
            <input
              id={f.id}
              type="checkbox"
              checked={Boolean(formState[f.id])}
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
              onEnd={() => updateSignatureInState(f.id)}
            />
            <button
              type="button"
              onClick={() => {
                ref?.current?.clear();
                updateSignatureInState(f.id);
              }}
              className="clear-signature-btn"
            >
              Clear
            </button>
          </div>
        </div>
      );
    }

    return (
      <div key={f.id} className="form-field">
        <label htmlFor={f.id} className="form-label">
          {f.label}
          {f.required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={f.id}
          type="text"
          value={String(formState[f.id] || "")}
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