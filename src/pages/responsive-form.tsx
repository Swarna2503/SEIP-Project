import  { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Responsive130UForm from "../components/Responsive130UForm";
import { fields } from "../components/Responsive130UForm";
import { STATE_NAMES } from "../utils/stateAbbreviations";
import { getFormState, saveFormState } from "../apis/form";
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
    // 1. 如果没有 state，跳回首页
    if (!state) {
      navigate("/", { replace: true });
      return;
    }

    const storageKey = `savedFormState_${applicationId}`;

    // 2. 本地有缓存就直接用
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      try {
        setFormState(JSON.parse(saved));
      } catch (e) {
        console.error("Parse saved form error:", e);
        // parse 失败，退回到后端拉取
        fetchFromServer();
      } finally {
        setIsLoading(false);
      }
    } else {
      // 3. 本地没有，再去后端拉
      fetchFromServer();
    }

    // 抽出来的后端拉取函数
    async function fetchFromServer() {
      if (!applicationId) {
        console.error("Missing applicationId—won't fetch");
        setIsLoading(false);
        return;
      }
      try {
        const { ok, data } = await getFormState(applicationId);
        if (ok && Object.keys(data).length > 0) {
          // 后端有，覆盖
          setFormState(data);
        } else {
          // 后端没有，保留 OCR 自动填充的初始值
          setFormState(
            mapOcrToFormValues(dlOcr ?? {}, titleOcr ?? {}, selectedIdType)
          );
        }
      } catch (error) {
        console.error("Error fetching from server:", error);
        setFormState(
          mapOcrToFormValues(dlOcr ?? {}, titleOcr ?? {}, selectedIdType)
        );
      } finally {
        setIsLoading(false);
      }
    }
  }, [applicationId, dlOcr, titleOcr, selectedIdType, navigate]);

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