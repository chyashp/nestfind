"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import PropertyGrid from "@/components/property/PropertyGrid";
import { api } from "@/lib/api";
import type { Property, SavedProperty } from "@/types/database";

export default function BuyerSavedPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSaved() {
      try {
        const res = await api.get<{ data: SavedProperty[] }>("/api/saved");
        const props = res.data
          .map((s) => s.property)
          .filter((p): p is Property => !!p);
        setProperties(props);
        setSavedIds(props.map((p) => p.id));
      } catch {
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSaved();
  }, []);

  const handleToggleSave = async (propertyId: string) => {
    try {
      await api.delete(`/api/saved/${propertyId}`);
      setProperties(properties.filter((p) => p.id !== propertyId));
      setSavedIds(savedIds.filter((id) => id !== propertyId));
    } catch {
      // ignore
    }
  };

  return (
    <>
      <DashboardHeader
        title="Saved Properties"
        subtitle={`${properties.length} saved`}
      />
      <div className="p-6 lg:p-8">
        <PropertyGrid
          properties={properties}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
          isLoading={loading}
          emptyMessage="No saved properties yet. Browse and save properties you like!"
        />
      </div>
    </>
  );
}
