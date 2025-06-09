// src/components/PDFViewer.tsx

import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

interface PDFViewerProps {
  url: string;
}

export interface PDFViewerHandle {
  getFormData: () => { [key: string]: string | boolean };
}

interface FormField {
  id: string;
  fieldName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  annotationType: string;
}

// Point PDF.js at its worker file:
GlobalWorkerOptions.workerSrc = workerSrc as string;

const PDFViewer = forwardRef<PDFViewerHandle, PDFViewerProps>(({ url }, ref) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1) Holds the PDFDocumentProxy once getDocument(url) resolves
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  // 2) Only set these AFTER a successful render. Until then, keep them at 0.
  const [pageWidthPx, setPageWidthPx] = useState<number>(0);
  const [pageHeightPx, setPageHeightPx] = useState<number>(0);

  // 3) After we fetch “Widget” annotations, store each as a FormField
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // 4) The user’s current values for each field (initially "" or false)
  const [pdfFormData, setPdfFormData] = useState<{ [key: string]: string | boolean }>(
    {}
  );

  // Expose getFormData() to the parent via ref
  useImperativeHandle(ref, () => ({
    getFormData: () => pdfFormData,
  }));

  // ────────────────────────────────────────────────────────────────────────────
  // (A) LOAD EFFECT: fetch the PDFDocumentProxy whenever `url` changes
  useEffect(() => {
    if (!url) return;
    const loadingTask = getDocument(url);
    loadingTask.promise
      .then((doc) => setPdfDoc(doc))
      .catch((err) => console.error("[PDFViewer] Error loading PDF:", err));
    return () => {
      setPdfDoc(null);
    };
  }, [url]);

  // ────────────────────────────────────────────────────────────────────────────
  // (B) RENDER EFFECT: once `pdfDoc` is set, actually draw page #1 into the <canvas>.
  useEffect(() => {
    if (!pdfDoc) return;
    if (pageWidthPx !== 0 && pageHeightPx !== 0) return; // already rendered

    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderTask: any = null;

    (async () => {
      try {
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });

        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.setProperty("width", `${viewport.width}px`, "important");
        canvas.style.setProperty("height", `${viewport.height}px`, "important");

        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;

        // Now set dimensions so overlays can appear
        setPageWidthPx(viewport.width);
        setPageHeightPx(viewport.height);

        // Fetch all “Widget” annotations (form fields)
        const annotations: any[] = await page.getAnnotations({ intent: "display" });
        const fields: FormField[] = [];

        annotations.forEach((ann) => {
          if (ann.subtype === "Widget" && ann.fieldName) {
            // PDF.js returns [left, bottom, right, top]
            const [left, bottom, right, top] =
              viewport.convertToViewportRectangle(ann.rect);

            const width  = right  - left;
            const height = bottom - top;

            fields.push({
              id:             ann.fieldName,
              fieldName:      ann.fieldName,
              x:              left,
              y:              top,
              width,
              height,
              annotationType: ann.fieldType || "Tx",
            });

            // Initialize formData state for this field
            setPdfFormData((prev) => {
              if (prev[ann.fieldName] !== undefined) return prev;
              const initialValue = ann.fieldType === "Btn" ? false : "";
              return { ...prev, [ann.fieldName]: initialValue };
            });
          }
        });

        // ───── Debug: log a table of all computed fields ─────
        console.table(
          fields.map((f) => ({
            name:   f.fieldName,
            x:      Math.round(f.x),
            y:      Math.round(f.y),
            width:  Math.round(f.width),
            height: Math.round(f.height),
          }))
        );

        setFormFields(fields);
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("[PDFViewer] Error during render/annotations:", err);
        }
      }
    })();

    return () => {
      if (renderTask) renderTask.cancel();
    };
  }, [pdfDoc, pageWidthPx, pageHeightPx]);

  // Update field value when user types or toggles a checkbox
  function updateFieldValue(fieldName: string, newValue: string | boolean) {
    setPdfFormData((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  }

  // Count how many are still empty or unchecked
  const missingCount = formFields.reduce((count, f) => {
    const val = pdfFormData[f.fieldName];
    return val === "" || val === false ? count + 1 : count;
  }, 0);
  const isAllFilled = missingCount === 0;

  // Show a placeholder until we know page dimensions
  if (pageWidthPx === 0 || pageHeightPx === 0) {
    return (
      <div
        style={{
          width:  "612px",
          height: "792px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #ddd",
          position: "relative",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ visibility: "hidden", width: 0, height: 0 }}
        />
        <span>Loading PDF…</span>
      </div>
    );
  }

  // Render the canvas + form field overlays
  return (
    <div
      ref={scrollContainerRef}
      style={{
        width:       `${pageWidthPx}px`,
        height:      `${pageHeightPx}px`,
        position:    "relative",
        overflowY:   "auto",
        border:      "1px solid #ddd",
        boxSizing:   "content-box",
      }}
    >
      {/* PDF Canvas */}
      <canvas ref={canvasRef} style={{ display: "block" }} />

      {/* Overlay Inputs */}
      {formFields.map((f) => {
        console.debug(
          `[PDFViewer] overlay ${f.fieldName} @ x=${f.x}, y=${f.y}, w=${f.width}, h=${f.height}`
        );

        if (f.annotationType === "Btn") {
          // Checkbox
          return (
            <input
              key={f.id}
              type="checkbox"
              checked={Boolean(pdfFormData[f.fieldName])}
              onChange={(e) =>
                updateFieldValue(f.fieldName, e.target.checked)
              }
              style={{
                position: "absolute",
                zIndex:   10,
                left:     `${f.x}px`,
                top:      `${f.y}px`,
                width:    `${f.width}px`,
                height:   `${f.height}px`,
                margin:   0,
                padding:  0,
              }}
            />
          );
        } else {
          // Text input
          return (
            <input
              key={f.id}
              type="text"
              value={String(pdfFormData[f.fieldName] || "")}
              onChange={(e) =>
                updateFieldValue(f.fieldName, e.target.value)
              }
              placeholder="Type here"
              style={{
                position:         "absolute",
                zIndex:           10,
                left:             `${f.x}px`,
                top:              `${f.y}px`,
                width:            `${f.width}px`,
                height:           `${f.height}px`,
                lineHeight:       `${f.height}px`,
                border:
                  pdfFormData[f.fieldName] === "" ||
                  pdfFormData[f.fieldName] === false
                    ? "1px solid #f56565"
                    : "1px solid #d1d5db",
                backgroundColor:  "#ffffff",
                fontSize:         "0.875rem",
                padding:          "0px",
              }}
            />
          );
        }
      })}

      {/* Footer badge */}
      <div
        style={{
          position:  "absolute",
          bottom:    0,
          left:      0,
          width:     "100%",
          padding:   "0.5rem",
          backgroundColor: "rgba(255,255,255,0.75)",
        }}
      >
        {isAllFilled ? (
          <span
            style={{
              display:   "inline-block",
              padding:   "0.5rem 1rem",
              backgroundColor: "#16a34a",
              color:     "#fff",
              borderRadius:    "0.25rem",
            }}
          >
            All fields complete
          </span>
        ) : (
          <span style={{ color: "#dc2626" }}>
            Missing {missingCount} field(s)
          </span>
        )}
      </div>
    </div>
  );
});

export default PDFViewer;
