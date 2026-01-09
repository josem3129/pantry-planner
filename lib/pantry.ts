"use client";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

//initialize pantry collection reference
export interface PantryItem {
  count: string | number | readonly string[] | undefined;
  id?: string;
  name: string;
  quantity: number;
  unit: string;
}

//collection reference
const pantryCollection = collection(db, "pantry");

// one-time fetch 
export async function getPantryItems(): Promise<PantryItem[]> {
  const q = query(pantryCollection, orderBy("name"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as PantryItem),
  }));
}

//real-time subscription
export function subscribeToPantry(callback: (items: PantryItem[]) => void) {
    const q = query(pantryCollection, orderBy("name"));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as PantryItem),
        }));
        callback(items);
        });
}

//add pantry item
export async function addPantryItem(item: Omit<PantryItem, "id">) {
    return await addDoc(pantryCollection, item);
}

//update pantry item
export async function updatePantryItem(id: string, updates: Partial<PantryItem>) {
    const ref = doc(db, "pantry", id);
    return await updateDoc(ref, updates);
}

//delete pantry item
export async function deletePantryItem(id: string) {
    const ref = doc(db, "pantry", id);
    return await deleteDoc(ref);
}