"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  fullWidth?: boolean;
  className?: string;
  duration?: number;
}

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  fullWidth = false,
  className = "",
  duration = 0.5,
}: FadeInProps) {
  const directions = {
    up: { y: 30, x: 0 },
    down: { y: -30, x: 0 },
    left: { y: 0, x: 30 },
    right: { y: 0, x: -30 },
    none: { y: 0, x: 0 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
      }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98], // Custom easeOutCubic
      }}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}
