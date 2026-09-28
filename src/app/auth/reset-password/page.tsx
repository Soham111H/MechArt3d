// src/app/auth/reset-password/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Box, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";

const resetSchema = z.object({
  password: z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "At least one uppercase letter")
    .regex(/[0-9]/, "At least one number"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: "Passwords do not match",
  path: ["confirm"],
});

type ResetInput = z.infer<typeof resetSchema>;

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get("token");
  const email  = params.get("email");

  const [showPw, setShowPw]       = useState(false);
  const [showCo, setShowCo]       = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone]           = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetInput>({
    resolver: zodResolver(resetSchema),
  });

  if (!token || !email) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-red-500" />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Invalid Link</h2>
        <p className="text-slate-500 text-sm mb-6">This reset link is invalid or missing parameters.</p>
        <Link href="/auth/forgot-password">
          <Button variant="primary" fullWidth>Request New Link</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: ResetInput) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, email, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to reset password.");
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return done ? (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle size={32} className="text-emerald-500" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Password Reset!</h2>
      <p className="text-slate-500 text-sm mb-4">Your password has been changed. Redirecting you to login…</p>
    </div>
  ) : (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-1">Create new password</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Must be at least 8 characters with one uppercase letter and one number.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="New Password"
          type={showPw ? "text" : "password"}
          id="reset-password"
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button type="button" onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          label="Confirm Password"
          type={showCo ? "text" : "password"}
          id="reset-confirm"
          placeholder="••••••••"
          leftIcon={<Lock size={16} />}
          rightIcon={
            <button type="button" onClick={() => setShowCo(!showCo)}>
              {showCo ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
          error={errors.confirm?.message}
          {...register("confirm")}
        />
        <Button type="submit" fullWidth size="lg" loading={isLoading}>
          Reset Password
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <Suspense fallback={<p className="text-center text-slate-500">Loading...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
