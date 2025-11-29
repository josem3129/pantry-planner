"use client";

import { useEffect, useState } from "react";
import {
  PantryItem,
  subscribeToPantry,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
} from "@/lib/pantry";
import { table } from "console";

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    unit: "",
  });

  // Listen to firestore updates in real-time 
  useEffect(() => {
    const unsubscribe = subscribeToPantry((data) => {
      setItems(data);
    });
    return () => unsubscribe();
  }, []);

  //handle adding new item
  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    await addPantryItem({
      name: newItem.name,
      quantity: Number(newItem.quantity) || 0,
      unit: newItem.unit || "",
    });
    setNewItem({ name: "", quantity: "", unit: "" });
  }

  async function handleUpdateQuantity(id: string, qty: number) {
    await updatePantryItem(id, { quantity: qty });
  }

  async function handleDelete(id: string) {
    await deletePantryItem(id);
  }

  return (
    <div className="max-w-3xl mx-auto p6">
      <h1 className="text-3xl font-bold mb-6">Pantry Inventory</h1>
      {/* Add Item Form */}
      <form 
      onSubmit={handleAddItem}
      className="shadow p-4 rounded mb-6 grid grid-cols-3 gap-3">
        <input type="text" 
        placeholder="Item Name"
        value={newItem.name}
        onChange={(e) => setNewItem({...newItem, name: e.target.value})}
        className="border rounded p-2 w-full col-span-1"/>
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
          className="border rounded p-2 w-full col-span-1 "
        />

        <input
          type="text"
          placeholder="Unit (oz, lbs, cups)"
          value={newItem.unit}
          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
          className="border rounded p-2 w-full col-span-1"
        />
        <button
        type="submit"
        className="col-span-3 bg-blue-600 font-semibold py-2 rounded hover:bg-blue-700">
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
                    <input type="number" 
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateQuantity(item.id!, Number(e.target.value))
                      }
                      className="border rounded p-1 w-20"/>
                  </td>
                  <td className="py-2 text-center">{item.unit}</td>
                  <td className="py-2 text-right">
                  <button
                      onClick={() => handleDelete(item.id!)}
                      className="text-red-600 hover:underline"
                    > Delete </button>  
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

