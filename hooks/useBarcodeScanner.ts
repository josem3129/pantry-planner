import { useEffect, useRef } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

export function UseBarcodeScanner(
  onDetected: (barcode: string) => void,
  active: boolean
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  console.log("UseBarcodeScanner active:", active);
  useEffect(() => {
    // If not active, ensure we clean up and exit
    if (!active) {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
      return;
    }

    const reader = new BrowserMultiFormatReader();
    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
    ]);

    // Set hints on the reader
    reader.setHints(hints);

    async function setupCamera() {
      try {
        if (!videoRef.current) return;

        // Force stop any existing stream on this video element before starting
        if (videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((t) => t.stop());
          videoRef.current.srcObject = null;
        }

        // Inside UseBarcodeScanner setupCamera function
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result, error) => {
            if (result && active) {
              // 1. Stop processing logic
              controls.stop();

              // 2. IMMEDIATE Hardware Shutdown
              // This is what turns the green light off on the laptop/phone
              if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => {
                  track.stop();
                  console.log("Stopping track:", track.label);
                });
                videoRef.current.srcObject = null;
              }

              const code = result.getText();
              onDetected(code);
            }
          }
        );

        controlsRef.current = controls;
      } catch (err) {
        // This is where your "false" error was caught
        console.error("Failed to start ZXing:", err);
      }
    }

    setupCamera();

    return () => {
  console.log("Cleaning up camera...");
  if (controlsRef.current) {
    controlsRef.current.stop();
    controlsRef.current = null;
  }
  
  if (videoRef.current) {
    const stream = videoRef.current.srcObject as MediaStream;
    if (stream) {
      // Forcefully kill every track
      stream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false; // Extra safety
      });
    }
    videoRef.current.srcObject = null; // Break the DOM link
    videoRef.current.load(); // Forces the video element to reset
  }
};
  }, [active, onDetected]);

  return { videoRef };
}
