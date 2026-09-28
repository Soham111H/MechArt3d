// src/app/loading.tsx
// This file shows instantly while any page is loading — replaces the "white flash" delay
export default function RootLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#0a0f1e] z-50">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="w-12 h-12 bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl flex items-center justify-center shadow-glow animate-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 3L21 8V16L12 21L3 16V8L12 3Z" fill="white" fillOpacity="0.9" />
          </svg>
        </div>
        {/* Smooth progress bar */}
        <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full animate-loading-bar" />
        </div>
      </div>
    </div>
  );
}