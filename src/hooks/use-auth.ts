"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppDispatch, useAppSelector } from "./use-redux";
import { setUser, clearUser, setLoading } from "@/store/slices/auth";
import type { UserRole } from "@/types/database";

export function useAuth() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        dispatch(clearUser());
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        dispatch(
          setUser({
            userId: user.id,
            role: profile.role as UserRole,
            fullName: profile.full_name,
            avatarUrl: profile.avatar_url,
            email: user.email || "",
          })
        );
      } else {
        dispatch(clearUser());
      }
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        dispatch(clearUser());
      } else {
        dispatch(setLoading(true));
        getUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return auth;
}
