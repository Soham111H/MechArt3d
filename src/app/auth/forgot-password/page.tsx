// src/app/auth/forgot-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Box, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const defaultEmail = searchParams.get("email") || "";

  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: defaultEmail,
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setEmail(data.email);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: data.email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setSent(true);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-500 rounded-xl flex items-center justify-center shadow-glow">
              <Box size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              Mech<span className="text-primary-700 dark:text-primary-400">Art</span> 3D
            </span>
          </Link>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-5 ring-4 ring-emerald-100 dark:ring-emerald-900/20">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Check your inbox</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm leading-relaxed">
                If an account exists for <strong className="text-slate-700 dark:text-slate-300">{email}</strong>, we&apos;ve sent a password reset link.
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-6">
                The link expires in <strong>15 minutes</strong>. Check your spam folder if you don&apos;t see it.
              </p>
              <Link href="/auth/login">
                <Button variant="primary" fullWidth>Back to Login</Button>
              </Link>
              <button
                onClick={() => { setSent(false); }}
                className="mt-3 text-sm text-slate-500 hover:text-primary-600 transition-colors"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Forgot your password?</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No worries — enter your email and we&apos;ll send you a reset link valid for 15 minutes.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  id="forgot-email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  leftIcon={<Mail size={16} />}
                  error={errors.email?.message}
                  {...register("email")}
                />
                <Button type="submit" fullWidth size="lg" loading={isLoading}>
                  Send Reset Link
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex items-center justify-center">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
