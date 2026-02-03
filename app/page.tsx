// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "firebase/auth";
import { signInWithGooglePopup, subscribeToAuthChanges } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  

  useEffect(() => {
    const unsub = subscribeToAuthChanges((u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        router.replace("/calendar");
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogleSignIn() {
    try {
      setAuthLoading(true);
      await signInWithGooglePopup();
      // onAuthStateChanged listener will redirect
    } catch (err) {
      // keep generic error type here
      console.error("Sign-in failed:", err);
      alert("Sign-in failed. See console for details.");
      setAuthLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6">
        <h2 className="text-lg">Checking authentication…</h2>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome to Pantry Planner</h1>
      <p className="mb-4">Sign in to manage your pantry, recipes and meal calendar.</p>

      <button
        onClick={handleGoogleSignIn}
        disabled={authLoading}
        className="flex items-center gap-3 bg-white border rounded px-4 py-2 shadow hover:shadow-md"
      >
        <img src="/google-logo.png" alt="Google" style={{ width: 30, height: 30 }} />
        <span className="text-gray-700 hover:text-gray-900">{authLoading ? "Signing in…" : "Sign in with Google"}</span>
      </button>

      <p className="text-sm text-gray-500 mt-6">
        Note: We use Google Sign-In for authentication. If you prefer passkeys later, we can add that.
      </p>
    </main>
  );
}
