"use client";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

export interface RecipeIngredient {
    pantryItemId: string
    quantity: number
}

export interface Recipe {
    id?: string;
    name: string;
    ingredients: RecipeIngredient[];
    description: string;
}

const recipesCollection = collection(db, "recipes");

export function subscribeToRecipes(callback: (items: Recipe[]) => void) {
    const q = query(recipesCollection, orderBy("name"));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Recipe),
        }));
        callback(items);
    });
}

export async function getRecipes(): Promise<Recipe[]> {
    const q = query(recipesCollection, orderBy("name"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Recipe),
    }));
}

//adding recipe
export async function addRecipe(recipe: Omit<Recipe, "id">) {
    return await addDoc(recipesCollection, recipe);
}

//updating recipe
export async function updateRecipe(id: string, updates: Partial<Recipe>) {
    const ref = doc(db, "recipes", id);
    return await updateDoc(ref, updates);
}

//deleting recipe
export async function deleteRecipe(id: string) {
    const ref = doc(db, "recipes", id);
    return await deleteDoc(ref);
}