// src/pages/ResponsiveFormPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Responsive130UForm from "../components/Responsive130UForm";
import "../styles/responsive-form.css";

interface LocationState {
  ocr?: any;        // Driver License OCR, may be null if user skipped OCR
  titleOcr?: any;   // Title Document OCR, may be null if user skipped OCR
  titleFile?: File;
}

export default function ResponsiveFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const { ocr, titleOcr, titleFile } = state ?? {};
  console.log("Driver License OCR:", ocr);
  console.log("Title OCR:", titleOcr);

  function mapOcrToFormValues(dl: any, title: any): Record<string, string> {
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
      applicantMailingAddress: dl?.address ?? "",
      applicantState: dl?.state ?? "",
      photoIdNumber: dl?.dlNumber ?? "",
    };
  }

  const mappedOcr = mapOcrToFormValues(ocr ?? {}, titleOcr ?? {});


  useEffect(() => {
  if (!state) {
     // no state at all => somebody hit this URL directly
     navigate("/", { replace: true });
   }
 }, [state, navigate]);
  // ─────────────────────────────────────────────────────────

  const [formState, setFormState] = useState<Record<string, any>>({});

  const handleFormChange = (newState: Record<string, any>) => {
    setFormState(newState);
  };

  const handleNext = () => {
    navigate("/review-submit", {
      state: { ocr, titleFile, titleForm: formState },
    });
  };

  return (
    <div className="responsive-form-page">
      <h1 className="page-title">Step 3: Complete Title Form</h1>

      <div className="form-card">
        <div className="sections-container">
          <Responsive130UForm
            onChange={handleFormChange}
            /* our CSS hooks */
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