
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CRMLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/6ixtem/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed.");
      }

      router.replace("/6ixtem/admin/leads");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-white p-8 shadow-2xl"
      >
        <h1 className="text-2xl font-bold text-slate-900">
          6ixtem CRM
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Administrator sign in
        </p>

        <label className="mt-8 block text-sm font-medium text-slate-700">
          Email
        </label>

        <input
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
        />

        <label className="mt-5 block text-sm font-medium text-slate-700">
          Password
        </label>

        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-lg border px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
        />

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}

        <button
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-slate-900 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
