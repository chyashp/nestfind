"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "owner">("buyer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-accent-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-500/25">
            <BuildingOffice2Icon className="h-6 w-6 text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Join NestFind and start exploring properties
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="rounded-xl bg-error-50 px-4 py-3 text-sm text-error-600">
                {error}
              </div>
            )}

            <Input
              id="signup-name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              id="signup-email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="signup-password"
              label="Password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-900">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("buyer")}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    role === "buyer"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold">Find a Property</p>
                  <p className="mt-0.5 text-xs opacity-70">
                    Browse & enquire
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    role === "owner"
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold">List Properties</p>
                  <p className="mt-0.5 text-xs opacity-70">
                    Sell or rent
                  </p>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
