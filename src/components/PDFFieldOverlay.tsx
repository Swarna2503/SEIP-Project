// src/components/PDFFieldOverlay.tsx

import React from "react";

interface PDFFieldOverlayProps {
  /**
   * The unique key for this field (e.g. "applicant.firstName").
   */
  fieldKey: string;

  /**
   * Position and size (in pixels) relative to the top-left of the canvas.
   */
  x: number;
  y: number;
  width: number;
  height: number;

  /**
   * The current string value for this field from our hook.
   */
  value: string;

  /**
   * Whether this field is required. If empty, we’ll show a red border.
   */
  required: boolean;

  /**
   * Callback to update the field’s value when the user types.
   */
  onChange: (newValue: string) => void;
}

export default function PDFFieldOverlay({
  fieldKey,
  x,
  y,
  width,
  height,
  value,
  required,
  onChange,
}: PDFFieldOverlayProps) {
  return (
    <input
      type="text"
      name={fieldKey}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={required && value.trim() === "" ? "Required" : ""}
      className={`
        absolute
        z-10                     /* sits above the canvas (z-0) */
        bg-white
        ${required && value.trim() === "" ? "border-red-500" : "border-gray-300"}
        border
        px-1
        text-sm
      `}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
}
