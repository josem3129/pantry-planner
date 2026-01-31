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

export interface CalendarEntry {
    id?: string;
    date: string;
    meal: "breakfast" | "lunch" | "dinner";
    recipeId: string;
    confirmed: boolean;
}

const calendarRef = (userId: string) => collection(db, `users/${userId}/calendar`);

export function subscribeToCalendar(userId: string, cd: (items: CalendarEntry[]) => void){
    return onSnapshot(calendarRef(userId), (snapshot) => {
        const data = snapshot.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        })) as CalendarEntry[];
        cd(data);
    });
}

export async function addCalendarEntry(userId: string, entry: CalendarEntry){
    return await addDoc(calendarRef(userId), entry);
}

export async function deleteCalendarEntry(userId: string, id: string){
    return await deleteDoc(doc(calendarRef(userId), id));
}

export async function updateCalendarEntry(userId: string, id: string, updates: Partial<CalendarEntry>){
    return await updateDoc(doc(calendarRef(userId), id), updates);
}