// src/store/ui.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  // Dark mode
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;

  // Mobile menu
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
  toggleMobileMenu: () => void;

  // Cart drawer
  isCartOpen: boolean;
  setCartOpen: (val: boolean) => void;
  toggleCart: () => void;
}

export const useUIStore = create<UIState>()(
  persist<UIState>(
    (set) => ({
      isDarkMode: false,
      toggleDarkMode: () =>
        set((s) => {
          const next = !s.isDarkMode;
          if (typeof document !== "undefined") {
            if (next) document.documentElement.classList.add("dark");
            else document.documentElement.classList.remove("dark");
          }
          return { isDarkMode: next };
        }),
      setDarkMode: (val: boolean) => {
        if (typeof document !== "undefined") {
          if (val) document.documentElement.classList.add("dark");
          else document.documentElement.classList.remove("dark");
        }
        set({ isDarkMode: val });
      },

      isMobileMenuOpen: false,
      setMobileMenuOpen: (val: boolean) => set({ isMobileMenuOpen: val }),
      toggleMobileMenu: () =>
        set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),

      isCartOpen: false,
      setCartOpen: (val: boolean) => set({ isCartOpen: val }),
      toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
    }),
    {
      name: "mechart-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isDarkMode: state.isDarkMode } as UIState),
    }
  )
);
