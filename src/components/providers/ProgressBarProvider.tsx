"use client";
// src/components/providers/ProgressBarProvider.tsx
// Shows a blue progress bar at the top of the screen on every page navigation
// This gives instant visual feedback and eliminates perceived "lag"

import { AppProgressBar as ProgressBar } from "next-nprogress-bar";

export default function ProgressBarProvider() {
  return (
    <ProgressBar
      height="3px"
      color="#1D4ED8"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
