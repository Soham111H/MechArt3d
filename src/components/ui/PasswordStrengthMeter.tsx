"use client";

import zxcvbn from "zxcvbn";
import { Check, X } from "lucide-react";

interface PasswordStrengthMeterProps {
  password?: string;
}

export default function PasswordStrengthMeter({ password = "" }: PasswordStrengthMeterProps) {
  const result = zxcvbn(password);
  // Score is 0-4
  const score = password ? result.score : 0;
  
  const getStrengthLabel = () => {
    if (!password) return "";
    switch (score) {
      case 0:
      case 1: return "Too Weak";
      case 2: return "Weak";
      case 3: return "Medium";
      case 4: return "Strong";
      default: return "";
    }
  };

  const getStrengthColor = () => {
    if (!password) return "bg-slate-200 dark:bg-slate-700";
    switch (score) {
      case 0:
      case 1: return "bg-red-500";
      case 2: return "bg-orange-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-emerald-500";
      default: return "bg-slate-200 dark:bg-slate-700";
    }
  };

  const rules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="w-full space-y-2 mt-2">
      {/* Progress Bars */}
      <div className="flex gap-1 h-1.5 w-full">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`flex-1 rounded-full transition-all duration-300 ${
              password && score >= index ? getStrengthColor() : "bg-slate-200 dark:bg-slate-700"
            }`}
          />
        ))}
      </div>
      
      {/* Label */}
      <div className="flex justify-end h-4">
        <span className={`text-xs font-medium transition-colors ${
          score <= 1 ? "text-red-500" :
          score === 2 ? "text-orange-500" :
          score === 3 ? "text-yellow-500" :
          "text-emerald-500"
        }`}>
          {getStrengthLabel()}
        </span>
      </div>

      {/* Rules Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 mt-2">
        {rules.map((rule) => (
          <div key={rule.label} className="flex items-center gap-1.5 text-xs">
            {rule.met ? (
              <Check size={14} className="text-emerald-500" />
            ) : (
              <X size={14} className="text-slate-300 dark:text-slate-600" />
            )}
            <span className={rule.met ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-500"}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
