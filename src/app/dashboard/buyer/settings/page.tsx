"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import { api } from "@/lib/api";
import { useAppDispatch } from "@/hooks/use-redux";
import { updateName, updateAvatar } from "@/store/slices/auth";

interface ProfileData {
  full_name: string;
  phone: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string;
}

export default function BuyerSettingsPage() {
  const dispatch = useAppDispatch();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    bio: "",
    avatar_url: null,
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get<{ data: ProfileData }>("/api/users/me");
        setProfile(res.data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/users/me", {
        full_name: profile.full_name,
        phone: profile.phone || "",
        bio: profile.bio || "",
      });
      dispatch(updateName(profile.full_name));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.upload<{ data: { avatar_url: string } }>(
        "/api/users/me/avatar",
        formData
      );
      setProfile({ ...profile, avatar_url: res.data.avatar_url });
      dispatch(updateAvatar(res.data.avatar_url));
    } catch {
      alert("Failed to upload avatar");
    }
  };

  if (loading) {
    return (
      <>
        <DashboardHeader title="Settings" />
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader title="Settings" subtitle="Manage your profile" />
      <div className="mx-auto max-w-2xl p-6 lg:p-8">
        <div className="mb-8 flex items-center gap-4">
          <Avatar src={profile.avatar_url} name={profile.full_name || "User"} size="lg" />
          <label className="cursor-pointer rounded-xl border border-[var(--card-border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-slate-50 transition-colors">
            Change Photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </label>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Input
            id="settings-name"
            label="Full Name"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            required
          />
          <Input
            id="settings-email"
            label="Email"
            value={profile.email}
            disabled
            hint="Email cannot be changed"
          />
          <Input
            id="settings-phone"
            label="Phone"
            value={profile.phone ?? ""}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={saving}>
              Save Changes
            </Button>
            {saved && (
              <span className="text-sm text-success-600 font-medium">Saved!</span>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
