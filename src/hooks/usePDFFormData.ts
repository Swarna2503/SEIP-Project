// src/hooks/usePDFFormData.ts

import { useState, useMemo } from "react";
import type { PDFFieldDescriptor } from "../types/formSchema";
import { formSchema } from "../types/formSchema";

type FormValues = { [key: string]: string };

export function usePDFFormData() {
  // 1) Build initialValues: each field.key → ""
  const initialValues: FormValues = {};
  formSchema.forEach((field: PDFFieldDescriptor) => {
    initialValues[field.key] = "";
  });

  // 2) Create state for these values
  const [pdfFormData, setPdfFormData] = useState<FormValues>(initialValues);

  // 3) Function to update a single field’s value
  function updatePDFField(key: string, newValue: string) {
    setPdfFormData((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  }

  // 4) Compute missingCount: how many required fields are still empty
  const missingCount = useMemo(() => {
    let count = 0;
    formSchema.forEach((field) => {
      if (field.required && pdfFormData[field.key].trim() === "") {
        count++;
      }
    });
    return count;
  }, [pdfFormData]);

  // 5) Boolean that’s true only when no required field is blank
  const isAllFilled = useMemo(() => missingCount === 0, [missingCount]);

  return {
    pdfFormData,         // current values for every field
    updatePDFField,      // function to change one field’s value
    missingCount,        // how many required fields are still empty
    isAllFilled,         // true only if missingCount === 0
  };
}
