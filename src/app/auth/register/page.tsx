"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Box, Mail, Lock, User, Calendar, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import PasswordStrengthMeter from "@/components/ui/PasswordStrengthMeter";
import IntlPhoneInput from "@/components/ui/IntlPhoneInput";
import toast from "react-hot-toast";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function RegisterPage() {
  const router = useRouter();
  const { settings } = useSettingsStore();
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  
  // States for live check
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [phoneStatus, setPhoneStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [shake, setShake] = useState(false);

  // Auto-load state from sessionStorage
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    register, handleSubmit, watch, setValue, formState: { errors, isValid },
  } = useForm<RegisterInput>({ 
    resolver: zodResolver(registerSchema),
    mode: "onBlur"
  });

  const password = watch("password");
  const confirmPassword = watch("confirmPassword");
  const emailVal = watch("email");
  const phoneVal = watch("phone");

  // Save to session storage
  useEffect(() => {
    if (!isClient) return;
    const subscription = watch((value) => {
      sessionStorage.setItem("registerFormState", JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [watch, isClient]);

  // Load from session storage
  useEffect(() => {
    if (!isClient) return;
    const saved = sessionStorage.getItem("registerFormState");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach((key) => {
          setValue(key as keyof RegisterInput, parsed[key]);
        });
      } catch {
        // ignore
      }
    }
  }, [setValue, isClient]);

  const checkEmail = async () => {
    if (!emailVal || errors.email) return;
    setEmailStatus("checking");
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        body: JSON.stringify({ email: emailVal })
      });
      const data = await res.json();
      setEmailStatus(data.available ? "available" : "taken");
    } catch {
      setEmailStatus("idle");
    }
  };

  const checkPhone = async () => {
    if (!phoneVal || errors.phone) return;
    setPhoneStatus("checking");
    try {
      const res = await fetch("/api/auth/check-phone", {
        method: "POST",
        body: JSON.stringify({ phone: phoneVal })
      });
      const data = await res.json();
      setPhoneStatus(data.available ? "available" : "taken");
    } catch {
      setPhoneStatus("idle");
    }
  };

  const onSubmit = async (data: RegisterInput) => {
    if (emailStatus === "taken" || phoneStatus === "taken") {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Registration failed");

      sessionStorage.removeItem("registerFormState");
      toast.success("Account created! Verify your email.");
      // In a real flow, redirect to /auth/verify-email step
      router.push("/auth/login");
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const onError = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/" });

  if (!isClient) return null; // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e] flex items-center justify-center px-4 py-16">
      <div className={`w-full max-w-lg ${shake ? "animate-shake" : ""}`}>

        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-2 mb-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-700 to-primary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Box size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {settings.storeName.split(' ')[0]} <span className="text-primary-700 dark:text-primary-400">{settings.storeName.split(' ').slice(1).join(' ')}</span>
            </span>
          </Link>
          <h1 className="mt-6 text-3xl font-black text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            Join 10,000+ creators worldwide
          </p>
        </div>

        <div className="card p-8 relative overflow-hidden">
          
          {/* Progress Bar (Step 1) */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-primary-500 w-1/2 transition-all duration-500" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 mb-6 disabled:opacity-50 mt-4"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-[#0a0f1e] px-3 text-slate-400">or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">
            <Input
              label="Full name"
              placeholder="Akhil Sharma"
              autoFocus
              autoComplete="name"
              leftIcon={<User size={16} />}
              error={errors.name?.message}
              {...register("name")}
              rightIcon={!errors.name && watch("name")?.length >= 3 ? <CheckCircle2 size={16} className="text-emerald-500" /> : undefined}
            />

            <div className="space-y-1.5">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                leftIcon={<Mail size={16} />}
                error={errors.email?.message}
                {...register("email")}
                onBlur={checkEmail}
                rightIcon={emailStatus === "available" ? <CheckCircle2 size={16} className="text-emerald-500" /> : undefined}
              />
              {emailStatus === "taken" && (
                <p className="text-sm text-red-500 animate-in slide-in-from-top-1">
                  Email already registered. <Link href="/auth/login" className="underline font-semibold">Login instead?</Link>
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <IntlPhoneInput
                label="Phone number"
                value={watch("phone") || ""}
                onChange={(v) => setValue("phone", v, { shouldValidate: true })}
                onBlur={checkPhone}
                error={errors.phone?.message}
              />
              {phoneStatus === "taken" && (
                <p className="text-sm text-red-500 animate-in slide-in-from-top-1">
                  Phone already linked to an account.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date of Birth"
                type="date"
                leftIcon={<Calendar size={16} />}
                error={errors.dob?.message}
                {...register("dob")}
              />
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Gender</label>
                <div className="relative flex items-center h-[52px] px-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-[#0a0f1e] focus-within:border-primary-500">
                  <select 
                    {...register("gender")}
                    className="w-full bg-transparent focus:outline-none text-sm text-slate-900 dark:text-white"
                  >
                    <option value="" disabled className="dark:bg-slate-900">Select</option>
                    <option value="MALE" className="dark:bg-slate-900">Male</option>
                    <option value="FEMALE" className="dark:bg-slate-900">Female</option>
                    <option value="NON_BINARY" className="dark:bg-slate-900">Non-binary</option>
                    <option value="PREFER_NOT_TO_SAY" className="dark:bg-slate-900">Prefer not to say</option>
                  </select>
                </div>
                {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
              </div>
            </div>

            <div>
              <Input
                label="Password"
                type={showPw ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPw(!showPw)} aria-label="Toggle">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={errors.password?.message}
                {...register("password")}
              />
              <PasswordStrengthMeter password={password} />
            </div>

            <Input
              label="Confirm password"
              type={showCPw ? "text" : "password"}
              placeholder="Repeat your password"
              autoComplete="new-password"
              leftIcon={<Lock size={16} />}
              rightIcon={
                confirmPassword && confirmPassword === password ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <button type="button" onClick={() => setShowCPw(!showCPw)} aria-label="Toggle">
                    {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )
              }
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <label className="flex items-start gap-3 mt-4 group cursor-pointer">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  {...register("acceptTerms")}
                  className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded-md checked:bg-primary-500 checked:border-primary-500 transition-colors focus:outline-none focus:ring-4 focus:ring-primary-500/20"
                />
                <CheckCircle2 size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400 leading-tight">
                I agree to the{" "}
                <Link href="/terms" className="text-primary-700 dark:text-primary-400 font-semibold hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-primary-700 dark:text-primary-400 font-semibold hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.acceptTerms && <p className="text-sm text-red-500 mt-1">{errors.acceptTerms.message}</p>}

            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              loading={isLoading}
              disabled={!isValid || emailStatus === "taken" || phoneStatus === "taken"}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary-700 dark:text-primary-400 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
