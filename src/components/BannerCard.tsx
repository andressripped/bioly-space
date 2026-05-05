"use client";

import { motion } from "framer-motion";
import React from "react";
import { Link2 } from "lucide-react";

interface BannerCardProps {
  title: string;
  url: string;
  icon?: React.ReactNode;
  bgClass?: string;
  delay?: number;
}

export default function BannerCard({ title, url, icon, bgClass = "bg-[#a3a3a3]", delay = 0.2 }: BannerCardProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 100 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full rounded-2xl flex items-center p-2 mb-4 overflow-hidden h-[72px] ${bgClass}`}
    >
      <div className="w-[56px] h-[56px] rounded-xl flex items-center justify-center shrink-0 shadow-md mr-4" style={{ background: "linear-gradient(135deg, #FF7A00, #FF0069)" }}>
        {icon || <div className="text-white font-bold text-xl">me</div>}
      </div>
      <div className="flex-1 text-center pr-14">
        <span className="font-semibold text-emerald-400 text-lg tracking-wide shadow-black drop-shadow-md">{title}</span>
      </div>
    </motion.a>
  );
}
