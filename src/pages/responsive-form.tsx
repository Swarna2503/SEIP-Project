import  { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Responsive130UForm from "../components/Responsive130UForm";
import { fields } from "../components/Responsive130UForm";
import { STATE_NAMES } from "../utils/stateAbbreviations";
import { getLatestDriverLicense } from "../apis/driver_license";
import { getLatestTitle }        from "../apis/title";
import { getFormState, saveFormState } from "../apis/form";
import "../styles/responsive-form.css";

interface LocationState {
  ocr?: any;
  titleOcr?: any;
  titleFile?: File;
  selectedIdType?: string;
  applicationId?: string;
  titleForm?: Record<string, any>;
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
  const { appId: paramAppId } = useParams<{ appId: string }>();
  // use the location.state data application ID
  const state = (location.state ?? {}) as LocationState;
  const applicationId = state.applicationId || paramAppId;
  const { ocr: dlOcr, titleOcr, titleFile } = state;
  const [selectedIdType] = useState(() => {
    return sessionStorage.getItem("selectedIdType") || "";
  });

  const [formState, setFormState] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  // 1) 必须要有 applicationId
  if (!applicationId) {
    console.error("Missing applicationId—won't fetch");
    navigate("/", { replace: true });
    return;
  }

  // 解构路由 state
  const { ocr: dlFromState, titleOcr: titleFromState, titleForm } = state as LocationState;

  // 如果上次导航就把 titleForm 传来了，优先用它
  if (titleForm && Object.keys(titleForm).length > 0) {
    console.log("Init with titleForm from state:", titleForm);
    setFormState(titleForm);
    setIsLoading(false);
    return;
  }

  // 2) 看 sessionStorage
  const storageKey = `savedFormState_${applicationId}`;
  const saved = sessionStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      console.log("Init with sessionStorage:", parsed);
      setFormState(parsed);
      setIsLoading(false);
      return;
    } catch (e) {
      console.error("Parse saved form error:", e);
    }
  }

  // 3) 最后真正去后端和 OCR 接口拉
  async function initFromServer() {
    let dl = dlFromState;
    let ti = titleFromState;

    // 如果路由 state 没带驾驶证 OCR，就去后端接口拉
    if (!dl) {
      try {
        if (!applicationId) {
          console.error("Missing applicationId—won't fetch");
          navigate("/", { replace: true });
          return;
        }
        const res = await getLatestDriverLicense(applicationId);
        if (res.ok) {
          dl = res.data;
          console.log("Fetched dlOcr from backend:", dl);
        }
      } catch (e) {
        console.warn("Failed to fetch dlOcr:", e);
      }
    }

    if (!ti) {
      try {
        if (!applicationId) {
          console.error("Missing applicationId—won't fetch");
          navigate("/", { replace: true });
          return;
        }
        ti = await getLatestTitle(applicationId);
        console.log("▶️ titleOcr flat payload:", ti);
      } catch (e) {
        console.warn("Failed to fetch titleOcr:", e);
      }
    }

    try {
      if (!applicationId) {
        console.error("Missing applicationId—won't fetch");
        navigate("/", { replace: true });
        return;
      }
      const { ok, data } = await getFormState(applicationId);
      console.log("getFormState returned:", { ok, data });

      if (ok && data.form_data && Object.keys(data.form_data).length > 0) {
        console.log("Init with form_data from backend:", data.form_data);
        setFormState(data.form_data);
      } else {
        console.log("Fallback to OCR autofill with:", { dl, ti });
        setFormState(mapOcrToFormValues(dl ?? {}, ti ?? {}, selectedIdType));
      }
    } catch (error) {
      console.error("Error fetching formState:", error);
      setFormState(mapOcrToFormValues(dl ?? {}, ti ?? {}, selectedIdType));
    } finally {
      setIsLoading(false);
    }
  }

  initFromServer();
}, [applicationId, state, selectedIdType, navigate]);

  // initialize form state with OCR data
  // const [formState, setFormState] = useState(() =>
  //   mapOcrToFormValues(dlOcr ?? {}, titleOcr ?? {}, selectedIdType)
  // );
  // init formState once with default values
  // const [formState, setFormState] = useState(() =>
  //   mapOcrToFormValues(dlOcr ?? {}, titleOcr ?? {}, selectedIdType)
  // );

  console.log("selectedIdType from session:", selectedIdType);
  console.log("generated formState:", formState);

  const handleFormChange = (newState: Record<string, any>, isValid: boolean, errors: Record<string, string>) => {
    setFormState(newState);
    setFormValid(isValid);
    setValidationErrors(errors);
    setShowAllErrors(false);
  };

  const handleNext = async () => {
     // early-exit if formState isn’t ready
    if (!formState) {
      console.error("formState not initialized");
      return;
    }
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

      try {
        await handleSave(); 
      } catch (err) {
        console.error("Failed to save form before navigation:", err);
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

  // const handleSave = () => {
  //   try {
  //     sessionStorage.setItem("savedFormState", JSON.stringify(formState));
  //     if (applicationId) {
  //       sessionStorage.setItem("savedApplicationId", applicationId);
  //     }
  //     console.log("Form data saved successfully:", formState);
  //   } catch (error) {
  //     console.error("Error saving form data:", error);
  //   }
  // };
  const handleSave = async () => {
    if (!applicationId || !formState) {
      console.error("Missing applicationId or formState");
      return;
    }
    const storageKey = `savedFormState_${applicationId}`;

    try {
      // 1. 本地缓存
      sessionStorage.setItem(storageKey, JSON.stringify(formState));

      // 2. 同步到后端
      const { ok, status, data } = await saveFormState(applicationId, formState);

      if (!ok) {
        console.error(`Server save failed: ${status}`);
      } else {
        console.log("Saved locally and to server", data);
      }
    } catch (error) {
      console.error("Error saving form data:", error);
    }
  };

  if (isLoading || !formState) {
    return <div className="loading-indicator">Loading...</div>;
  }

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