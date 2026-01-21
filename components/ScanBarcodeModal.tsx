"use client";

import { useEffect, useRef, useState } from "react";
import { X, Camera } from "lucide-react";
import {
  BrowserMultiFormatReader,
  IScannerControls,
} from "@zxing/browser";

type Props = {
  open: boolean;
  onClose: () => void;
  onDetected?: (barcode: string) => void;
};

export default function ScanBarcodeModal({ open, onClose, onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Camera lifecycle ---------------- */
  useEffect(() => {
    if (!open) return;

    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    let active = true;

    async function startCamera() {
      try {
        setScanning(true);
        setError(null);

        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result) => {
            if (!active || !result || detected) return;

            const text = result.getText();
            setDetected(text);
            setScanning(false);

            onDetected?.(text);

            // ✅ STOP camera immediately after detection
            controls.stop();
          }
        );

        controlsRef.current = controls;
      } catch (err) {
        console.error(err);
        setError("Camera access denied or unavailable.");
        setScanning(false);
      }
    }

    startCamera();

    return () => {
      active = false;
      controlsRef.current?.stop();
      controlsRef.current = null;
      readerRef.current = null;
      setDetected(null);
      setScanning(false);
    };
  }, [open, detected, onDetected]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-4 shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Scan Barcode</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Camera */}
        <div className="aspect-square bg-black rounded-lg overflow-hidden mb-3 relative">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />

          {!scanning && !detected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/40">
              <Camera className="w-10 h-10 mb-2" />
              <p className="text-sm">Starting camera…</p>
            </div>
          )}
        </div>

        {/* Status */}
        {detected && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded p-2 text-center mb-2">
            Barcode detected: <strong>{detected}</strong>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded p-2 text-center mb-2">
            {error}
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Align the barcode inside the frame
        </p>
      </div>
    </div>
  );
}
