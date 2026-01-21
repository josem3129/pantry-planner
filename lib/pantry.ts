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
  where
} from "firebase/firestore";
//initialize pantry collection reference
export interface PantryItem {
  count: number
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  barcode?: string;
}
//find pantry item by barcode
export async function findPantryItemByBarcode(barcode: string) : Promise<PantryItem | null> {
  const q = query(pantryCollection, where("barcode", "==", barcode));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...(doc.data() as PantryItem),
  };
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
//fetch pantry item by id
export async function getPantryItemById(id: string): Promise<PantryItem | null> {
    const ref = query(pantryCollection, where("id", "==", id));
    const snap = await getDocs(ref);
    if (snap.empty) {
        return null;
    }
    return {
        id: snap.docs[0].id,
        ...(snap.docs[0].data() as PantryItem),
    };
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