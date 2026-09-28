// src/components/ui/Skeleton.tsx
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg",
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      <Skeleton className="w-full h-56 rounded-b-none rounded-t-2xl" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function OrderListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-5 flex gap-4">
          <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-24 rounded-xl self-center" />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
