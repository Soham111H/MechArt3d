// src/components/ui/Button.tsx
"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size    = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary-700 hover:bg-primary-800 text-white shadow-sm hover:shadow-glow " +
    "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  secondary:
    "border-2 border-primary-700 text-primary-700 dark:text-primary-400 " +
    "dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 " +
    "focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  ghost:
    "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 " +
    "focus:ring-2 focus:ring-slate-300",
  danger:
    "bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
  outline:
    "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 " +
    "hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-2 focus:ring-slate-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
  xl: "px-8 py-4 text-lg rounded-2xl gap-2.5",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        disabled={disabled || loading}
        suppressHydrationWarning
        className={cn(
          "inline-flex items-center justify-center font-semibold",
          "transition-all duration-200",
          "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Loading…</span>
          </>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
export default Button;
