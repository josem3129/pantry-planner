// src/lib/auth.ts
"use client";
import { auth } from "./firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Unsubscribe,
} from "firebase/auth";

const provider = new GoogleAuthProvider();

export async function signInWithGooglePopup(): Promise<User> {
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOut(): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Subscribe to auth changes.
 * @param callback receives firebase.User | null
 * @returns Unsubscribe function
 */
export function subscribeToAuthChanges(
  callback: (user: User | null) => void
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
