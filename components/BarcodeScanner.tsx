"use client";

import {  useState, useCallback } from "react";
import { UseBarcodeScanner } from "@/hooks/useBarcodeScanner";
import { lookupProductByBarcode } from "@/lib/openFoodFacts";

export interface ScannedProductData {
  barcode: string;
  name: string;
  quantity: number;
  unit: string;
  count: number;
  brand?: string;
}

type BarcodeScannerProps = {
  onClose: () => void;
  onSuccess: (productData: ScannedProductData) => void;
};

export default function BarcodeScanner({ onClose, onSuccess }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(true);

  const handleHardReload = () => {
  window.location.reload();
};

  // We use the hook to handle the camera lifecycle
  const onDetected = useCallback(async (code: string) => {
    if (!scanning) return;
    
    setScanning(false); 

    const product = await lookupProductByBarcode(code);

    if (product) {
      onSuccess({
        barcode: code,
        name: product.name + (product.brand ? ` (${product.brand})` : "") || "", // Use actual data if available
        quantity: product.quantity || 0,
        unit: product.unit || "pcs",
        count: 1
      });
    }
  }, [scanning, onSuccess]);
  
  const { videoRef } = UseBarcodeScanner(onDetected, scanning);
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border-2 border-blue-500 shadow-lg">
        <video
          ref={videoRef}
          className="w-full h-64 object-cover"
          muted
          playsInline
        />
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