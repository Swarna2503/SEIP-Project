// src/components/CameraCapture.tsx
import  { useRef, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("❌ Cannot access camera", err);
        onClose();
      }
    })();
    return () => {
      // stop every track
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onClose]);

  const handleSnap = () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) onCapture(blob);
      onClose();
    }, "image/jpeg");
  };

  return (
    <div className="camera-overlay">
      <video ref={videoRef} autoPlay playsInline />
      <div className="camera-controls">
        <button className="btn primary" onClick={handleSnap}>
          📸 Snap
        </button>
        <button className="btn skip" onClick={onClose}>
          ✖ Cancel
        </button>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
);
}
