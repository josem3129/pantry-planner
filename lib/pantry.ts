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
export async function findPantryItemByBarcode(userId: string, barcode: string) : Promise<PantryItem | null> {
  const q = query(pantryCollection(userId), where("barcode", "==", barcode));
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
const pantryCollection = (userId: string) => collection(db, `users/${userId}/pantry`);

// one-time fetch 
export async function getPantryItems(userId: string): Promise<PantryItem[]> {
  const q = query(pantryCollection(userId), orderBy("name"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as PantryItem),
  }));
}
//fetch pantry item by id
export async function getPantryItemById(userId: string, id: string): Promise<PantryItem | null> {
    const ref = query(pantryCollection(userId), where("id", "==", id));
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
export function subscribeToPantry(userId: string, callback: (items: PantryItem[]) => void) {
    const q = query(pantryCollection(userId), orderBy("name"));
    return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as PantryItem),
        }));
        callback(items);
        });
}

//add pantry item
export async function addPantryItem(userId: string, item: Omit<PantryItem, "id">) {
    return await addDoc(pantryCollection(userId), item);
}

//update pantry item
export async function updatePantryItem(userId: string, id: string, updates: Partial<PantryItem>) {
    const ref = doc(db, "users", userId, "pantry", id);
    return await updateDoc(ref, updates);
}

//delete pantry item
export async function deletePantryItem(userId: string, id: string) {
    const ref = doc(db, "users", userId, "pantry", id);
    return await deleteDoc(ref);
}