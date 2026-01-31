'use client';
import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  subscribeToAuthChanges,
} from "./auth";

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return { user, loading };
}