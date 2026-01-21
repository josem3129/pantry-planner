"use client";

import { useState } from "react";
import { UseBarcodeScanner } from "@/hooks/useBarcodeScanner";
import ConfirmScannedItemModal, { ScannedItemDraft } from "@/components/ConfirmScannedItemModal";
import { lookupProductByBarcode } from "@/lib/openFoodFacts";

export default function ScanPantryItemPage() {
    const [scanning, setScanning] = useState(true);
    const [barcode, setBarcode] = useState<string | null>(null);
    const [draft, setDraft] = useState<ScannedItemDraft | null>(null);

    const { videoRef } = UseBarcodeScanner(async (code) => {
        setScanning(false);
        const product = await lookupProductByBarcode(code);

        if (product) {
            setDraft({
              name: product.name,
              barcode: code,
              units: "pcs",
              count: 1,
            })
        }else{
          setBarcode(code); //fallback to just barcode
        }
    }, scanning);

    return (
        <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Scan Item</h1>

      {scanning && (
        <video
          ref={videoRef}
          className="w-full rounded-lg border"
          muted
          playsInline
        />
      )}

      {barcode && (
        <ConfirmScannedItemModal
          key={barcode}
          open={true}
          barcode={barcode}
          onCancel={() => {
            setBarcode(null);
            setScanning(true); 
          }}
          onConfirm={(item) => {
            console.log("CONFIRMED ITEM:", item);
            setBarcode(null);
            setScanning(true);
          }}
        />
      )}
    </div>
  );
}