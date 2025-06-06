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

  // 4) The user’s current values for each field (initially set to "" or false)
  const [pdfFormData, setPdfFormData] = useState<{ [key: string]: string | boolean }>({});

  // Expose getFormData() to the parent via ref
  useImperativeHandle(ref, () => ({
    getFormData: () => pdfFormData,
  }));

  // ────────────────────────────────────────────────────────────────────────────
  // (A) LOAD EFFECT: fetch the PDFDocumentProxy whenever `url` changes
  useEffect(() => {
    console.log("[PDFViewer] 📥 load effect starting. URL =", url);
    if (!url) {
      console.warn("[PDFViewer] ⚠️ No URL provided; skipping getDocument.");
      return;
    }

    const loadingTask = getDocument(url);
    loadingTask.promise
      .then((doc) => {
        console.log("[PDFViewer] ✔️ PDF loaded →", doc);
        setPdfDoc(doc);
      })
      .catch((err) => {
        console.error("[PDFViewer] ❌ Error loading PDF:", err);
      });

    return () => {
      console.log("[PDFViewer] 🔄 load effect cleanup (did NOT destroy worker)");
      // IMPORTANT: we do NOT call loadingTask.destroy() here, or else
      // “Worker was destroyed” errors appear under StrictMode. Instead, just null‐out pdfDoc.
      setPdfDoc(null);
    };
  }, [url]);

  // ────────────────────────────────────────────────────────────────────────────
  // (B) RENDER EFFECT: once `pdfDoc` is set, actually draw page #1 into the <canvas>.
  //       We also guard against StrictMode’s double‐render by checking
  //       “if we’ve already set pageWidthPx>0, skip re‐drawing.”
  useEffect(() => {
    console.log("[PDFViewer] 🎨 render effect starting");

    if (!pdfDoc) {
      console.log("[PDFViewer] ⏳ pdfDoc is not ready yet; waiting...");
      return;
    }

    // ⚠️ IMPORTANT: only skip **after** we have truly set pageWidthPx above (i.e. real render done).
    if (pageWidthPx !== 0 && pageHeightPx !== 0) {
      console.log("[PDFViewer] ✅ Already rendered once; skipping re-render.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("[PDFViewer] ⏳ canvas not mounted yet; will retry on next render.");
      return;
    }

    console.log("[PDFViewer] ▶️ Canvas is mounted, pdfDoc is ready. Rendering page…");

    let renderTask: any = null;

    (async () => {
      try {
        // (1) Load PDF page #1
        const page = await pdfDoc.getPage(1);
        console.log("[PDFViewer] 📄 Page #1 loaded →", page);

        // (2) Create native‐size viewport (scale = 1.0)
        const scale = 1.0;
        const viewport = page.getViewport({ scale });
        console.log(`[PDFViewer] 🔍 viewport = ${viewport.width}×${viewport.height}`);

        // (3) Resize the canvas drawing buffer
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("[PDFViewer] ❌ Could not get 2D context");
          return;
        }
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // (4) Force CSS dimensions to match exactly
        canvas.style.setProperty("width", `${viewport.width}px`, "important");
        canvas.style.setProperty("height", `${viewport.height}px`, "important");

        //----------------------------------
        // ⚠️ DO NOT set pageWidthPx/pageHeightPx here! Wait until render completes.

        //----------------------------------
        // (5) Render the page into the canvas
        console.log("[PDFViewer] ⏳ Starting render…");
        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise; // wait until drawn fully
        console.log("[PDFViewer] ✅ Page rendered to canvas. Now fetching annotations…");

        // (6) Now that the page is truly drawn, set the pageWidth/PageHeight
        setPageWidthPx(viewport.width);
        setPageHeightPx(viewport.height);

        //----------------------------------
        // (7) Fetch all “Widget” annotations (form fields)
        const annotations: any[] = await page.getAnnotations({ intent: "display" });
        console.log(`[PDFViewer] 📝 Found ${annotations.length} annotations`, annotations);

        const fields: FormField[] = [];
        annotations.forEach((ann: any) => {
          if (ann.subtype === "Widget" && ann.fieldName) {
            const [x1, y1, x2, y2] = ann.rect as [number, number, number, number];
            const [xMin, yMin, xMax, yMax] =
              viewport.convertToViewportRectangle([x1, y1, x2, y2]);

            fields.push({
              id: ann.fieldName,
              fieldName: ann.fieldName,
              x: xMin,
              y: yMin,
              width: xMax - xMin,
              height: yMax - yMin,
              annotationType: ann.fieldType || "Tx",
            });

            // Initialize state for this field once
            setPdfFormData((prev) => {
              if (prev[ann.fieldName] !== undefined) return prev;
              const initialValue = ann.fieldType === "Tx" ? "" : false;
              return { ...prev, [ann.fieldName]: initialValue };
            });
          }
        });

        setFormFields(fields);
        console.log("[PDFViewer] 🗂️ Form fields set:", fields);
      } catch (err: any) {
        // Ignore “RenderingCancelledException” if we canceled on cleanup
        if (err?.name === "RenderingCancelledException") {
          console.warn("[PDFViewer] ⚠️ Render was cancelled");
        } else {
          console.error("[PDFViewer] ❌ Error during render/annotations:", err);
        }
      }
    })();

    // Cleanup: if this effect re-runs or unmounts, cancel in-flight render
    return () => {
      if (renderTask) {
        console.log("[PDFViewer] 🛑 Cancelling in-flight renderTask");
        renderTask.cancel();
      }
    };
  }, [pdfDoc, pageWidthPx, pageHeightPx]);

  // ────────────────────────────────────────────────────────────────────────────
  // When the user types or toggles a checkbox, update our pdfFormData
  function updateFieldValue(fieldName: string, newValue: string | boolean) {
    setPdfFormData((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));
  }

  // Count how many fields are still empty ("") or unchecked (false)
  const missingCount = formFields.reduce((count, f) => {
    const val = pdfFormData[f.fieldName];
    return val === "" || val === false ? count + 1 : count;
  }, 0);
  const isAllFilled = missingCount === 0;

  // ────────────────────────────────────────────────────────────────────────────
  // Show a 612×792 “Loading…” placeholder until pageWidthPx/pageHeightPx are known
  if (pageWidthPx === 0 || pageHeightPx === 0) {
    console.log("[PDFViewer] 🔄 Showing loading placeholder…");
    return (
      <div
        style={{
          width: "612px",
          height: "792px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #ddd",
          boxSizing: "content-box",
          position: "relative",
        }}
      >
        {/* Hidden canvas so that canvasRef.current is set on the next render */}
        <canvas
          ref={canvasRef}
          style={{ visibility: "hidden", width: 0, height: 0 }}
        />
        <span>Loading PDF…</span>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Now that we have real dimensions, render the canvas + input overlays
  console.log("[PDFViewer] 🖼 Rendering full canvas + overlays…");
  return (
    <div
      ref={scrollContainerRef}
      style={{
        width: `${pageWidthPx}px`,
        height: `${pageHeightPx}px`,
        position: "relative",
        overflowY: "scroll",
        border: "1px solid #ddd",
        boxSizing: "content-box",
      }}
    >
      {/* (A) The PDF canvas */}
      <canvas ref={canvasRef} style={{ display: "block" }} />

      {/* (B) One <input> per form field */}
      {formFields.map((f) => {
        if (f.annotationType === "Btn") {
          // Checkbox overlay
          return (
            <input
              key={f.id}
              type="checkbox"
              checked={Boolean(pdfFormData[f.fieldName])}
              onChange={(e) => updateFieldValue(f.fieldName, e.target.checked)}
              style={{
                position: "absolute",
                zIndex: 10,
                left: `${f.x}px`,
                top: `${f.y}px`,
                width: `${f.width}px`,
                height: `${f.height}px`,
                margin: 0,
                padding: 0,
              }}
            />
          );
        } else {
          // Text input overlay
          return (
            <input
              key={f.id}
              type="text"
              value={String(pdfFormData[f.fieldName] || "")}
              onChange={(e) => updateFieldValue(f.fieldName, e.target.value)}
              placeholder="Type here"
              style={{
                position: "absolute",
                zIndex: 10,
                left: `${f.x}px`,
                top: `${f.y}px`,
                width: `${f.width}px`,
                height: `${f.height}px`,
                lineHeight: `${f.height}px`,
                border:
                  pdfFormData[f.fieldName] === "" ||
                  pdfFormData[f.fieldName] === false
                    ? "1px solid #f56565" // red if empty
                    : "1px solid #d1d5db", // gray if completed
                backgroundColor: "#ffffff",
                fontSize: "0.875rem",
                padding: "0px",
              }}
            />
          );
        }
      })}

      {/* (C) Bottom badge showing missing count or “All fields complete” */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "0.5rem",
          backgroundColor: "rgba(255,255,255,0.75)",
        }}
      >
        {isAllFilled ? (
          <span
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: "#16a34a",
              color: "#ffffff",
              borderRadius: "0.25rem",
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
