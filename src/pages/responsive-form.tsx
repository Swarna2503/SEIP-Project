import  { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Responsive130UForm from "../components/Responsive130UForm";
import { fields } from "../components/Responsive130UForm";
import { STATE_NAMES } from "../utils/stateAbbreviations";
import "../styles/responsive-form.css";

interface LocationState {
  ocr?: any;
  titleOcr?: any;
  titleFile?: File;
  selectedIdType?: string;
  applicationId?: string;
}

function getStateAbbrFromFullNameOrAbbr(input: string): string {
  if (!input) return "";
  const trimmed = input.trim();
  if (STATE_NAMES[trimmed.toUpperCase()]) return trimmed.toUpperCase();
  for (const [abbr, full] of Object.entries(STATE_NAMES)) {
    if (full.toLowerCase() === trimmed.toLowerCase()) {
      return abbr;
    }
  }
  return trimmed;
}

export default function ResponsiveFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // const state = location.state as LocationState | undefined;
  // const { ocr: dlOcr, titleOcr, titleFile } = state ?? {};
  const state = (location.state ?? {}) as LocationState;
  const appId = state.applicationId || paramAppId;
  const { ocr: dlOcr, titleOcr, titleFile, applicationId } = state;
  const [selectedIdType] = useState(() => {
    return sessionStorage.getItem("selectedIdType") || "";
  });

  
  const [formValid, setFormValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAllErrors, setShowAllErrors] = useState(false);

  function mapOcrToFormValues(dl: any, titleOcr: any, idType: string): Record<string, any> {
    // 1) define defaults for the form fields
    const defaults: Record<string, string | boolean> = Object.fromEntries(
      fields.map(f => [f.id, f.type === "checkbox" ? false : ""])
    );

    // Map selectedIdType to corresponding checkbox key
    const idTypeMap: Record<string, keyof typeof defaults> = {
      "U.S. Driver License/ID Card": "usDriverLicense",
      "US Military ID": "usMilitaryId",
      "Passport": "passport",
      "NATO ID": "natoId",
      "Immigration": "uscisId",
    };

    // Prepare ID checkbox group
    const idCheckboxes: Record<string, boolean> = Object.fromEntries(
      Object.keys(idTypeMap).map(key => [idTypeMap[key], false])
    );

    if (idType && idTypeMap[idType]) {
      idCheckboxes[idTypeMap[idType]] = true;
    }

    // 2) auto-fill values from OCR data
    const fullAddress = titleOcr?.owner_address ?? "";
    const parts = fullAddress.split(",").map((s: string) => s.trim());
    const previousCity = parts[1] || "";
    const rawState = parts[2]?.split(" ")[0] ?? "";
    const previousOwnerState = getStateAbbrFromFullNameOrAbbr(rawState);
    console.log("Parsed state:", previousOwnerState, "from raw:", rawState);

    const autoFill: Record<string, any> = {
      // Responsive130UForm checkbox fields
      ...idCheckboxes,
      // car title information
      vehicleIdentificationNumber: titleOcr?.vehicle_identification_number ?? "",
      vehicleYear: titleOcr?.year_model?.toString() ?? "",
      vehicleMake: titleOcr?.make_of_vehicle ?? "",
      vehicleBodyStyle: titleOcr?.body_style ?? "",
      vehicleModel: titleOcr?.model ?? "",
      emptyWeight: titleOcr?.mfg_capacity_in_tons?.toString() ?? "",
      // previous owner
      previousOwner: titleOcr?.owner_name ?? "",
      previousCity,
      previousOwnerState,
      // driver license information
      photoIdNumber: dl?.dlNumber ?? "",
      applicantName: dl?.first_name ?? "",
      applicantLastName: dl?.last_name ?? "",
      applicantMailingAddress: dl?.street_address ?? dl?.address ?? "",
      applicantCity: dl?.city ?? "",
      applicantState: dl?.state ?? "",
      applicantZip: dl?.zip_code ?? "",
    };

    // 4) merge: defaults → autoFill → idMap
    return {
      ...defaults,
      ...autoFill,
    };
  }

  useEffect(() => {
    if (!state) {
      navigate("/", { replace: true });
    }
  }, [state, navigate]);

  // initialize form state with OCR data
  // const [formState, setFormState] = useState(() =>
  //   mapOcrToFormValues(dlOcr ?? {}, titleOcr ?? {}, selectedIdType)
  // );
  // init formState once with default values
  const [formState, setFormState] = useState(() =>
    mapOcrToFormValues(dlOcr ?? {}, titleOcr ?? {}, selectedIdType)
  );

  console.log("selectedIdType from session:", selectedIdType);
  console.log("generated formState:", formState);

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
    if (!applicationId) {
      console.error("Missing applicationId in ResponsiveFormPage");
      return;
    }
    navigate("/signature", {
      state: {
        applicationId,
        dlOcr,
        titleOcr,
        titleFile,
        titleForm: formState,
        signatures: {
          SellerSignature: formState.SellerSignature,
          OwnerSignature: formState.OwnerSignature,
          AdditionalSignature: formState.AdditionalSignature,
        },
      },
    });
  };

  const handleSave = () => {
    try {
      sessionStorage.setItem("savedFormState", JSON.stringify(formState));
      if (applicationId) {
        sessionStorage.setItem("savedApplicationId", applicationId);
      }
      console.log("Form data saved successfully:", formState);
    } catch (error) {
      console.error("Error saving form data:", error);
    }
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
            initialValues={formState}
            showAllErrors={showAllErrors}
          />
        </div>
      </div>

      <div className="form-footer">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <button className="btn-save" onClick={handleSave}>
          Save
        </button>

        <button className="btn-next" onClick={handleNext}>
          Next: Review &amp; Submit →
        </button>
      </div>
    </div>
  );
}