"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./use-redux";
import { setTheme, toggleTheme } from "@/store/slices/ui";

const STORAGE_KEY = "nestfind-theme";

export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as "light" | "dark" | null;
    if (stored) {
      dispatch(setTheme(stored));
    }
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return {
    theme,
    toggleTheme: () => dispatch(toggleTheme()),
    setTheme: (t: "light" | "dark") => dispatch(setTheme(t)),
  };
}
