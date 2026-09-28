"use client";

import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

interface IntlPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const IntlPhoneInput = forwardRef<HTMLInputElement, IntlPhoneInputProps>(
  ({ value, onChange, onBlur, label, error, disabled }, ref) => {
    
    // Add custom styles to the third-party container
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className={cn(
          "relative flex items-center transition-all duration-200 rounded-xl border-2 bg-white dark:bg-[#0a0f1e]",
          disabled && "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-900",
          error 
            ? "border-red-500 focus-within:ring-4 focus-within:ring-red-500/20" 
            : "border-slate-200 dark:border-slate-700 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/20"
        )}>
          <div className="w-full px-3 py-1 [&>.PhoneInputInput]:border-none [&>.PhoneInputInput]:bg-transparent [&>.PhoneInputInput]:focus:outline-none [&>.PhoneInputInput]:focus:ring-0 [&>.PhoneInputInput]:text-slate-900 dark:[&>.PhoneInputInput]:text-white [&>.PhoneInputInput]:placeholder-slate-400 [&>.PhoneInputCountry]:mr-3">
            <PhoneInput
              defaultCountry="IN"
              value={value}
              onChange={(val) => onChange(val || "")}
              onBlur={onBlur}
              disabled={disabled}
              placeholder="Enter phone number"
              numberInputProps={{ ref }}
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1.5 animate-in slide-in-from-top-1">
            <AlertCircle size={14} /> {error}
          </p>
        )}
      </div>
    );
  }
);

IntlPhoneInput.displayName = "IntlPhoneInput";
export default IntlPhoneInput;
