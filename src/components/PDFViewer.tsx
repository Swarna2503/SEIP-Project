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
  /** URL to the PDF to render */
  url: string;
  /** Zoom factor: 1 = 100%, 1.5 = 150%, etc. */
  zoom?: number;
}

export interface PDFViewerHandle {
  /** Returns the current form data (text and checkbox values) */
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

// point PDF.js at its WebWorker
GlobalWorkerOptions.workerSrc = workerSrc as string;

const PDFViewer = forwardRef<PDFViewerHandle, PDFViewerProps>(
  ({ url, zoom = 1 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // PDF.js document proxy
    const [pdfDoc, setPdfDoc] = useState<any>(null);
    // Page dimensions *in PDF points* after zoom
    const [pageWidthPx, setPageWidthPx] = useState(0);
    const [pageHeightPx, setPageHeightPx] = useState(0);

    // Detected form fields
    const [formFields, setFormFields] = useState<FormField[]>([]);
    // User-entered values
    const [pdfFormData, setPdfFormData] = useState<{
      [key: string]: string | boolean;
    }>({});

    // Expose getFormData() to parent
    useImperativeHandle(ref, () => ({
      getFormData: () => pdfFormData,
    }));

    // ────────────────────────────────────────────────────────────────────────────
    // 1) Load the PDF when `url` changes
    useEffect(() => {
      if (!url) return;
      const loadingTask = getDocument(url);
      loadingTask.promise
        .then((doc) => setPdfDoc(doc))
        .catch((err) =>
          console.error("[PDFViewer] ❌ Error loading PDF:", err)
        );
      return () => setPdfDoc(null);
    }, [url]);

    // ────────────────────────────────────────────────────────────────────────────
    // 2) Render page #1 once pdfDoc is ready, using our `zoom` factor
    useEffect(() => {
      if (!pdfDoc) return;
      // Don’t re-render if we already have dimensions
      if (pageWidthPx && pageHeightPx) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      let renderTask: any = null;
      (async () => {
        try {
          // 2a) Load page #1
          const page = await pdfDoc.getPage(1);
          // 2b) Create a viewport at our zoom
          const viewport = page.getViewport({ scale: zoom });
          // 2c) Resize canvas buffer
          const ctx = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          // 2d) Stretch/shrink the canvas in CSS to match
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          // 2e) Kick off render
          renderTask = page.render({ canvasContext: ctx, viewport });
          await renderTask.promise;

          // 2f) Now that it’s painted, record dims for overlays
          setPageWidthPx(viewport.width);
          setPageHeightPx(viewport.height);

          // 2g) Grab the form “Widget” annotations
          const annots: any[] = await page.getAnnotations({ intent: "display" });
          const fields: FormField[] = [];

          annots.forEach((ann) => {
            if (ann.subtype === "Widget" && ann.fieldName) {
              // Convert PDF coords → CSS coords
              // ann.rect = [x1, y1, x2, y2] in PDF points
              const [x1, y1, x2, y2] = ann.rect as [
                number, number, number, number
              ];
              // Convert each corner
              const [x1p, y1p] = viewport.convertToViewportPoint(x1, y1);
              const [x2p, y2p] = viewport.convertToViewportPoint(x2, y2);

              // PDF origin is bottom‐left; CSS origin is top‐left
              const x = x1p;
              const y = y2p;
              const width = x2p - x1p;
              const height = y1p - y2p;

              fields.push({
                id: ann.fieldName,
                fieldName: ann.fieldName,
                x,
                y,
                width,
                height,
                annotationType: ann.fieldType || "Tx",
              });

              // initialize formData state
              setPdfFormData((prev) => {
                if (prev[ann.fieldName] !== undefined) return prev;
                return {
                  ...prev,
                  [ann.fieldName]:
                    ann.fieldType === "Btn" ? false : "",
                };
              });
            }
          });

          // ─── debug: show table of all fields & their coords ───
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
          if (err.name !== "RenderingCancelledException") {
            console.error(
              "[PDFViewer] ❌ Error during render/annotations:",
              err
            );
          }
        }
      })();

      return () => {
        if (renderTask) renderTask.cancel();
      };
    }, [pdfDoc, zoom, pageWidthPx, pageHeightPx]);

    // ────────────────────────────────────────────────────────────────────────────
    // 3) User changes a field
    const updateFieldValue = (
      fieldName: string,
      newValue: string | boolean
    ) => {
      setPdfFormData((prev) => ({ ...prev, [fieldName]: newValue }));
    };

    // Show a loading placeholder until we know the page dims
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
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ visibility: "hidden", width: 0, height: 0 }}
          />
          Loading PDF…
        </div>
      );
    }

    // ────────────────────────────────────────────────────────────────────────────
    // 4) Render canvas + overlays
    return (
      <div
        style={{
          position: "relative",
          width:    `${pageWidthPx}px`,
          height:   `${pageHeightPx}px`,
          overflow: "auto",
          border:   "1px solid #ddd",
        }}
      >
        {/* PDF itself */}
        <canvas ref={canvasRef} style={{ display: "block" }} />

        {/* One input per form field */}
        {formFields.map((f) => {
          console.debug(
            `[PDFViewer] overlay ${f.fieldName} @ x=${f.x}, y=${f.y}, w=${f.width}, h=${f.height}`
          );

          // common style
          const style: React.CSSProperties = {
            position:        "absolute",
            left:            `${f.x}px`,
            top:             `${f.y}px`,
            width:           `${f.width}px`,
            height:          `${f.height}px`,
            boxSizing:       "border-box",
            zIndex:          10,
            backgroundColor: "rgba(255,255,255,0.8)",
            border:          "1px dashed #f00", // debug border
          };

          if (f.annotationType === "Btn") {
            return (
              <input
                key={f.id}
                type="checkbox"
                checked={Boolean(pdfFormData[f.fieldName])}
                onChange={(e) =>
                  updateFieldValue(f.fieldName, e.target.checked)
                }
                style={style}
              />
            );
          } else {
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
                  ...style,
                  border:
                    pdfFormData[f.fieldName] === ""
                      ? "1px solid #f56565"
                      : "1px solid #2d3748",
                }}
              />
            );
          }
        })}
      </div>
    );
  }
);

export default PDFViewer;
