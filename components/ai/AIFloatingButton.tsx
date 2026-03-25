"use client";
import Link from "next/link";
import { Brain } from "lucide-react";
import { motion } from "framer-motion";

export function AIFloatingButton() {
  return (
    <Link href="/ai" className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-30">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-12 h-12 rounded-2xl bg-[#7c6aff] flex items-center justify-center shadow-lg shadow-[#7c6aff]/30">
        <Brain size={20} className="text-white" />
      </motion.div>
    </Link>
  );
}
