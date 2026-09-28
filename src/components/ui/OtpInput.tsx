"use client";

import { useRef, KeyboardEvent, ClipboardEvent } from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

export default function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  hasError = false,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = value.split("");
      if (newValue[index]) {
        // If current box has value, delete it
        newValue[index] = "";
      } else if (index > 0) {
        // If empty, delete previous and move back
        newValue[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }
      onChange(newValue.join(""));
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!/^[0-9]*$/.test(val)) return;

    // Grab only the last char if they type multiple
    const digit = val.slice(-1);
    const newValue = value.split("").slice(0, length);
    newValue[index] = digit;
    
    // Pad array with spaces if needed to join properly
    for (let i = 0; i < length; i++) {
      if (!newValue[i]) newValue[i] = " ";
    }
    
    const finalStr = newValue.join("").replace(/ /g, "");
    onChange(finalStr);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (finalStr.length === length && onComplete) {
      onComplete(finalStr);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;

    onChange(pastedData);
    if (pastedData.length === length && onComplete) {
      onComplete(pastedData);
    }
    
    // Focus last filled input
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center sm:justify-between w-full">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2} // Allow 2 so we can grab the newest typed char
          value={value[i] || ""}
          onChange={(e) => handleInput(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          disabled={disabled}
          autoComplete="one-time-code"
          className={cn(
            "w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border-2 transition-all",
            "focus:outline-none focus:ring-4 focus:ring-primary-500/20",
            disabled ? "opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800" : "bg-white dark:bg-[#0a0f1e]",
            hasError
              ? "border-red-500 text-red-600 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500",
            value[i] && !hasError && "border-primary-500"
          )}
        />
      ))}
    </div>
  );
}
