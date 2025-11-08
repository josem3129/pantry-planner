// src/lib/auth.ts
"use client";
import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

const provider = new GoogleAuthProvider();

export async function signInWithGooglePopup() {
  // Will throw on failure — caller should catch
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
