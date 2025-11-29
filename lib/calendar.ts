import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";    

export interface calendarEntry {
    id?: string;
    date: string;
    meal: "breakfast" | "lunch" | "dinner";
    recipeId: string;
    confirmed: boolean;
}

const calendarRef = collection(db, "calendar");

export function subscribeToCalendar(cd: (items: calendar[]) => void){
    return onSnapshot(calendarRef, (snapshot) => {
        const data = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as calendarEntry[];
        cd(data);
    });
}

export async function addCalendarEntry(entry: calendarEntry){
    return await addDoc(calendarRef, entry);
}

export async function deleteCalendarEntry(id: string){
    return await deleteDoc(doc(calendarRef, id));
}

export async function updateCalendarEntry(id: string, updates: Partial<calendarEntry>){
    return await updateDoc(doc(calendarRef, id), updates);
}