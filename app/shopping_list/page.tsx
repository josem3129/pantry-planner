"use client";

import { useEffect, useState } from "react";
import { subscribeToPantry, PantryItem } from "@/lib/firestore";
import { useAuth } from "@/lib/useAuth";

export default function ShoppingListPage() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const { user } = useAuth(); 
  const userId = user?.uid || "";

  useEffect(() => {
     if (!userId) return;
    return subscribeToPantry(userId, (pantry) => {
      const needsRestock = pantry.filter(
        (item) => item.quantity <= (item.low_threshold ?? 0)
      );
      setItems(needsRestock);
    });
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Shopping List</h1>

      {items.length === 0 ? (
        <p className="text-gray-600">Nothing to buy 🎉</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-500">
                  Current: {item.quantity} {item.unit ?? ""}
                </div>
              </div>

              <span className="text-red-600 text-sm font-medium">
                Low
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
