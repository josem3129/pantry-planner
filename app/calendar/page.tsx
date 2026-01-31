"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { List, LayoutGrid } from "lucide-react";
import {
  addCalendarEntry,
  confirmMealAndConsume,
  subscribeToCalendarDate,
  subscribeToRecipes,
  CalendarEntry,
  Recipe,
  deleteCalendarEntry,
} from "@/lib/firestore";
import { format, startOfWeek, addDays } from "date-fns";
import { useAuth } from "@/lib/useAuth";

/* ---------------- Types ---------------- */
type MealType = "breakfast" | "lunch" | "dinner";

/* ---------------- Page ---------------- */
export default function MealPlannerPage() {
  const [viewMode, setViewMode] = useState<"B" | "C">("B");
  const { user, loading } = useAuth();
  const userId = user?.uid || "";

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const today = isoToday();
  /* --- Week helper --- */
  const week = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 });

    return Array.from({ length: 14 }).map((_, i) => {
      const d = addDays(start, i);
      return {
        iso: format(d, "yyyy-MM-dd"),
        label: format(d, "EEE dd"),
      };
    });
  }, []);

  /* --- Recipes --- */
  useEffect(() => {
     if (!userId) return;
    return subscribeToRecipes(userId, setRecipes);
  }, []);

  /* --- Calendar entries (WHOLE WEEK) --- */
  useEffect(() => {
     if (!userId) return;
    const unsubs = week.map((d) =>
      subscribeToCalendarDate(userId, d.iso, (dayEntries: CalendarEntry[]) => {
        setEntries((prev) => [
          ...prev.filter((e) => e.date !== d.iso),
          ...dayEntries,
        ]);
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [week]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meal Planner</h1>
          <AddMealPanel
            recipes={recipes}
            onAdd={(data) => addCalendarEntry(userId, data)}
          />

        <div className="hidden md:flex md:flex-col-reverse gap-2 items-end">
          <button
            onClick={() => setViewMode("B")}
            className={cn(
              "px-3 py-1 rounded border flex gap-1 items-center",
              viewMode === "B" ? "bg-blue-600 text-white" : "bg-white"
            )}
          >
            <List size={18} />
            Day View
          </button>

          <button
            onClick={() => setViewMode("C")}
            className={cn(
              "px-3 py-1 rounded border flex gap-1 items-center",
              viewMode === "C" ? "bg-blue-600 text-white" : "bg-white"
            )}
          >
            <LayoutGrid size={18} />
            Weekly View
          </button>
        </div>
      </div>

      {/* Mobile (A) */}
      <div className="md:hidden">
        <MobileView recipes={recipes} entries={entries} week={week} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        {viewMode === "B" && (
          <DesktopDayView userId={userId} date={today} recipes={recipes} entries={entries} />
        )}
        {viewMode === "C" && (
          <DesktopWeekView userId={userId} recipes={recipes} entries={entries} week={week} />
        )}
      </div>
    </div>
  );
}

/* ---------------- MOBILE (A) ---------------- */
function MobileView({
  recipes,
  entries,
  week,
}: {
  recipes: Recipe[];
  entries: CalendarEntry[];
  week: { iso: string; label: string }[];
}) {
  return (
    (
      <div className="space-y-3">
        {week.map((d) => (
          <div key={d.iso} className="bg-white p-3 rounded shadow">
            <h3 className="font-bold">{d.label}</h3>
            {entriesForDate(entries, d.iso).map((e) => {
              const r = recipes.find((x) => x.id === e.recipeId);
              return (
                <div key={e.id} className="text-sm text-gray-600">
                  {capitalize(e.meal)} — {r?.title}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    )
  );
}

/* ---------------- DESKTOP B (TODAY) ---------------- */
function DesktopDayView({
  date,
  recipes,
  entries,
  userId,
}: {
  date: string;
  recipes: Recipe[];
  entries: CalendarEntry[];
  userId: string;
}) {
  const todaysMeals = entriesForDate(entries, date);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Today</h2>

      {(["breakfast", "lunch", "dinner"] as MealType[]).map((meal) => {
        const entry = todaysMeals.find((e) => e.meal === meal);
        const recipe = recipes.find((r) => r.id === entry?.recipeId);
        return (
          <div key={meal} className="border p-3 rounded mb-3">
            <div className="font-bold capitalize">{meal}</div>

            {entry ? (
              <>
                <div className="text-gray-600">{recipe?.title}</div>
                {!entry.confirmed && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => confirmMealAndConsume(userId, entry.id)}
                      className="px-4 py-1.5 text-xs font-medium bg-green-600 text-white 
                              rounded-full shadow-sm hover:bg-green-700 hover:shadow transition-all"
                    >
                      Confirm
                    </button>

                    <button
                      onClick={() => deleteCalendarEntry(userId, entry.id)}
                      className="px-4 py-1.5 text-xs font-medium rounded-full 
                              border border-red-300 text-red-600 
                              hover:bg-red-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-gray-400 mt-2 italic">
                No meal added
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- DESKTOP C (WEEK) ---------------- */
function DesktopWeekView({
  recipes,
  entries,
  week,
  userId,
}: {
  recipes: Recipe[];
  entries: CalendarEntry[];
  week: { iso: string; label: string }[];
  userId: string;
}) {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">This Week</h2>

      <div className="grid grid-cols-7 gap-3">
        {week.map((d) => (
          <div
            key={d.iso}
            className="bg-gray-50 border rounded-lg min-h-[220px] flex flex-col items-center justify-between text-center overflow-auto"
          >
            <h3 className="font-bold mb-2">{d.label}</h3>

            {(["breakfast", "lunch", "dinner"] as MealType[]).map((meal) => {
              const mealEntry = entriesForDate(entries, d.iso).find(
                (e) => e.meal === meal
              );
              const recipe = recipes.find((r) => r.id === mealEntry?.recipeId);

              return (
                <div
                  key={meal}
                  className="p-2 w-full flex flex-col items-center text-center shadow-sm"
                >
                  <div className="font-semibold text-l uppercase tracking-wide text-gray-800">
                    {meal}
                  </div>

                  {mealEntry ? (
                    <>
                      <div className="text-gray-500">{recipe?.title}</div>
                      {!mealEntry.confirmed && (
                        <div className="flex flex-col gap-2 mt-2 w-full">
                          <button
                            onClick={() => confirmMealAndConsume(userId, mealEntry.id)}
                            className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded-full hover:bg-green-700"
                          >
                            Confirm
                          </button>

                          <button
                            onClick={() => deleteCalendarEntry(userId, mealEntry.id)}
                            className="flex-1 px-2 py-1 text-xs border border-red-300 text-red-600 rounded-full hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-gray-400 mt-2 italic">
                      No meal added
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Add Meal ---------------- */
function AddMealPanel({
  recipes,
  onAdd,
}: {
  recipes: Recipe[];
  onAdd: (data: { date: string; meal: MealType; recipeId: string }) => void;
}) {
  const [date, setDate] = useState(isoToday());
  const [meal, setMeal] = useState<MealType>("breakfast");
  const [recipeId, setRecipeId] = useState("");

  return (
    <div className="p-4 border rounded-lg bg-white shadow mb-6">
      <h3 className="font-bold mb-2">Add Meal</h3>

      <div className="grid grid-cols-3 gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-1 rounded"
        />

        <select
          value={meal}
          onChange={(e) => setMeal(e.target.value as MealType)}
          className="border p-1 rounded"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>

        <select
          value={recipeId}
          onChange={(e) => setRecipeId(e.target.value)}
          className="border p-1 rounded"
        >
          <option value="">Select Recipe</option>
          {recipes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </div>

      <button
        disabled={!recipeId}
        onClick={() => onAdd({ date, meal, recipeId })}
        className="mt-3 px-4 py-1 bg-blue-600 text-white rounded-full disabled:opacity-50"
      >
        + Add Meal
      </button>
    </div>
  );
}

/* ---------------- Helpers ---------------- */
function isoToday() {
  const d = new Date();
  return d.toLocaleDateString("en-CA"); // gives YYYY-MM-DD in local time
}

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

function entriesForDate(entries: CalendarEntry[], iso: string) {
  return entries.filter((e) => e.date === iso);
}
