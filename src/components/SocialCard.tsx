"use client";

import BentoCard from "./BentoCard";
import React from "react";

interface SocialCardProps {
  platform: string;
  url: string;
  icon: React.ReactNode;
  delay?: number;
}

export default function SocialCard({ platform, url, icon, delay = 0.3 }: SocialCardProps) {
  return (
    <BentoCard href={url} delay={delay} className="group flex items-center justify-center p-0 aspect-[4/3] sm:aspect-auto sm:h-full">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="text-white/40 group-hover:text-white transition-colors duration-300 transform group-hover:scale-110">
          {icon}
        </div>
        <span className="text-[10px] sm:text-xs font-semibold text-white/40 group-hover:text-white/90 transition-colors uppercase tracking-[0.2em]">
          {platform}
        </span>
      </div>
    </BentoCard>
  );
}
