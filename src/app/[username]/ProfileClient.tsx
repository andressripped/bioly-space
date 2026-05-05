"use client";

import { InstagramIcon, TiktokIcon, SnapchatIcon, LinkMeIcon } from "@/components/icons";
import SocialCircle from "@/components/SocialCircle";
import BannerCard from "@/components/BannerCard";
import ImageCard from "@/components/ImageCard";
import { Link2 } from "lucide-react";

const platformIcons: Record<string, React.ReactNode> = {
  "Instagram": <InstagramIcon />,
  "Snapchat": <SnapchatIcon className="w-6 h-6 text-black" />,
  "TikTok": <TiktokIcon />,
  "LinkMe": <LinkMeIcon />,
  "Link": <Link2 className="w-5 h-5 text-gray-400" />
};

const platformBg: Record<string, string> = {
  "Instagram": "bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#C13584]",
  "Snapchat": "bg-[#FFFC00]",
  "TikTok": "bg-black border border-gray-800",
  "LinkMe": "bg-gradient-to-tr from-[#FF7A00] to-[#FF0069]",
  "Link": "bg-white"
};

export default function ProfileClient({ profile, socials, links }: { profile: any, socials: any[], links: any[] }) {
  if (!profile) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Profile not found</div>;
  }

  return (
    <main className="min-h-[100dvh] bg-black text-white relative font-sans selection:bg-white/30">
      {/* Background Image Header */}
      <div className="absolute top-0 w-full h-[55vh] z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black z-10" />
        <img 
          src={profile.cover_url} 
          alt="Cover" 
          className="w-full h-full object-cover object-top"
        />
      </div>

      {/* Main Content Container - Mobile First */}
      <div className="relative z-20 w-full max-w-[480px] mx-auto pt-[35vh] px-4 pb-24">
        
        {/* Profile Info */}
        <div className="text-center mb-6">
          <h1 className="text-[2.5rem] font-bold tracking-tight mb-1 drop-shadow-lg leading-none">
            {profile.display_name}
          </h1>
          <p className="text-white/70 text-lg font-medium drop-shadow-md">
            @{profile.username}
          </p>
        </div>

        {/* Social Circles */}
        <div className="flex justify-center items-center gap-3 mb-10 flex-wrap">
          {socials.map((social, i) => (
            <SocialCircle
              key={social.id}
              platform={social.platform}
              url={social.url}
              icon={platformIcons[social.platform] || platformIcons["Link"]}
              bgClass={platformBg[social.platform] || platformBg["Link"]}
              delay={0.1 + (i * 0.1)}
            />
          ))}
        </div>

        {/* Divider */}
        {links.length > 0 && (
          <div className="flex justify-center mb-8">
             <div className="text-center text-sm font-medium text-white/90">
                💖<br />
                más de mi ↓
             </div>
          </div>
        )}

        {/* Links Container */}
        <div className="flex flex-col gap-0">
          {links.map((link, index) => {
            if (link.type === "banner") {
              return (
                <BannerCard
                  key={link.id}
                  title={link.title}
                  url={link.url}
                  delay={0.5 + (index * 0.1)}
                />
              );
            }
            if (link.type === "image") {
              return (
                <ImageCard
                  key={link.id}
                  title={link.title}
                  url={link.url}
                  imageUrl={link.image_url || ""}
                  delay={0.5 + (index * 0.1)}
                />
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* Fixed Bottom Footer */}
      <div className="fixed bottom-0 w-full max-w-[480px] left-1/2 -translate-x-1/2 bg-white text-black p-3 rounded-t-3xl z-50 flex items-center justify-between px-5 font-semibold text-sm shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2">
           <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#FF7A00] to-[#FF0069] flex items-center justify-center text-white text-[10px]">me</div>
           <span>LinkMe</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
           JOIN FOR FREE ✕
        </div>
      </div>
    </main>
  );
}
