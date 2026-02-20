"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MagnifyingGlassIcon, MapPinIcon } from "@heroicons/react/24/outline";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface Suggestion {
  id: string;
  place_name: string;
  text: string;
  context?: { id: string; text: string }[];
}

interface Props {
  variant?: "dark" | "light";
  placeholder?: string;
  className?: string;
}

export default function LocationSearchBar({
  variant = "dark",
  placeholder = "Search by city, address, or neighborhood...",
  className = "",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text.trim() || !MAPBOX_TOKEN) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(text)}.json?access_token=${MAPBOX_TOKEN}&types=place,neighborhood,address,locality&country=us&limit=5`
      );
      const data = await res.json();
      setSuggestions(data.features || []);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value), 300);
  };

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.place_name);
    setIsOpen(false);
    setSuggestions([]);

    // Extract city from the suggestion context or text
    const cityContext = suggestion.context?.find((c) => c.id.startsWith("place"));
    const city = cityContext?.text || suggestion.text;

    router.push(`/search?query=${encodeURIComponent(city)}`);
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/search?query=${encodeURIComponent(query.trim())}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelect(suggestions[activeIndex]);
        } else {
          handleSubmit();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isDark = variant === "dark";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-3">
        <div
          className={`flex flex-1 items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-lg transition-colors ${
            isDark
              ? "border-white/10 bg-white/5 backdrop-blur-sm shadow-black/20 focus-within:border-primary-500/40"
              : "border-slate-200 bg-white shadow-primary-500/5 focus-within:border-primary-400"
          }`}
        >
          <MagnifyingGlassIcon
            className={`h-5 w-5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className={`flex-1 bg-transparent text-base focus:outline-none ${
              isDark
                ? "text-white placeholder:text-slate-500"
                : "text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
        <button
          onClick={handleSubmit}
          className="flex h-[52px] shrink-0 items-center rounded-2xl bg-primary-600 px-8 text-base font-semibold text-white shadow-lg shadow-primary-500/25 hover:bg-primary-500 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          className={`absolute left-0 right-16 top-full z-50 mt-2 overflow-hidden rounded-xl border shadow-2xl ${
            isDark
              ? "border-white/10 bg-slate-900 shadow-black/40"
              : "border-slate-200 bg-white shadow-slate-200/50"
          }`}
        >
          {suggestions.map((suggestion, index) => {
            const parts = suggestion.place_name.split(", ");
            const primary = parts[0];
            const secondary = parts.slice(1).join(", ");

            return (
              <button
                key={suggestion.id}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  index === activeIndex
                    ? isDark
                      ? "bg-primary-500/10"
                      : "bg-primary-50"
                    : isDark
                      ? "hover:bg-white/5"
                      : "hover:bg-slate-50"
                }`}
              >
                <MapPinIcon
                  className={`h-4 w-4 shrink-0 ${
                    index === activeIndex
                      ? "text-primary-400"
                      : isDark
                        ? "text-slate-600"
                        : "text-slate-400"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      isDark ? "text-slate-200" : "text-slate-900"
                    }`}
                  >
                    {primary}
                  </p>
                  {secondary && (
                    <p
                      className={`truncate text-xs ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {secondary}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
