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
    title: string;
    ingredients: RecipeIngredient[];
    description: string;
}

const recipesCollection = (userId: string) => collection(db, `users/${userId}/recipes`);

export function subscribeToRecipes(userId: string, callback: (items: Recipe[]) => void) {
    const q = query(recipesCollection(userId), orderBy("title"));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Recipe),
        }));
        callback(items);
    });
}

export async function getRecipes(userId: string): Promise<Recipe[]> {
    const q = query(recipesCollection(userId), orderBy("title"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Recipe),
    }));
}

//adding recipe
export async function addRecipe(userId: string, recipe: Omit<Recipe, "id">) {
    return await addDoc(recipesCollection(userId), recipe);
}

//updating recipe
export async function updateRecipe(userId: string, id: string, updates: Partial<Recipe>) {
    const ref = doc(db, "users", userId, "recipes", id);
    return await updateDoc(ref, updates);
}

//deleting recipe
export async function deleteRecipe(userId: string, id: string) {
    const ref = doc(db, "users", userId, "recipes", id);
    return await deleteDoc(ref);
}