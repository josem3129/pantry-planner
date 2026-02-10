"use client";

import { useState, useCallback } from "react";
import { UseBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { lookupProductByBarcode } from "@/lib/openFoodFacts";

// Define the structure of the product data we expect to receive after scanning a barcode
export interface ScannedProductData {
  barcode: string;
  name: string;
  quantity: number;
  unit: string;
  count: number;
  brand?: string;
}

// Define the props for the BarcodeScanner component, including callbacks for closing the scanner and handling successful scans
type BarcodeScannerProps = {
  onClose: () => void;
  onSuccess: (productData: ScannedProductData) => void;
};

// The BarcodeScanner component provides a user interface for scanning barcodes using the device's camera. It handles the scanning process, looks up product information based on the scanned barcode, and communicates results back to the parent component through callbacks.
export default function BarcodeScanner({
  onClose,
  onSuccess,
}: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(true);

  const handleHardReload = () => {
    window.location.reload();
  };

  // We use the hook to handle the camera lifecycle
  const onDetected = useCallback(
    async (code: string) => {
      if (!scanning) return;

      setScanning(false);

      const product = await lookupProductByBarcode(code);

      if (product) {
        onSuccess({
          barcode: code,
          name:
            product.name + (product.brand ? ` (${product.brand})` : "") || "", // Use actual data if available
          quantity: product.quantity || 0,
          unit: product.unit || "pcs",
          count: 1,
        });
      }
    },
    [scanning, onSuccess],
  );

// The videoRef is used to display the camera feed, and the onDetected callback is triggered when a barcode is successfully scanned. The component also includes a visual overlay to guide users in positioning the barcode correctly within the camera frame.
  const { videoRef } = UseBarcodeScanner(onDetected, scanning);
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border-2 border-blue-500 shadow-lg">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          muted
          playsInline
          autoPlay
          disablePictureInPicture
        />
        <p className="text-sm text-gray-500 text-center mt-2">
          Hold barcode steady • Good lighting • Fill the frame
        </p>

        {/* Visual Scanner Overlay */}
        <div className="absolute inset-0 border-2 border-white/30 pointer-events-none flex items-center justify-center">
          <div className="w-4/5 h-1/2 border-2 border-blue-400 opacity-50 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
        </div>
      </div>

      <button
        onClick={handleHardReload}
        className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition"
      >
        Cancel
      </button>
    </div>
  );
}
