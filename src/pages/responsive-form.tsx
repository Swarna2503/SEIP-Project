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
  console.log("Driver License OCR:", ocr);
  console.log("Title OCR:", titleOcr);

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
      // Initialize checkbox states
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

  const handleFormChange = (newState: Record<string, any>) => {
    setFormState(newState);
  };

  const handleNext = () => {
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

      <div className="form-card">
        <div className="sections-container">
          <Responsive130UForm
            onChange={handleFormChange}
            sectionClass="section-card"
            gridClass="fields-grid"
            initialValues={mappedOcr}
          />
        </div>
      </div>

      <div className="form-footer">
        <button className="btn-next" onClick={handleNext}>
          Next: Review &amp; Submit →
        </button>
      </div>
    </div>
  );
}