"use client";

import { cn } from "@/lib/utils";
import { Calendar, List, LayoutGrid } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { addCalendarEntry, confirmMealAndConsume, subscribeToPantry, subscribeToRecipes, subscribeToCalendarDate, PantryItem, Recipe, CalendarEntry } from "@/lib/firestore";
import { format, startOfWeek, addDays } from "date-fns";

type MealType = "breakfast" | "lunch" | "dinner";

export default function MealPlannerPage() {
  // Desktop view mode toggle
  const [viewMode, setViewMode] = useState<"B" | "C">("B");
  
  return (
    <div className="p-4 max-w-6xl mx-auto">

      {/* ===== PAGE HEADER ===== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meal Planner</h1>

        {/* Only show toggle on DESKTOP */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setViewMode("B")}
            className={cn(
              "px-3 py-1 rounded border flex items-center gap-1",
              viewMode === "B" ? "bg-blue-600 text-white" : "bg-white"
            )}
          >
            <List size={18} />
            Day View
          </button>

          <button
            onClick={() => setViewMode("C")}
            className={cn(
              "px-3 py-1 rounded border flex items-center gap-1",
              viewMode === "C" ? "bg-blue-600 text-white" : "bg-white"
            )}
          >
            <LayoutGrid size={18} />
            Weekly View
          </button>
        </div>
      </div>

      {/* ===== MOBILE VIEW (Option A only) ===== */}
      <div className="md:hidden">
        <MobileCalendarPage />
      </div>

      {/* ===== DESKTOP VIEW (toggle B/C) ===== */}
      <div className="hidden md:block">
        {viewMode === "B" && <DesktopMealPlannerB />}
        {viewMode === "C" && <DesktopMealPlannerC />}
      </div>
    </div>
  );
}

//
// =======================
// MOBILE — OPTION A
// =======================
//

function MobileCalendarPage() {
  const [pantry, setPantry] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(isoToday());
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<{ meal: MealType; recipeId: string }>({ meal: "breakfast", recipeId: "" });
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const unsubPantry = subscribeToPantry((items) => setPantry(items));
    const unsubRecipes = subscribeToRecipes((rs) => setRecipes(rs));
    return () => {
      unsubPantry();
      unsubRecipes();
    };
  }, []);

  useEffect(() => {
    const unsub = subscribeToCalendarDate(selectedDate, (es) => setEntries(es));
    return () => unsub();
  }, [selectedDate]);

  const week = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(start, i);
      return { iso: format(d, "yyyy-MM-dd"), label: format(d, "EEE dd") };
    });
  }, []);

  async function handleAddToCalendar() {
    if (!form.recipeId) return alert("Select a recipe");
    setWorking(true);
    try {
      await addCalendarEntry({ date: selectedDate, meal: form.meal, recipeId: form.recipeId });
      setAdding(false);
    } catch (err) {
      console.error("Add calendar error", err);
      alert("Could not add calendar entry.");
    } finally {
      setWorking(false);
    }
  }

  async function handleConfirm(entryId: string) {
    setWorking(true);
    try {
      await confirmMealAndConsume(entryId);
      alert("Meal confirmed and pantry updated.");
    } catch (err) {
      console.error("Confirm error", err);
      alert("Could not confirm meal. See console.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Meal Planner — This Week</h1>

      <div className="space-y-2 mb-4">
        {week.map((w) => (
          <button
            key={w.iso}
            onClick={() => setSelectedDate(w.iso)}
            className={`w-full text-left p-3 rounded border ${selectedDate === w.iso ? "bg-blue-600 text-white" : "bg-white"}`}
          >
            <div className="flex justify-between">
              <div>{w.label}</div>
              <div className="text-sm text-gray-600">{entriesForDate(entries, w.iso).length} meals</div>
            </div>
          </button>
        ))}
      </div>

      <section className="bg-white p-3 rounded shadow">
        <h2 className="font-semibold mb-2">Meals on {selectedDate}</h2>

        {entries.length === 0 ? (
          <p className="text-gray-600 mb-2">No meals added</p>
        ) : (
          entries.map((e) => {
            const r = recipes.find((x) => x.id === e.recipeId);
            return (
              <div key={e.id} className="border p-2 rounded mb-2 flex justify-between items-center">
                <div>
                  <div className="font-medium">{capitalize(e.meal)}</div>
                  <div className="text-sm text-gray-600">{r ? r.title : "Recipe not found"}</div>
                  <div className="text-xs text-gray-500">{e.confirmed ? "Confirmed" : "Not confirmed"}</div>
                </div>
                <div className="flex flex-col gap-2">
                  {!e.confirmed && (
                    <button
                      onClick={() => handleConfirm(e.id)}
                      disabled={working}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}

        <div className="mt-3">
          <button onClick={() => { setAdding(true); setForm({ meal: "breakfast", recipeId: recipes[0]?.id ?? "" }); }} className="w-full py-2 bg-blue-600 text-white rounded">
            + Add Meal
          </button>
        </div>
      </section>

      {/* Add modal-ish area */}
      {adding && (
        <div className="fixed inset-0 flex items-end justify-center pointer-events-none">
          <div className="w-full max-w-md pointer-events-auto bg-white p-4 rounded-t-lg shadow-xl">
            <h3 className="font-semibold mb-2">Add meal — {selectedDate}</h3>
            <label className="block mb-2">
              Meal
              <select className="w-full border p-2 rounded mt-1" value={form.meal} onChange={(e) => setForm({ ...form, meal: e.target.value as MealType })}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </label>

            <label className="block mb-3">
              Recipe
              <select className="w-full border p-2 rounded mt-1" value={form.recipeId} onChange={(e) => setForm({ ...form, recipeId: e.target.value })}>
                <option value="">-- select recipe --</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              <button onClick={handleAddToCalendar} className="flex-1 bg-blue-600 text-white py-2 rounded" disabled={working || !form.recipeId}>
                Add
              </button>
              <button onClick={() => setAdding(false)} className="flex-1 border py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- small helpers ---------- */
function isoToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

function entriesForDate(entries: CalendarEntry[], iso: string) {
  return entries.filter((e) => e.date === iso);
}

//
// =======================
// DESKTOP — OPTION B
// (List View)
// =======================
//

function DesktopMealPlannerB() {
  return (
    <div className="bg-white shadow p-6 rounded">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <List />
        Today — List View
      </h2>

      <div className="space-y-3">
        {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => (
          <div key={meal} className="border p-4 rounded">
            <h3 className="font-bold">{meal}</h3>
            <p className="text-gray-500 text-sm">No items yet</p>
          </div>
        ))}
      </div>
    </div>
  );
}

//
// =======================
// DESKTOP — OPTION C
// (Grid / Calendar View)
// =======================
//

function DesktopMealPlannerC() {
  return (
    <div className="bg-white shadow p-6 rounded">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Calendar />
        This Week — Weekly Grid
      </h2>

      <div className="grid grid-cols-7 gap-2">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="border p-4 rounded h-32">
            <h3 className="font-bold">{day}</h3>
            <p className="text-gray-500 text-xs">Empty</p>
          </div>
        ))}
      </div>
    </div>
  );
}
