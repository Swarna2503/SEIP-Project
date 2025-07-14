import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Responsive130UForm from "../components/Responsive130UForm";
import "../styles/responsive-form.css";

interface LocationState {
  ocr?: any;
  titleOcr?: any;
  titleFile?: File;
}

export default function ResponsiveFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const { ocr, titleOcr, titleFile } = state ?? {};
  
  const [formValid, setFormValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  function mapOcrToFormValues(dl: any, title: any): Record<string, string | boolean> {
    return {
      vehicleIdentificationNumber: title?.vehicle_id_number ?? "",
      vehicleYear: title?.year_model ?? "",
      vehicleMake: title?.make_of_vehicle ?? "",
      vehicleBodyStyle: title?.body_style ?? "",
      vehicleModel: title?.model ?? "",
      texasLicensePlate: title?.license_number ?? "",
      odometerReading: title?.odometer_reading ?? "",
      lienholderNameAddress: title?.first_lienholder ?? "",
      previousOwner: title?.previous_owner ?? "",

      applicantName: dl?.first_name ?? "",
      applicantLastName: dl?.last_name ?? "",
      // add new fields 
      applicantMailingAddress: dl?.street_address ?? dl?.address ?? "",
      applicantCity: dl?.city ?? "",
      applicantState: dl?.state ?? "",
      applicantZip: dl?.zip_code ?? "", 
      photoIdNumber: dl?.dlNumber ?? "",
      titleRegistration: false,
      titleOnly: false,
      registrationPurposesOnly: false,
      nonTitleRegistration: false,
      vehicleDescription: false,
      addRemoveLien: false,
      otherReason: false,
      notActualMileage: false,
      exceedsMechanicalLimits: false,
      exemptMileage: false,
      individual: false,
      business: false,
      government: false,
      trust: false,
      nonProfit: false,
      usDriverLicense: false,
      passport: false,
      uscisId: false,
      natoId: false,
      usMilitaryId: false,
      militaryStatusId: false,
      usDeptStateId: false,
      usDeptHomelandId: false,
      emailConsent: false,
      attachVTR216: false,
      attachVTR267: false,
      noElectronicTitle: false,
      rentalPermit: false,
      dealerOrLessor: false,
      tradeIn: false,
      additionalTradeIns: false,
      salesAndUseTax: false,
      penalty5Percent: false,
      penalty10Percent: false,
      newResidentTax: false,
      evenTradeTax: false,
      giftTax: false,
      salvageFee: false,
      emissionsFee25Diesel: false,
      emissionsFee1Diesel: false,
      taxExemption: false,
      applicationFee: false,
      inspectionVerified: false,
      unrecoveredStolen: false,
      correctedTitleLost: false,
    };
  }

  const mappedOcr = mapOcrToFormValues(ocr ?? {}, titleOcr ?? {});

  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  const [formState, setFormState] = useState<Record<string, any>>({});

  const handleFormChange = (newState: Record<string, any>, isValid: boolean, errors: Record<string, string>) => {
    setFormState(newState);
    setFormValid(isValid);
    setValidationErrors(errors);
    setShowAllErrors(false);
  };

  const handleNext = () => {
    if (!formValid) {
      setShowAllErrors(true);
      
      // Find first error and scroll to it
      const firstErrorField = Object.keys(validationErrors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus after scroll completes
          setTimeout(() => element.focus({ preventScroll: true }), 500);
        }
      }
      return;
    }

    navigate("/review-submit", {
      state: { 
        ocr, 
        titleFile, 
        titleForm: formState,
        signatures: {
          SellerSignature: formState.SellerSignature,
          OwnerSignature: formState.OwnerSignature,
          AdditionalSignature: formState.AdditionalSignature
        }
      },
    });
  };

  return (
    <div className="responsive-form-page">
      <h1 className="page-title">Step 3: Complete Title Form</h1>
      
      {showAllErrors && Object.keys(validationErrors).length > 0 && (
        <div className="error-banner">
          <span className="error-count">{Object.keys(validationErrors).length} error(s)</span> 
          found in the form. Please fix them to continue.
        </div>
      )}

      <div className="form-card">
        <div className="sections-container">
          <Responsive130UForm
            onChange={handleFormChange}
            sectionClass="section-card"
            gridClass="fields-grid"
            initialValues={mappedOcr}
            showAllErrors={showAllErrors}
          />
        </div>
      </div>

      <div className="form-footer">
        <button 
          className="btn-next" 
          onClick={handleNext}
        >
          Next: Review &amp; Submit →
        </button>
      </div>
    </div>
  );
}