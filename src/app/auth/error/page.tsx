"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AlertCircle, Box, ArrowLeft } from "lucide-react";

const errorMessages: Record<string, string> = {
  Configuration:    "There is a problem with the server configuration. Please contact support.",
  AccessDenied:     "You do not have permission to sign in.",
  Verification:     "The verification link may have expired or already been used.",
  OAuthCallback:    "There was a problem during Google sign-in. Please try again.",
  OAuthSignin:      "Google sign-in could not be started. Check that your credentials are correct.",
  OAuthCreateAccount: "Could not create an account using your Google profile.",
  Signin:           "Try signing in with a different account.",
  Default:          "An unexpected error occurred. Please try again.",
};

function ErrorContent() {
  const params = useSearchParams();
  const error  = params.get("error") ?? "Default";
  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">

        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-500 rounded-xl flex items-center justify-center shadow-glow">
            <Box size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            Mech<span className="text-primary-700 dark:text-primary-400">Art</span> 3D
          </span>
        </Link>

        <div className="card p-8 md:p-10">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Sign-in Error
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg inline-block">
            {error}
          </p>
          <p className="text-slate-600 dark:text-slate-400 mt-4 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex flex-col gap-3">
            <Link href="/auth/login" className="btn-primary w-full">
              Try Again
            </Link>
            <Link href="/" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <ArrowLeft size={16} /> Back to Homepage
            </Link>
          </div>
        </div>

        {/* Debug info for dev */}
        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 text-xs text-slate-400">
            Dev tip: Check your <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">.env.local</code> for correct <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">AUTH_SECRET</code> and provider keys.
          </p>
        )}
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex items-center justify-center">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
