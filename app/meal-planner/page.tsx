"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar, List, LayoutGrid } from "lucide-react";

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
        <MobileMealPlanner />
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

function MobileMealPlanner() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-2">This Week</h2>

      <div className="space-y-3">
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
          (day) => (
            <div key={day} className="border p-4 rounded bg-white shadow-sm">
              <h3 className="font-bold">{day}</h3>
              <p className="text-gray-500 text-sm">No meals added</p>
            </div>
          )
        )}
      </div>
    </div>
  );
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
