"use client";

import BentoCard from "./BentoCard";
import { ArrowUpRight } from "lucide-react";
import React from "react";

interface LinkCardProps {
  title: string;
  description?: string;
  url: string;
  icon?: React.ReactNode;
  thumbnailUrl?: string;
  delay?: number;
  className?: string;
}

export default function LinkCard({ title, description, url, icon, thumbnailUrl, delay = 0.2, className }: LinkCardProps) {
  return (
    <BentoCard href={url} delay={delay} className={`group justify-between h-full min-h-[160px] ${className || ""}`}>
      {/* If there's a thumbnail, use it as a background with an overlay */}
      {thumbnailUrl && (
        <>
          <div className="absolute inset-0 z-0">
            <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        </>
      )}

      <div className="relative z-10 flex items-start justify-between w-full mb-4">
        {icon && (
          <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white/90 group-hover:text-white group-hover:bg-white/20 transition-colors shadow-lg">
            {icon}
          </div>
        )}
        {!icon && <div></div>}
        <div className="p-2 rounded-full text-white/50 group-hover:text-white group-hover:bg-white/10 transition-all backdrop-blur-md">
          <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
      
      <div className="relative z-10 mt-auto pt-4">
        <h3 className="text-xl font-medium text-white mb-1.5 tracking-tight drop-shadow-md">{title}</h3>
        {description && <p className="text-sm text-white/70 line-clamp-2 drop-shadow-sm">{description}</p>}
      </div>
    </BentoCard>
  );
}
