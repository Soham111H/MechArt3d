"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Box, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useSettingsStore } from "@/store/useSettingsStore";

function LinkAccountForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const token   = params.get("token")  ?? "";
  const email   = params.get("email")  ?? "";
  const { settings } = useSettingsStore();

  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");
  const [done, setDone]           = useState(false);

  // Guard: if no token/email in URL
  if (!token || !email) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Invalid Link</h2>
        <p className="text-slate-500 text-sm mb-6">This session is invalid or has expired.</p>
        <Link href="/auth/login" className="btn-primary">Back to Login</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError("Please enter your password."); return; }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/link-google", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password, token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      // Linking succeeded — now sign in with credentials to create JWT session
      setDone(true);
      toast.success("Google linked! Signing you in…");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/account");
        router.refresh();
      } else {
        // Fallback: redirect to login
        router.push("/auth/login?linked=true");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {done ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-sm">Signing you in…</p>
        </div>
      ) : (
        <>
          {/* Google Badge */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-6">
            <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Link your Google account</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{email}</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            We found an existing {settings.storeName} account with this email. Enter your <strong>current password</strong> to link Google Sign-In to your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Email
              </label>
              <div className="input-base bg-slate-50 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed select-none">
                {email}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Current Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  className="input-base pl-11 pr-12"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-200 dark:border-red-800/50">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Linking…
                </span>
              ) : (
                "Confirm & Link Google Account"
              )}
            </button>
          </form>

          <div className="mt-5 text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline block">
              Forgot your password?
            </Link>
            <Link href="/auth/login" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors block">
              Cancel — back to login
            </Link>
          </div>
        </>
      )}
    </>
  );
}

export default function LinkAccountPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-500 rounded-xl flex items-center justify-center shadow-glow">
              <Box size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              Mech<span className="text-primary-700 dark:text-primary-400">Art</span> 3D
            </span>
          </Link>
          <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
            Connect your accounts
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            One last step to link Google to your account
          </p>
        </div>

        <div className="card p-8">
          <Suspense fallback={<div className="text-center py-8 text-slate-500">Loading…</div>}>
            <LinkAccountForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
