import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Responsive130UForm from "../components/Responsive130UForm";
import { fields } from "../components/Responsive130UForm";
import "../styles/responsive-form.css";

interface LocationState {
  ocr?: any;
  titleOcr?: any;
  titleFile?: File;
  selectedIdType?: string;
}

export default function ResponsiveFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const { ocr: dlOcr, titleOcr, titleFile} = state ?? {};
  const [selectedIdType, setSelectedIdType] = useState("");

  useEffect(() => {
    const storedIdType = sessionStorage.getItem("selectedIdType");
    if (storedIdType) {
      setSelectedIdType(storedIdType);
    }
  }, []);


  console.log("Driver License OCR:", dlOcr);
  console.log("Title OCR:", titleOcr);
  console.log("Selected ID Type:", selectedIdType);

  function mapOcrToFormValues(dl: any, titleOcr: any, idType: string): Record<string, any> {
    // 1) define defaults for the form fields
    const defaults: Record<string, string | boolean> = Object.fromEntries(
      fields.map(f => [f.id, f.type === "checkbox" ? false : ""])
    );

    // Map selectedIdType to corresponding checkbox key
    const idTypeMap: Record<string, keyof typeof defaults> = {
      "U.S. Driver License/ID Card": "usDriverLicense",
      "US Military ID":              "usMilitaryId",
      "Passport":                  "passport",
      "NATO ID":                     "natoId",
      "Immigration":                "uscisId",
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
    const previousCity  = parts[1] || "";
    const previousState = parts[2]?.split(" ")[0] || "";

    const autoFill: Record<string, any> = {
      // Responsive130UForm checkbox fields
      ...idCheckboxes,
      // car title information
      vehicleIdentificationNumber: titleOcr?.vehicle_identification_number ?? "",
      vehicleYear:                 titleOcr?.year_model?.toString()           ?? "",
      vehicleMake:                 titleOcr?.make_of_vehicle                   ?? "",
      vehicleBodyStyle:            titleOcr?.body_style                       ?? "",
      vehicleModel:                titleOcr?.model                            ?? "",
      emptyWeight:                 titleOcr?.mfg_capacity_in_tons?.toString() ?? "",
      // previous owner
      previousOwner:               titleOcr?.owner_name                   ?? "",
      previousCity,
      previousState,
      // driver license information
      photoIdNumber:               dl?.dlNumber ?? "",
      applicantName:               dl?.first_name ?? "",
      applicantLastName:           dl?.last_name ?? "",
      applicantMailingAddress:     dl?.street_address ?? dl?.address ?? "",
      applicantCity:               dl?.city ?? "",
      applicantState:              dl?.state ?? "",
      applicantZip:                dl?.zip_code ?? "",
    };


    // 4) merge: defaults → autoFill → idMap
    return {
      ...defaults,
      ...autoFill,
    };
  }

 // initialize form state with OCR data
  const [formState, setFormState] = useState(() =>
    mapOcrToFormValues(dlOcr ?? {}, titleOcr ?? {}, selectedIdType)
  );

  // OCR data may change, so need to update form state accordingly
  useEffect(() => {
    setFormState(mapOcrToFormValues(dlOcr ?? {}, titleOcr ?? {}, selectedIdType));
  }, [dlOcr, titleOcr, selectedIdType]);

  const handleFormChange = (newState: Record<string, any>) => {
    setFormState(newState);
  };

  const handleNext = () => {
    navigate("/review-submit", {
      state: { 
        ocr: dlOcr, 
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
            initialValues={formState}
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