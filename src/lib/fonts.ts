import { 
  Inter, 
  Lora, 
  JetBrains_Mono, 
  Outfit, 
  Playfair_Display, 
  Space_Grotesk, 
  DM_Sans, 
  Syne,
  Chivo, 
  Plus_Jakarta_Sans
} from "next/font/google";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const serif = Lora({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], display: "swap" });
const syne = Syne({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });
const clash = Chivo({ subsets: ["latin"], weight: ["400", "700", "900"], display: "swap" }); 
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], display: "swap" });

export const FONT_CLASSES: Record<string, string> = {
  inter: inter.className,
  serif: serif.className,
  mono: mono.className,
  outfit: outfit.className,
  playfair: playfair.className,
  "space-grotesk": spaceGrotesk.className,
  "dm-sans": dmSans.className,
  syne: syne.className,
  clash: clash.className, 
  cabinet: jakarta.className, 
};

export const FONT_OPTIONS = [
  { id: "inter", label: "Inter", tier: "free" },
  { id: "serif", label: "Serif", tier: "free" },
  { id: "mono", label: "Mono", tier: "free" },
  { id: "outfit", label: "Outfit", tier: "pro" },
  { id: "playfair", label: "Playfair", tier: "pro" },
  { id: "space-grotesk", label: "Space", tier: "pro" },
  { id: "dm-sans", label: "DM Sans", tier: "pro" },
  { id: "syne", label: "Syne", tier: "pro" },
  { id: "clash", label: "Clash", tier: "business" },
  { id: "cabinet", label: "Cabinet", tier: "business" },
];
