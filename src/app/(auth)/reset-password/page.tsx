"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      {success ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
            Password updated successfully. Redirecting to sign in...
          </div>
          <p className="text-center text-sm text-slate-500">
            <Link
              href="/login"
              className="font-semibold text-primary-600 hover:text-primary-500"
            >
              Back to Sign In
            </Link>
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-600">
                {error}
              </div>
            )}

            <Input
              id="reset-password"
              label="New Password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              id="reset-confirm-password"
              label="Confirm Password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              Reset Password
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link
              href="/login"
              className="font-semibold text-primary-600 hover:text-primary-500"
            >
              Back to Sign In
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-500/25">
            <BuildingOffice2Icon className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Set new password
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your new password below
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
              </div>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
