"use client";

import { motion } from "framer-motion";
import { Link2 } from "lucide-react";
import React from "react";

interface SocialCircleProps {
  platform: string;
  url: string;
  icon: React.ReactNode;
  bgClass?: string;
  delay?: number;
}

export default function SocialCircle({ platform, url, icon, bgClass = "bg-white", delay = 0.3 }: SocialCircleProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        type: "spring",
        stiffness: 100,
        damping: 10,
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={`w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg ${bgClass}`}
    >
      <div className="text-white mix-blend-difference w-6 h-6 flex items-center justify-center">
         {icon}
      </div>
    </motion.a>
  );
}
