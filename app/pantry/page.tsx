"use client";

import { useEffect, useState } from "react";
import {
  PantryItem,
  subscribeToPantry,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
} from "@/lib/pantry";
import BarcodeScanner, {
  ScannedProductData,
} from "@/components/BarcodeScanner";
import { upsertPantryItem } from "@/lib/pantryActions";
import ConfirmScannedItemModal from "@/components/ConfirmScannedItemModal";
import { ScannedItemDraft } from "@/components/ConfirmScannedItemModal";
import { useCallback } from "react";
import { useAuth } from "@/lib/useAuth";

export default function PantryPage() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    unit: "",
    count: "",
  });
  const [draft, setDraft] = useState<ScannedProductData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { user } = useAuth();
  const userId = user?.uid || "";

  const handleScannerSuccess = useCallback((data: ScannedProductData) => {
    // 1. We keep the scanner open for a split second while it finishes its internal cleanup
    setDraft(data);

    // 2. Delay the UI switch
    setTimeout(() => {
      setScannerOpen(false); // This unmounts the scanner
      setModalOpen(true); // This opens the confirmation modal
    }, 150); // 150ms buffer for hardware release
  }, []);
  const UNITS = [
    { category: "Volume (US)", name: "Teaspoon", abbr: "tsp" },
    { category: "Volume (US)", name: "Tablespoon", abbr: "tbsp" },
    { category: "Volume (US)", name: "Fluid Ounce", abbr: "fl oz" },
    { category: "Volume (US)", name: "Cup", abbr: "c" },
    { category: "Volume (US)", name: "Pint", abbr: "pt" },
    { category: "Volume (US)", name: "Quart", abbr: "qt" },
    { category: "Volume (US)", name: "Gallon", abbr: "gal" },
    { category: "Volume (US)", name: "Dash", abbr: "" },
    { category: "Volume (US)", name: "Pinch", abbr: "" },
    { category: "Volume (US)", name: "Drop", abbr: "" },

    { category: "Weight (US)", name: "Ounce", abbr: "oz" },
    { category: "Weight (US)", name: "Pound", abbr: "lb" },

    { category: "Metric", name: "Gram", abbr: "g" },
    { category: "Metric", name: "Kilogram", abbr: "kg" },
    { category: "Metric", name: "Milliliter", abbr: "mL" },
    { category: "Metric", name: "Liter", abbr: "L" },
    { category: "Other", name: "Each", abbr: "ea" },
  ];
  // Listen to firestore updates in real-time
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToPantry(userId, (data) => {
      setItems(data);
    });
    return () => unsubscribe();
  }, [userId]);
  //handle adding new item
  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    await addPantryItem(userId, {
      name: newItem.name,
      quantity: Number(newItem.quantity) || 0,
      unit: newItem.unit || "",
      count: Number(newItem.count) || 0,
    });
    setNewItem({ name: "", quantity: "", unit: "", count: "" });
  }

  async function handleUpdateQuantity(id: string, qty: number) {
    await updatePantryItem(userId, id, { quantity: qty });
  }

  async function handleUpdateCount(id: string, count: number) {
    await updatePantryItem(userId, id, { count: count });
  }
  async function handleDelete(id: string) {
    await deletePantryItem(userId, id);
  }
  async function handleConfirm(item: ScannedItemDraft) {
    try {
      await upsertPantryItem(userId, {
        name: item.name,
        count: item.count,
        quantity: item.quantity ?? 0,
        unit: item.units ?? "pcs",
        // 🛡️ Fix: convert null to undefined
        barcode: item.barcode || undefined,
      });

      setModalOpen(false);
    } catch (error) {
      console.error("Error saving to pantry:", error);
    }
  }
  return (
    <div className="max-w-3xl mx-auto p6">
      <h1 className="text-3xl font-bold mb-6">Pantry Inventory</h1>
      {/* Add Item Form */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setScannerOpen(true)}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
          >
            📷 Scan Item
          </button>
        </div>
      </div>

      {/* THE SCANNER OVERLAY */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-full max-w-md">
            <BarcodeScanner
              onClose={() => setScannerOpen(false)}
              onSuccess={handleScannerSuccess}
            />
          </div>
        </div>
      )}

      {/* THE CONFIRMATION MODAL (Outside the scanner) */}
      {modalOpen && draft && (
        <ConfirmScannedItemModal
          key={draft.barcode} // Resets form for every new scan
          open={modalOpen}
          barcode={draft.barcode}
          initialName={draft.name}
          initialQuantity={draft.quantity}
          initialUnit={draft.unit}
          onConfirm={async (item) => {
            await handleConfirm(item);
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
        />
      )}

      <form
        onSubmit={handleAddItem}
        className="shadow p-4 rounded mb-6 grid grid-cols-3 gap-3"
      >
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="border rounded p-2 w-full col-span-1"
        />
        <input
          type="number"
          placeholder="Count"
          value={newItem.count}
          onChange={(e) => setNewItem({ ...newItem, count: e.target.value })}
          className="border rounded p-2 w-full col-span-1 "
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
          className="border rounded p-2 w-full col-span-1 "
        />

        <select
          value={newItem.unit}
          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
          className="border rounded p-2 w-full col-span-1"
        >
          <option value="">Select Unit</option>

          {UNITS.map((u, i) => (
            <option key={i} value={u.abbr || u.name}>
              {u.name} {u.abbr ? `(${u.abbr})` : ""}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="col-span-3 bg-blue-600 font-semibold py-2 rounded hover:bg-blue-700"
        >
          Add Item
        </button>
      </form>
      {/* Pantry Items List */}
      <div className="shadow rounded p-4">
        {items.length === 0 ? (
          <p className="text-gray-500">No items in pantry.</p>
        ) : (
          <table className="w-full table-auto">
            <thead>
              <tr className="border-b text-gray-700 font-demibold">
                <th className="py-2">Item</th>
                <th className="py-2">count</th>
                <th className="py-2">Quantity</th>
                <th className="py-2">Unit</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2 text-center">{item.name}</td>
                  <td className="py-2 text-center">
                    <input
                      type="Count"
                      value={item.count}
                      onChange={(e) =>
                        handleUpdateCount(item.id!, Number(e.target.value))
                      }
                      className="border rounded p-1 w-20"
                    />
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(item.id!, Number(e.target.value))
                      }
                      className="border rounded p-1 w-20"
                    />
                  </td>
                  <td className="py-2 text-center">{item.unit}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleDelete(item.id!)}
                      className="text-red-600 hover:underline"
                    >
                      {" "}
                      Delete{" "}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
