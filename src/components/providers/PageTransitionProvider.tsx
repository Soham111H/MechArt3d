"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
