import { useMobile } from '../hooks/isMobile';
import { useState, useEffect, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { STATE_ABBREVIATIONS, STATE_NAMES } from '../utils/stateAbbreviations';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css'; 

interface FieldDef {
  id: string;
  label: string;
  type: "text" | "checkbox" | "signature" | "dropdown";
  required?: boolean;
  validation?: (value: any, formState: Record<string, any>) => string | null;
  visibleCondition?: (formState: Record<string, any>) => boolean;
}

export interface Responsive130UFormProps {
  onChange?: (
    state: Record<string, string | boolean>,
    isValid: boolean,
    errors: Record<string, string>
  ) => void;
  sectionClass?: string;
  gridClass?: string;
  initialValues?: Record<string, string | boolean>;
  showAllErrors?: boolean;
}

// Get today's calendar
const getToday = () => {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${mm}-${dd}-${yyyy}`; // Keep as MM-DD-YYYY for storage
};

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

const tradeInRequired = (value: string, formState: Record<string, any>) => {
  if (!formState.tradeIn) return null;
  if (!value) return "This field is required";
  return null;
};

const validators = {
  required: (value: any) => {
    return !value ? "This field is required" : null;
  },
  vin: (value: string) => {
    if (!value) return "VIN is required";
    if (!/^[A-Z0-9]{17}$/i.test(value)) return "VIN must be exactly 17 alphanumeric characters";
    return null;
  },
  year: (value: string) => {
    if (!value) return "Year is required";
    const yearNum = parseInt(value, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearNum)) return "Must be a valid number";
    if (yearNum < 1886 || yearNum > currentYear + 1)
      return `Must be between 1886 and ${currentYear + 1}`;
    return null;
  },
  texasLicense: (value: string) => {
    if (!value) return "Texas License Plate is required";
    return null;
  },
  odometerOptional: (value: string) => {
    if (value && !/^\d+$/.test(value)) return "Must be a whole number";
    return null;
  },
  zip: (value: string) => {
    if (!value) return "ZIP code is required";
    if (!/^\d{5}$/.test(value)) return "Must be a 5-digit ZIP code";
    return null;
  },
  email: (value: string, formState: Record<string, any>) => {
    if (formState.emailConsent && !value) return "Email is required when consent is given";
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
    return null;
  },
  phone: (value: string) => {
    if (value && !/^\d{10}$/.test(value)) return "Must be 10-digit phone number";
    return null;
  },
  date: (value: string) => {
    if (!value) return null;
    if (!/^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])-\d{4}$/.test(value)) {
      return "Must be in MM-DD-YYYY format";
    }
    const [month, day, year] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) {
      return "Date cannot be in the future";
    }
    if (date.getMonth() + 1 !== month || date.getDate() !== day || date.getFullYear() !== year) {
      return "Invalid date";
    }
    return null;
  },
  signatureBlock: (name: string, date: string, formState: Record<string, any>) => {
    const nameValue = formState[name];
    const dateValue = formState[date];
    if ((nameValue && !dateValue) || (!nameValue && dateValue))
      return "Both name and date are required if either is filled";
    return null;
  },
  otherReason: (value: string, formState: Record<string, any>) => {
    if (formState.otherReason && !value) return "Other reason is required";
    return null;
  },
  passportIssuer: (value: string, formState: Record<string, any>) => {
    if (formState.passport && !value) return "Passport issuer is required";
    return null;
  },
  feinEin: (value: string, formState: Record<string, any>) => {
    if (formState.business && !value) return "FEIN/EIN is required for businesses";
    return null;
  },
  numeric: (value: string) => {
    if (value && !/^\d*\.?\d+$/.test(value)) return "Must be a number";
    return null;
  },
  atLeastOne: (values: boolean[]) => {
    if (!values.some(v => v)) return "At least one must be selected";
    return null;
  }
};

export const fields: FieldDef[] = [
  // 0–3: "Applying for" checkboxes
  { 
    id: "titleRegistration",           
    label: "Title & Registration",                  
    type: "checkbox",
    validation: (_, formState) => validators.atLeastOne([
      formState.titleRegistration, 
      formState.titleOnly, 
      formState.registrationPurposesOnly, 
      formState.nonTitleRegistration
    ])
  },
  { id: "titleOnly", label: "Title Only", type: "checkbox" },
  { id: "registrationPurposesOnly", label: "Registration Purposes Only", type: "checkbox" },
  { id: "nonTitleRegistration", label: "Nontitle Registration", type: "checkbox" },

  // 4–6: "Corrected title or registration, check reason" - Optional section
  { 
    id: "vehicleDescription",          
    label: "Vehicle Description",                     
    type: "checkbox",
    validation: (_, formState) => formState.otherReason || formState.addRemoveLien || formState.vehicleDescription
      ? validators.atLeastOne([
          formState.vehicleDescription, 
          formState.addRemoveLien, 
          formState.otherReason
        ])
      : null
  },
  { id: "addRemoveLien", label: "Add/Remove Lien", type: "checkbox" },
  { id: "otherReason", label: "Other (specify below)", type: "checkbox" },

  // 7: "Other reason" free-form
  { 
    id: "otherReasonText",             
    label: "Other Reason For Correction",             
    type: "text",
    validation: validators.otherReason,
    visibleCondition: formState => formState.otherReason
  },

  // 8–14: Vehicle details - ONLY VIN AND YEAR REQUIRED
  { 
    id: "vehicleIdentificationNumber", 
    label: "1. Vehicle Identification Number",        
    type: "text",
    required: true,
    validation: validators.vin
  },
  { 
    id: "vehicleYear",                 
    label: "2. Year",                                 
    type: "text",
    required: true,
    validation: validators.year
  },
  { 
    id: "vehicleMake",                 
    label: "3. Make",                                 
    type: "text"
  },
  { 
    id: "vehicleBodyStyle",            
    label: "4. Body Style",                           
    type: "text"
  },
  { 
    id: "vehicleModel",                
    label: "5. Model",                                
    type: "text"
  },
  { 
    id: "majorColor",                  
    label: "6. Major Color",                          
    type: "text"
  },
  { 
    id: "minorColor",                  
    label: "7. Minor Color",                          
    type: "text"
  },

  //15-22: Odometer & Weights - TEXAS LICENSE REQUIRED, ODOMETER OPTIONAL
  { 
    id: "texasLicensePlate",          
    label: "8. Texas License Plate No",                       
    type: "text",
    required: true,
    validation: validators.texasLicense
  },
  { 
    id: "odometerReading",            
    label: "9. Odometer Reading (no tenths)",                 
    type: "text",
    validation: validators.odometerOptional
  },
  { id: "notActualMileage", label: "10.Not Actual", type: "checkbox" },
  { id: "exceedsMechanicalLimits", label: "10.Exceeds Mechanical Limits", type: "checkbox" },
  { id: "exemptMileage", label: "10.Exempt", type: "checkbox" },
  { 
    id: "emptyWeight",                
    label: "11. Empty Weight",                                
    type: "text",
    validation: validators.numeric
  },
  { 
    id: "carryingCapacity",           
    label: "12. Carrying Capacity (if any)",                  
    type: "text",
    validation: validators.numeric
  },

  //23-29
  { 
    id: "individual",                 
    label: "13.Individual",                                      
    type: "checkbox",
    required: true,
    validation: (_, formState) => validators.atLeastOne([
      formState.individual, 
      formState.business, 
      formState.government, 
      formState.trust, 
      formState.nonProfit
    ])
  },
  { id: "business", label: "13.Business", type: "checkbox" },
  { id: "government", label: "13.Government", type: "checkbox" },
  { id: "trust", label: "13.Trust", type: "checkbox" },
  { id: "nonProfit", label: "13.NonProfit", type: "checkbox" },
  { 
    id: "photoIdNumber",             
    label: "14. Applicant Photo ID Number or FEIN/EIN",       
    type: "text",
    required: true,
    validation: (value, formState) => formState.business ? validators.required(value) : null
  },

  // Identification - UPDATED: Added visibleCondition to stateOfId
  { 
    id: "usDriverLicense",           
    label: "15.U.S. Driver License/ID Card",                     
    type: "checkbox",
    required: true,
    validation: (_, formState) => validators.atLeastOne([
      formState.usDriverLicense, 
      formState.passport, 
      formState.uscisId, 
      formState.natoId, 
      formState.usMilitaryId,
      formState.militaryStatusId,
      formState.usDeptStateId,
      formState.usDeptHomelandId
    ])
  },
  { 
    id: "stateOfId", 
    label: "15.State of ID/DL", 
    type: "dropdown",
    visibleCondition: formState => formState.usDriverLicense,
    validation: (value, formState) => {
      if (formState.usDriverLicense && !value) {
        return "State of ID/DL is required";
      }
      return null;
    }
  },
  { id: "passport", label: "15.Passport", type: "checkbox" },
  { 
    id: "passportIssued",           
    label: "15.Passport Issued",                                  
    type: "text",
    required: true,
    validation: validators.passportIssuer,
    visibleCondition: formState => formState.passport
  },
  { id: "uscisId", label: "15.U.S. Citizenship & Immigration Services/DOJ ID", type: "checkbox" },
  { id: "natoId", label: "15.NATO ID", type: "checkbox" },
  { id: "usMilitaryId", label: "15.US Military ID", type: "checkbox" },
  { id: "militaryStatusId", label: "15.Other Military Status of Forces Photo ID", type: "checkbox" },
  { id: "usDeptStateId", label: "15.US Dept of State ID", type: "checkbox" },
  { id: "usDeptHomelandId", label: "15.US Dept of Homeland Security ID", type: "checkbox" },

  // Applicant name
  { 
    id: "applicantName",            
    label: "16. Applicant First Name or Entity Name",       
    type: "text",
    required: true,
    validation: validators.required
  },
  { id: "applicantMiddleName", label: "16.Applicant Middle Name", type: "text" },
  { 
    id: "applicantLastName",      
    label: "16.Applicant Last Name",       
    type: "text",
    required: true,
    validation: validators.required
  },
  { id: "applicantSuffix", label: "16. Applicant Suffix", type: "text" },

  // Additional applicant
  { id: "additionalApplicantName", label: "17. Additional Applicant First Name", type: "text" },
  { id: "additionalApplicantMiddleName", label: "17.Additional Applicant Middle Name", type: "text" },
  { id: "additionalApplicantLastName", label: "17.Additional Applicant Last Name", type: "text" },
  { id: "additionalApplicantSuffix", label: "17. Additional Applicant Suffix", type: "text" },

  // Address
  { 
    id: "applicantMailingAddress",         
    label: "18. Applicant Mailing Address",     
    type: "text",
    required: true,
    validation: validators.required
  },
  { 
    id: "applicantCity",         
    label: "18.Applicant City",     
    type: "text",
    required: true,
    validation: validators.required
  },
  { 
    id: "applicantState",         
    label: "18.Applicant State",     
    type: "dropdown",
    required: true,
    validation: validators.required
  },
  { 
    id: "applicantZip",         
    label: "18.Applicant Zip",     
    type: "text",
    required: true,
    validation: validators.zip
  },
  { 
    id: "applicantCounty",          
    label: "19. Applicant County of Residence",                
    type: "text",
    required: true,
    validation: validators.required
  },
  
  // Previous owner
  { 
    id: "previousOwner",            
    label: "20. Previous Owner Name ",        
    type: "text",
    required: true,
    validation: validators.required
  },
  { 
    id: "previousCity",            
    label: "20.Previous Owner City",        
    type: "text",
    required: true,
    validation: validators.required
  },
  { 
    id: "previousOwnerState",            
    label: "20.Previous Owner State ",        
    type: "dropdown",
    required: true,
    validation: validators.required
  },
  { id: "dealerGDN", label: "21. Dealer GDN (if applicable)", type: "text" },
  { id: "unitNumber", label: "22. Unit Number (if applicable)", type: "text" },

  {
    id: "sameMailingAddress",
    label: "Same as the applicant’s address",
    type: "checkbox"
  },

  
  // Renewal
  { id: "renewalRecipientFirstName", label: "23. Renewal Recipient First Name", type: "text" },
  { id: "renewalRecipientMiddleName", label: "23.Renewal Recipient Middle Name", type: "text" },
  { id: "renewalRecipientLastName", label: "23.Renewal Recipient Last Name", type: "text" },
  { id: "renewalRecipientSuffix", label: "23.Renewal Recipient Suffix", type: "text" },
  
  // Renewal address
  { 
    id: "renewalMailingAddress",           
    label: "24. Renewal Notice Mailing Address",            
    type: "text",
    visibleCondition: (formState) => !formState.sameMailingAddress,
    required: true,
    validation: validators.required
  },
  { 
    id: "renewalCity",           
    label: "24.Renewal Notice City",            
    type: "text",
    visibleCondition: (formState) => !formState.sameMailingAddress,
    required: true,
    validation: validators.required
  },
  { 
    id: "renewalState",           
    label: "24.Renewal Notice Mailing State",            
    type: "dropdown",
    visibleCondition: (formState) => !formState.sameMailingAddress,
    required: true,
    validation: validators.required
  },
  { 
    id: "renewalZip",           
    label: "24.Renewal Notice Mailing Zip",            
    type: "text",
    visibleCondition: (formState) => !formState.sameMailingAddress,
    required: true,
    validation: validators.zip
  },
  
  // Contact
  { 
    id: "phoneNumber",              
    label: "25. Applicant Phone Number (optional)",            
    type: "text",
    validation: validators.phone
  },
  { 
    id: "email",                    
    label: "26. Email (optional)",                             
    type: "text",
    validation: validators.email
  },
  { id: "emailConsent", label: "27.Yes Provide Email in 26", type: "checkbox" },
  { id: "attachVTR216", label: "28.Yes Attach Form VTR-216", type: "checkbox" },
  
  // Vehicle location
  { id: "vehicleLocation", label: "29.Vehicle Location Address if different", type: "text" },
  { id: "vehicleLocationCity", label: "29.Vehicle Location City", type: "text" },
  { id: "vehicalLocationState", label: "29.Vehicle Location State", type: "dropdown" },
  { id: "vehicleLocationZip", label: "29.Vehicle Location Zip", type: "text" },
  
  // Lien
  { id: "attachVTR267", label: "30.Yes Attach Form VTR-267", type: "checkbox" },
  { id: "noElectronicTitle", label: "31.Yes Cannot check 30", type: "checkbox" },
  { id: "lienholderId", label: "32. Certified/eTitle Lienholder ID Number", type: "text" },
  { 
    id: "firstLienDate",            
    label: "33. First Lien Date (if any)",                     
    type: "text",
    validation: validators.date
  },
  
  // Lienholder info
  { 
    id: "lienholderNameAddress",    
    label: "34.First Lienholder Name",     
    type: "text",
    visibleCondition: formState => formState.addRemoveLien
  },
  { 
    id: "lienholderMailingAddress",    
    label: "34.First Lienholder Mailing Address",     
    type: "text",
    visibleCondition: formState => formState.addRemoveLien
  },
  { 
    id: "lienholderCity",    
    label: "34.First Lienholder City",     
    type: "text",
    visibleCondition: formState => formState.addRemoveLien
  },
  { 
    id: "FirstLienholderState",    
    label: "34.First Lienholder State",     
    type: "dropdown",
    visibleCondition: formState => formState.addRemoveLien
  },
  { 
    id: "lienholderZip",    
    label: "34.First Lienholder Zip",     
    type: "text",
    visibleCondition: formState => formState.addRemoveLien,
    validation: validators.zip
  },
  
  // Dealership
  { id: "rentalPermit", label: "35.I Hold Motor Vehicle Retailer (Rental) Permit Number", type: "checkbox" },
  { id: "permitNumber", label: "35.Permit Number", type: "text" },
  { id: "dealerOrLessor", label: "35.Yes, I am a dealer or lessor that qualifies", type: "checkbox" },
  { id: "gdnOrLessorNumber", label: "35.GDN or Lessor Number", type: "text" },
  
  // Trade-in
  { id: "tradeIn", label: "36.Trade-in (if any)", type: "checkbox" },
  {
    id: "tradeInYear",
    label: "36.Trade-In Year",
    type: "text",
    required: true,
    validation: tradeInRequired,
    visibleCondition: formState => formState.tradeIn
  },
  {
    id: "tradeInMake",
    label: "36.Trade-In Make",
    type: "text",
    required: true,
    validation: tradeInRequired,
    visibleCondition: formState => formState.tradeIn
  },
  {
    id: "tradeInVin",
    label: "36.Trade-In Vehicle Identification Number",
    type: "text",
    required: true,
    validation: tradeInRequired,
    visibleCondition: formState => formState.tradeIn
  },
  { id: "additionalTradeIns", label: "37.Additional Trade-ins", type: "checkbox" },
  
  // Sales tax
  { id: "salesAndUseTax", label: "38.Sales and Use Tax", type: "checkbox" },
  { 
    id: "rebateAmount",             
    label: "38.a.Rebate Amount",                                    
    type: "text",
    validation: (value, formState) => formState.salesAndUseTax ? validators.numeric(value) : null,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "salesPriceMinusRebate",    
    label: "38.a.Sales Price Minus Rebate Amount",                  
    type: "text",
    validation: (value, formState) => formState.salesAndUseTax ? validators.numeric(value) : null,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "tradeInAmount",            
    label: "38.b.Trade In Amount",                                  
    type: "text",
    validation: (value, formState) => formState.salesAndUseTax ? validators.numeric(value) : null,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "fmvDeduction",             
    label: "38.c.Fair Market Value Deduction",                      
    type: "text",
    validation: (value, formState) => formState.salesAndUseTax ? validators.numeric(value) : null,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "taxableAmount",            
    label: "38.d.Taxable Amount",                                   
    type: "text",
    validation: (value, formState) => formState.salesAndUseTax ? validators.numeric(value) : null,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "taxOnTaxableAmount",       
    label: "38.e.6.25% Tax on Taxable Amount",                      
    type: "text",
    validation: (value, formState) => formState.salesAndUseTax ? validators.numeric(value) : null,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "penalty5Percent",          
    label: "38.f.Late Tax Payment Penalty of 5%",                   
    type: "checkbox",
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "penalty10Percent",         
    label: "38.f.Late Tax Payment Penalty of 10%",                  
    type: "checkbox",
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "penaltyAmount",            
    label: "38.g.Late Tax Payment Penalty Amount",                  
    type: "text",
    validation: (value, formState) => (formState.penalty5Percent || formState.penalty10Percent) ? validators.numeric(value) : null,
    visibleCondition: formState => formState.salesAndUseTax && (formState.penalty5Percent || formState.penalty10Percent)
  },
  { 
    id: "taxPaidToState",         
    label: "38.g.State Taxes Were Paid To",                         
    type: "dropdown",
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "amountTaxesPaid",          
    label: "38.g.Amount of Taxes Paid to Previous State",           
    type: "text",
    validation: (value, formState) => formState.salesAndUseTax ? validators.numeric(value) : null,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "amountDue",                
    label: "38.h.Amount of Tax and Penalty Due",                    
    type: "text",
    validation: (value, formState) => formState.salesAndUseTax ? validators.numeric(value) : null,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "newResidentTax",           
    label: "$90 New Resident Tax",                             
    type: "checkbox",
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "residentPreviousState",    
    label: "Resident's previous state",                        
    type: "dropdown",
    validation: (value, formState) => formState.newResidentTax ? validators.required(value) : null,
    visibleCondition: formState => formState.salesAndUseTax && formState.newResidentTax
  },
  { 
    id: "evenTradeTax",             
    label: "$5 Even Trade Tax",                                
    type: "checkbox",
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "giftTax",                  
    label: "$10 Gift Tax Attach Comptroller Form 14-317",      
    type: "checkbox",
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "salvageFee",               
    label: "$65 Rebuilt Salvage Fee",                          
    type: "checkbox",
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "emissionsFee25",           
    label: "2.5% Emissions Fee",                               
    type: "text",
    validation: validators.numeric,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "emissionsFee25Diesel",     
    label: "2.5% Emissions Fee Diesel Vehicles 1996",       
    type: "checkbox",
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "emissionsFee1",            
    label: "1% Emissions Fee",                                 
    type: "text",
    validation: validators.numeric,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "emissionsFee1Diesel",      
    label: "1% Emissions Fee Diesel Vehicles 1997",         
    type: "checkbox",
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "taxExemptionReason",       
    label: "Sales Tax Exemption Reason",                       
    type: "text",
    validation: (value, formState) => formState.taxExemption ? validators.required(value) : null,
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "taxExemption",           
    label: "Exemption claimed under the Motor vehicle Sales and Use Tax Law because:",
    type: "checkbox",
    visibleCondition: formState => formState.salesAndUseTax
  },
  { 
    id: "applicationFee",           
    label: "$28 or $33 Application Fee for Texas Title",       
    type: "checkbox",
    visibleCondition: formState => formState.salesAndUseTax
  },
  
  // Certification
  { id: "inspectionVerified", label: "I have physically inspected the vehicle described and verified the vehicle identification number above", type: "checkbox" },
  { id: "unrecoveredStolen", label: "The vehicle is unrecovered stolen, and I am unable to verify the vehicle identification number above", type: "checkbox" },
  { id: "correctedTitleLost", label: "I am applying for a corrected title and the original Texas Certificate of Title is lost or destroyed.", type: "checkbox" },
  
  // Signatures - Updated to be required
  { 
    id: "applicantOwner",           
    label: "Applicant Owner",                                  
    type: "text",
    required: true,
    validation: validators.required
  },
  { 
    id: "applicantDate",            
    label: "Date",                                           
    type: "text",
    required: true,
    validation: (value) => validators.required(value) || validators.date(value)
  },
  { 
    id: "additionalApplicant",      
    label: "Additional Applicant",                             
    type: "text",
    validation: (_value, formState) => 
      validators.signatureBlock("additionalApplicant", "additionalApplicantDate", formState)
  },
  { 
    id: "additionalApplicantDate",  
    label: "Date",                                           
    type: "text",
    validation: (value, formState) => 
      validators.signatureBlock("additionalApplicant", "additionalApplicantDate", formState) || validators.date(value)
  },
];

interface SectionDef {
  title: string;
  from: number;
  to: number;
  required?: boolean;
  collapsible?: boolean;
}

// UPDATED: Added required asterisks to Applicant Type and Identification Document sections
const sections: SectionDef[] = [
  { title: "Applying For", from: 0, to: 3, required: true },
  { 
    title: "Correction Reason", 
    from: 4, 
    to: 7, 
    collapsible: true 
  },
  { title: "Vehicle Details", from: 8, to: 14 },
  { title: "Odometer & Weights", from: 15, to: 21 },

  // Applicant Type section - marked as required
  { title: "Applicant Type", from: 22, to: 27, required: true },
  
  // Identification Document section - marked as required
  { title: "Identification Document", from: 28, to: 37, required: true },

  // Names & Addresses
  { title: "Applicant Name", from: 38, to: 41 },
  { title: "Additional Applicant Name", from: 42, to: 45 },
  { title: "Applicant Mailing Address", from: 46, to: 50 },

  { title: "Previous Owner & Dealer Info", from: 51, to: 55 },
  { title: "Renewal Recipient", from: 56, to: 59 },
  { title: "Renewal Notice Mailing Address", from: 60, to: 63 },

  { title: "Contact & Attachments", from: 64, to: 67 },
  { title: "Vehicle Location & E-Title", from: 68, to: 73 },
  { title: "Lien Information", from: 74, to: 80 },
  { title: "Dealership & Trade-Ins", from: 81, to: 90 },
  { title: "Sales & Use Tax", from: 91, to: 114 },
  { title: "Certify & Signatures(Check if applicable)", from: 115, to: 122}
];

type SigPad = InstanceType<typeof SignatureCanvas>;

export default function Responsive130UForm({
  onChange,
  sectionClass = "",
  gridClass = "",
  initialValues = {},
  showAllErrors = false
}: Responsive130UFormProps) {
  const isMobile = useMobile();

  // State management
  const [formState, setFormState] = useState<Record<string, any>>(() => {
    const state: Record<string, any> = {};
    fields.forEach(f => {
      if (initialValues[f.id] !== undefined) {
        state[f.id] = f.type === "checkbox" ? Boolean(initialValues[f.id]) : initialValues[f.id];
      } else {
        state[f.id] = f.type === "checkbox" ? false : "";
      }
    });
    state.sameMailingAddress = true;
    if (!state.applicantDate) {
      state.applicantDate = getToday();
    }
    return state;
  });

  const [touched, setTouched] = useState<Record<string, boolean>>(() => {
    const initialTouched: Record<string, boolean> = {};
    fields.forEach(f => { initialTouched[f.id] = false; });
    return initialTouched;
  });
  const [errors, setErrors] = useState<Record<string, string>>(() => {
    const initialErrors: Record<string, string> = {};
    fields.forEach(f => { initialErrors[f.id] = ""; });
    return initialErrors;
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Correction Reason": false
  });

  // Refs for signatures
  const sellerSigRef = useRef<SigPad>(null);
  const ownerSigRef = useRef<SigPad>(null);
  const additionalSigRef = useRef<SigPad>(null);

  // Utility functions
  const toggleSection = (title: string) => {
    setExpandedSections(prev => {
      const newState = { ...prev, [title]: !prev[title] };
      return newState;
    });
  };

  const getSigRef = (id: string) => {
    const refMap = {
      "SellerSignature": sellerSigRef,
      "OwnerSignature": ownerSigRef,
      "AdditionalSignature": additionalSigRef
    };
    return refMap[id as keyof typeof refMap] || null;
  };

  const updateSignatureInState = (id: string) => {
    const ref = getSigRef(id);
    const data = ref?.current?.getCanvas().toDataURL("image/png") || "";
    setFormState(prev => {
      const newState = { ...prev, [id]: data };
      return newState;
    });
  };

  // Validation function
  const validateForm = (state: Record<string, any> = formState) => {
    const newErrors: Record<string, string> = { ...errors };
    fields.forEach(f => {
      if (f.visibleCondition && !f.visibleCondition(state)) {
        return;
      }
      if (f.validation) {
        const err = f.validation(state[f.id], state);
        newErrors[f.id] = err || '';
      } else if (f.required && !state[f.id]) {
        newErrors[f.id] = 'This field is required';
      } else {
        newErrors[f.id] = '';
      }
      // Special handling for signature block validation
      if (f.id === "additionalApplicant" || f.id === "additionalApplicantDate") {
        const err = validators.signatureBlock("additionalApplicant", "additionalApplicantDate", state);
        if (err) {
          newErrors["additionalApplicant"] = err;
          newErrors["additionalApplicantDate"] = err;
        } else {
          newErrors["additionalApplicant"] = '';
          newErrors["additionalApplicantDate"] = '';
        }
      }
    });
    setErrors(prev => {
      const updatedErrors = { ...prev, ...newErrors };
      return updatedErrors;
    });
    const isValid = Object.values(newErrors).every(error => !error);
    return isValid;
  };

  // Effect for form state changes
  useEffect(() => {
    const isValid = validateForm();
    onChange?.(formState, isValid, errors);
  }, [formState, onChange]);

  // Handle input changes
  const handleChange = (id: string, value: any) => {
    setFormState(prev => {
      const newState = { ...prev, [id]: value };
      return newState;
    });
    setTouched(prev => {
      const newTouched = { ...prev, [id]: true };
      return newTouched;
    });
    validateForm({ ...formState, [id]: value }); // Validate immediately
  };

  // Check field visibility
  const isVisible = (f: FieldDef) => {
    const visible = f.visibleCondition ? f.visibleCondition(formState) : true;
    return visible;
  };

  // Render individual field
  const renderField = (f: FieldDef) => {
    if (!isVisible(f)) {
      return null;
    }
    const err = errors[f.id];
    const showError = (touched[f.id] || showAllErrors) && err;
    const showAsterisk = f.required && f.id !== "individual" && f.id !== "usDriverLicense";
    const dateFieldIds = ["applicantDate", "additionalApplicantDate", "firstLienDate"];

    // Date fields
    if (dateFieldIds.includes(f.id)) {
      return (
        <div key={f.id} className="form-field">
          <label htmlFor={f.id} className="form-label">
            {f.label}
            {showAsterisk && <span className="text-red-500">*</span>}
          </label>
          {isMobile ? (
            <input
              type="date"
              id={f.id}
              value={formState[f.id] || ""}
              onChange={(e) => handleChange(f.id, e.target.value)}
              className={`form-input ${showError ? 'input-error' : ''}`}
            />
          ) : (
            <DatePicker
              id={f.id}
              selected={formState[f.id] ? new Date(formState[f.id]) : null}
              onChange={(date: Date | null) => {
                if (date) {
                  const mm = String(date.getMonth() + 1).padStart(2, '0');
                  const dd = String(date.getDate()).padStart(2, '0');
                  const yyyy = date.getFullYear();
                  handleChange(f.id, `${mm}-${dd}-${yyyy}`);
                } else {
                  handleChange(f.id, '');
                }
              }}
              dateFormat="MM-dd-yyyy"
              className={`form-input ${showError ? 'input-error' : ''}`}
            />
          )}
          {showError && <div className="error-message">{err}</div>}
        </div>
      );
    }

    // Checkbox fields
    if (f.type === "checkbox") {
      return (
        <div key={f.id} className="form-field">
          <label className="checkbox-container">
            <input
              id={f.id}
              type="checkbox"
              checked={Boolean(formState[f.id])}
              onChange={(e) => handleChange(f.id, e.target.checked)}
              className={`form-checkbox ${showError ? 'input-error' : ''}`}
            />
            <span className="checkbox-label">
              {f.label}
              {showAsterisk && <span className="text-red-500">*</span>}
            </span>
          </label>
          {showError && <div className="error-message">{err}</div>}
        </div>
      );
    }

    // Signature fields
    if (f.type === "signature") {
      const ref = getSigRef(f.id);
      return (
        <div key={f.id} className="form-field signature-field">
          <label className="form-label">
            {f.label}
            {showAsterisk && <span className="text-red-500">*</span>}
          </label>
          <div className="signature-container">
            <SignatureCanvas
              ref={ref}
              penColor="black"
              canvasProps={{
                width: isMobile ? 300 : 400,
                height: 100,
                className: "signature-canvas",
                style: { border: "1px solid #ccc", borderRadius: "4px" }
              }}
              onEnd={() => updateSignatureInState(f.id)}
            />
            <button
              type="button"
              onClick={() => { ref?.current?.clear(); updateSignatureInState(f.id); }}
              className="clear-signature-btn"
            >
              Clear
            </button>
          </div>
          {showError && <div className="error-message">{err}</div>}
        </div>
      );
    }

    // Dropdown fields (state fields)
    if (STATE_FIELDS.has(f.id)) {
      return (
        <div key={f.id} className="form-field">
          <label htmlFor={f.id} className="form-label">
            {f.label}
            {showAsterisk && <span className="text-red-500">*</span>}
          </label>
          <select
            id={f.id}
            value={String(formState[f.id] || "")}
            onChange={(e) => handleChange(f.id, e.target.value)}
            className={`form-input ${showError ? 'input-error' : ''}`}
          >
            <option value="">Select State</option>
            {STATE_ABBREVIATIONS.map((abbr) => (
              <option key={abbr} value={abbr}>
                {STATE_NAMES[abbr]}
              </option>
            ))}
          </select>
          {showError && <div className="error-message">{err}</div>}
        </div>
      );
    }

    // Default text input
    return (
      <div key={f.id} className="form-field">
        <label htmlFor={f.id} className="form-label">
          {f.label}
          {showAsterisk && <span className="text-red-500">*</span>}
        </label>
        <input
          id={f.id}
          type="text"
          value={String(formState[f.id] || "")}
          onChange={(e) => handleChange(f.id, e.target.value)}
          className={`form-input ${showError ? 'input-error' : ''}`}
        />
        {showError && <div className="error-message">{err}</div>}
      </div>
    );
  };

  return (
    <>
      {sections.map((section) => {
        const isExpanded = expandedSections[section.title] || !section.collapsible;

        return (
          <section key={section.title} className={sectionClass}>
            <div 
              className="section-header" 
              onClick={() => section.collapsible && toggleSection(section.title)}
              style={section.collapsible ? { cursor: "pointer" } : {}}
            >
              <div className="section-title">
                {section.title}
                {section.required && <span className="text-red-500">*</span>}
                {section.collapsible && (
                  <span className="toggle-icon ml-2">
                    {isExpanded ? "▼" : "►"}
                  </span>
                )}
              </div>
            </div>
            
            {isExpanded && (
              <div className={gridClass}>
                {fields.slice(section.from, section.to + 1).map(renderField)}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}