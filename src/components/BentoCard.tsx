"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  href?: string;
}

export default function BentoCard({ children, className, delay = 0, href }: BentoCardProps) {
  const CardContent = (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 90,
        damping: 15,
      }}
      whileHover={
        href
          ? {
              y: -4,
              scale: 1.01,
              transition: { type: "spring", stiffness: 300, damping: 20 },
            }
          : undefined
      }
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[2rem]",
        "bg-white/[0.03] backdrop-blur-xl",
        "border border-white/5",
        href && "cursor-pointer hover:bg-white/[0.06] hover:border-white/20 transition-colors duration-500",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      <div className="relative z-10 h-full w-full p-6 sm:p-8 flex flex-col">
        {children}
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block outline-none h-full">
        {CardContent}
      </a>
    );
  }

  return CardContent;
}
