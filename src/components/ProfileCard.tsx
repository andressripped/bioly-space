"use client";

import BentoCard from "./BentoCard";
import { MapPin, Mail, Sparkles, CheckCircle2 } from "lucide-react";

interface ProfileCardProps {
  displayName: string;
  bio: string;
  role: string;
  avatarUrl: string;
  location?: string;
  email?: string;
  isVerified?: boolean;
}

export default function ProfileCard({ displayName, bio, role, avatarUrl, location, email, isVerified }: ProfileCardProps) {
  return (
    <BentoCard className="md:col-span-2 md:row-span-2 flex flex-col justify-end group min-h-[360px]" delay={0.1}>
      <div className="flex-1 flex items-start justify-between mb-8">
        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/20 relative bg-white/5 shadow-2xl">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/10" />
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-white/10 text-xs font-semibold text-white/90 backdrop-blur-md shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
          New Vlog Out Now
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          {displayName}
          {isVerified && <CheckCircle2 className="w-6 h-6 text-blue-400" />}
          {!isVerified && <Sparkles className="w-5 h-5 text-pink-400/80" />}
        </h1>
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300 font-medium text-lg sm:text-xl mb-4">
          {role}
        </p>
        <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md mb-8">
          {bio}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
          {location && (
            <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
              <MapPin className="w-4 h-4 text-white/40" />
              <span>{location}</span>
            </div>
          )}
          {email && (
            <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/5 hover:bg-white/[0.08] hover:text-white transition-colors cursor-pointer backdrop-blur-sm">
              <Mail className="w-4 h-4 text-white/40" />
              <span>{email}</span>
            </div>
          )}
        </div>
      </div>
    </BentoCard>
  );
}
