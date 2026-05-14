import { 
  SiInstagram, SiYoutube, SiTiktok, SiX, SiFacebook, 
  SiSpotify, SiTwitch, SiDiscord, SiWhatsapp, 
  SiTelegram, SiGithub, SiPinterest, SiSnapchat
} from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";
import { Link as LinkIcon } from "lucide-react";

export function getPlatformIcon(platformId: string) {
  switch (platformId) {
    case "instagram": return SiInstagram;
    case "youtube": return SiYoutube;
    case "tiktok": return SiTiktok;
    case "twitter": return SiX;
    case "facebook": return SiFacebook;
    case "linkedin": return FaLinkedin;
    case "spotify": return SiSpotify;
    case "twitch": return SiTwitch;
    case "discord": return SiDiscord;
    case "whatsapp": return SiWhatsapp;
    case "telegram": return SiTelegram;
    case "github": return SiGithub;
    case "pinterest": return SiPinterest;
    case "snapchat": return SiSnapchat;
    default: return LinkIcon;
  }
}

export function PlatformIcon({ id, className }: { id: string; className?: string }) {
  const Icon = getPlatformIcon(id);
  return <Icon className={className} />;
}
