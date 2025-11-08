// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGooglePopup, subscribeToAuthChanges } from "../lib/auth";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authloading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Subscribe to authentication state changes
    const unsub = subscribeToAuthChanges((u) => {
      setUser(u);
      setLoading(false);
      if (u) {
        //if user signed in, go to calendar
        router.push("/calendar");
      }
    });
    return () => unsub();
    //eslink-disbale-next-line react/executive-deps
}, []);

async function handleGoogleSignIn() {
  try {
    setAuthLoading(true);
    await signInWithGooglePopup();
    //listiner will handle redirect
  } catch (err: any) {
    console.error("Error during sign-in:", err.message);
    setAuthLoading(false);
  }
}
  if (loading) {
    return (
      <main className="p-6">  
      <h2 className="text-lg">Checking Authentication...</h2>
      </main>
    );
}
// If not loading and no user, show sign-in button
  return (
    <main className="p-6 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome to Pantry Planner</h1>
      <p className="mb-4">Sign in to mange your pantry, recipes and meals calendar</p>
      <button
      onClick={handleGoogleSignIn}
      disabled={authloading}
      className="flex item-center gap-3 bg-white border rounded px-4 py-2 shadow hover:shadow-md">
        <img src="../app/web_light_rd_ctn@1x.png" alt="Google" style={{width:20,height:20}} />
        <span>{authloading ? "signing in.." : "sign in with Google"}</span>
      </button>
    </main>
  );
}