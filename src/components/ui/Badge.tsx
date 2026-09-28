// src/components/ui/Badge.tsx
import { cn } from "@/lib/utils";

type BadgeVariant = "blue" | "green" | "red" | "yellow" | "gray" | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  blue:   "bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300",
  green:  "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400",
  red:    "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400",
  yellow: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400",
  gray:   "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
  purple: "bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400",
};

export default function Badge({ variant = "blue", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
