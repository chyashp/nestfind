"use client";

import { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAppSelector, useAppDispatch } from "@/hooks/use-redux";
import { setSidebarOpen } from "@/store/slices/ui";
import Sidebar from "./Sidebar";

export default function MobileSidebar() {
  const open = useAppSelector((s) => s.ui.sidebarOpen);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => dispatch(setSidebarOpen(false))}
          className="absolute right-2 top-3 z-50 rounded-lg p-1 text-white/60 hover:text-white"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
        <Sidebar />
      </div>
    </>
  );
}
