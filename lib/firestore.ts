// src/lib/firestore.ts
"use client";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  DocumentData,
  QuerySnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteDoc } from "firebase/firestore";
/* ------------------------
   Types
   ------------------------ */
export interface PantryItem {
  id: string;
  name: string;
  unit?: string;
  quantity: number; // size of one container
  count: number; // number of containers
  low_threshold?: number;
  category?: string;
}

export interface RecipeIngredient {
  pantryItemId?: string; // optional if you don't have linked item
  name: string;
  quantity: number;
  unit?: string;
}

export interface Recipe {
  id: string;
  title: string;
  servings?: number;
  ingredients: RecipeIngredient[];
  instructions?: string;
  tags?: string[];
}

export type MealType = "breakfast" | "lunch" | "dinner";

export interface CalendarEntry {
  id: string;
  date: string; // YYYY-MM-DD
  meal: MealType;
  recipeId: string;
  confirmed?: boolean;
  createdAt?: string | number | boolean | null | undefined;
}

/* ------------------------
   Collections helpers
   ------------------------ */

const pantryCol = collection(db, "pantry");
const recipesCol = collection(db, "recipes");
const calendarCol = collection(db, "calendar");
const shoppingCol = collection(db, "shoppingList");

/* PANTRY */

export async function getPantryItemsOnce(): Promise<PantryItem[]> {
  const snap = await getDocs(query(pantryCol, orderBy("name")));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  })) as PantryItem[];
}

export function subscribeToPantry(
  callback: (items: PantryItem[]) => void
): Unsubscribe {
  return onSnapshot(
    query(pantryCol, orderBy("name")),
    (snap: QuerySnapshot) => {
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as DocumentData),
        })) as PantryItem[]
      );
    }
  );
}

/* RECIPES */

export async function getRecipesOnce(): Promise<Recipe[]> {
  const snap = await getDocs(query(recipesCol, orderBy("title")));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  })) as Recipe[];
}

export function subscribeToRecipes(
  callback: (recipes: Recipe[]) => void
): Unsubscribe {
  return onSnapshot(query(recipesCol, orderBy("title")), (snap) => {
    callback(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as DocumentData),
      })) as Recipe[]
    );
  });
}

/* CALENDAR */

export async function addCalendarEntry(
  entry: Omit<CalendarEntry, "id" | "createdAt">
) {
  return await addDoc(calendarCol, {
    ...entry,
    confirmed: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToCalendarDate(
  date: string,
  callback: (entries: CalendarEntry[]) => void
): Unsubscribe {
  const q = query(calendarCol, where("date", "==", date), orderBy("meal"));
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as DocumentData),
      })) as CalendarEntry[]
    );
  });
}

export async function deleteCalendarEntry(id: string) {
  await deleteDoc(doc(db, "calendar", id));
}

/* SHOPPING LIST helpers (derived) */
export async function addOrMarkShoppingItem(
  itemName: string,
  unit?: string,
  qty = 1
) {
  // Create a simple shopping item with itemName as doc ID (slug) to avoid duplicates
  const id = itemName.toLowerCase().replace(/\s+/g, "_");
  const ref = doc(db, "shopping_list", id);
  await setDoc(
    ref,
    {
      item_name: itemName,
      unit: unit || "",
      quantity: qty,
      needed: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
// Confirm meal and consume pantry items transactionally
export async function confirmMealAndConsume(entryId: string) {
  const entryRef = doc(db, "calendar", entryId);
  const UNIT_CONVERSIONS: Record<string, number> = {
    // Volume (base: milliliter)
    mL: 1,
    L: 1000,
    tsp: 4.92892,
    tbsp: 14.7868,
    "fl oz": 29.5735,
    c: 240,
    pt: 473.176,
    qt: 946.353,
    gal: 3785.41,

    // Weight (base: gram)
    g: 1,
    kg: 1000,
    oz: 28.3495,
    lb: 453.592,
    ea: 1,
  };
  return runTransaction(db, async (tx) => {
    function convertToBase(quantity: number, unit: string): number {
      const factor = UNIT_CONVERSIONS[unit];
      if (!factor) throw new Error(`Unknown unit: ${unit}`);
      return quantity * factor;
    }
    // 1. ------ READ ENTRY ------
    const entrySnap = await tx.get(entryRef);
    if (!entrySnap.exists()) throw new Error("Calendar entry not found");
    const entry = entrySnap.data() as CalendarEntry;

    // 2. ------ READ RECIPE ------
    const recipeRef = doc(db, "recipes", entry.recipeId);
    const recipeSnap = await tx.get(recipeRef);
    if (!recipeSnap.exists()) throw new Error("Recipe not found");
    const recipe = recipeSnap.data() as Recipe;

    // 3. ------ PRE-READ ALL PANTRY DOCS (IF itemId exists) ------
    const pantryReadMap: Record<string, PantryItem | null> = {};

    for (const ing of recipe.ingredients) {
      if (ing.pantryItemId) {
        const pRef = doc(db, "pantry", ing.pantryItemId);
        const pSnap = await tx.get(pRef);

        pantryReadMap[ing.pantryItemId] = pSnap.exists()
          ? { id: pSnap.id, ...(pSnap.data() as Omit<PantryItem, "id">) }
          : null;
      }
    }

    // 🚫 NO WRITES HAVE HAPPENED YET — THIS IS REQUIRED

    // 4. ------ NOW WE PERFORM WRITES ------
    for (const ing of recipe.ingredients) {
      let pantryDocRef: ReturnType<typeof doc> | null = null;
      let pantryData: PantryItem | null = null;

      if (ing.pantryItemId && pantryReadMap[ing.pantryItemId]) {
        pantryDocRef = doc(db, "pantry", ing.pantryItemId);
        pantryData = pantryReadMap[ing.pantryItemId]!;
      }
      if (pantryDocRef && pantryData) {
        console.log(
          "pantry ingredient:",
          pantryDocRef,
          "Pantry data:",
          pantryData,
          "Id:",
          ing.pantryItemId
        );
        // Convert pantry quantity to base unit
        if (!ing.unit) throw new Error("Ingredient unit missing");
        if (!pantryData.unit) throw new Error("Pantry unit missing");

        const pantryQtyBase = convertToBase(
          pantryData.quantity,
          pantryData.unit
        );

        // Convert recipe ingredient quantity to base unit
        const recipeBase = convertToBase(ing.quantity, ing.unit);

        // Convert total pantry amount to base unit
        const totalBase = convertToBase(
          pantryData.quantity * pantryData.count,
          pantryData.unit
        );

        // Subtract
        const newTotalBase = totalBase - recipeBase;

        // Convert back to pantry unit
        const newTotal = newTotalBase / UNIT_CONVERSIONS[pantryData.unit];

        // Now compute new container count and quantity
        let newCount = Math.floor(newTotal / pantryData.quantity);
        let newQuantity = newTotal % pantryData.quantity;

        console.log(
          "New total base",
          newTotalBase,
          "New total:",
          newTotal,
          "New count:",
          newCount,"New quantity:",
          newQuantity
        );
        // If total is less than one container
        if (newTotal < pantryData.quantity) {
          newCount = 0;
          newQuantity = newTotal; // whatever is left
        }

        tx.update(pantryDocRef, {
          count: newTotal,
          lastUpdated: serverTimestamp(),
        });

        // If empty or negative → shopping list
        if (newTotalBase <= 0) {
          const itemName = pantryData.name ?? ing.name;
          const id = itemName.toLowerCase().replace(/\s+/g, "_");
          const shopRef = doc(db, "shoppingList", id);

          tx.set(
            shopRef,
            {
              item_name: itemName,
              unit: pantryData.unit ?? ing.unit ?? "",
              quantity: 1,
              needed: true,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );
        }
      }
    }

    // 5. ------ MARK CALENDAR ENTRY CONFIRMED ------
    tx.update(entryRef, {
      confirmed: true,
      confirmedAt: serverTimestamp(),
    });

    return true;
  });
}
