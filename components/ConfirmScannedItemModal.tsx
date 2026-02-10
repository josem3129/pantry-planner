"use client";

import { useState } from "react";
import { X } from "lucide-react";

/* ---------------- Types ---------------- */

export type ScannedItemDraft = {
  name: string;
  count: number;
  units?: string;
  category?: string;
  quantity?: number;
  barcode?: string | null;
};

type Props = {
  barcode?: string | null;
  initialName?: string;
  initialQuantity?: number;
  initialUnit?: string;

  open: boolean;
  onCancel: () => void;
  onConfirm: (item: ScannedItemDraft) => void;
};

/* ---------------- Component ---------------- */

export default function ConfirmScannedItemModal({
  barcode,
  initialName = "",
  initialQuantity,
  initialUnit = "pcs",
  open,
  onCancel,
  onConfirm,
}: Props) {
  const [name, setName] = useState(initialName);
  const [count, setCount] = useState(1);
  const [quantity, setQuantity] = useState<number | "">(initialQuantity ?? "");
  const [unit, setUnit] = useState(initialUnit);


  if (!open) return null;

  console.log("Current values:", { name, count, quantity, unit });
  const canConfirm = name.trim().length > 0 && count >= 1;
// The handleConfirm function is responsible for invoking the onConfirm callback with the current state of the scanned item. It constructs an object that includes the name, count, quantity, unit, and barcode (if available) and passes it to the parent component for further processing, such as adding the item to the pantry list.
function handleConfirm() {
  onConfirm({
    // Use the local state variables, NOT the initial props
    name: name, 
    count: Number(count),
    quantity: Number(quantity),
    units: unit,
    barcode: barcode || undefined,
  });
  debugger
}


  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-lg p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Product Scanned</h2>
          <button onClick={onCancel}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Product Name */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Product Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter product name"
          />
        </div>

        {/* Count */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Count</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="px-3 py-1 border rounded"
            >
              −
            </button>
            <span className="font-medium">{count}</span>
            <button
              onClick={() => setCount((c) => c + 1)}
              className="px-3 py-1 border rounded"
            >
              +
            </button>
          </div>
        </div>

        {/* Quantity + Unit */}
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Quantity (per item)
            </label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="pcs">pcs</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="oz">oz</option>
              <option value="lb">lb</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
            </select>
          </div>
        </div>
        {/* Barcode */}
        <div className="text-xs text-gray-500 mb-4">
          Barcode: {barcode}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 border rounded py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 bg-blue-600 text-white rounded py-2 disabled:opacity-50"
          >
            Add to Pantry
          </button>
        </div>
      </div>
    </div>
  );
}
