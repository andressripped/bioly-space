export type TemplateTier = "free" | "pro" | "business";

export interface TemplateConfig {
  id: string;
  name: string;
  tier: TemplateTier;
  theme_color: string;
  button_style: "rounded" | "pill" | "square" | "outline";
  font_family: string;
  background_type: "solid" | "gradient" | "image" | "animated";
  background_value: string;
  background_blur: number;
}

export const BIOLY_TEMPLATES: TemplateConfig[] = [
  // FREE TEMPLATES
  {
    id: "default",
    name: "Minimalista",
    tier: "free",
    theme_color: "#111111",
    button_style: "rounded",
    font_family: "inter",
    background_type: "solid",
    background_value: "#fcfcfc",
    background_blur: 0,
  },
  {
    id: "midnight",
    name: "Midnight",
    tier: "free",
    theme_color: "#0ea5e9", // cyan accent
    button_style: "pill",
    font_family: "inter",
    background_type: "solid",
    background_value: "#050505",
    background_blur: 0,
  },
  {
    id: "sunset",
    name: "Sunset",
    tier: "free",
    theme_color: "#111111",
    button_style: "rounded",
    font_family: "inter",
    background_type: "gradient",
    background_value: "linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)",
    background_blur: 0,
  },
  {
    id: "arctic",
    name: "Arctic",
    tier: "free",
    theme_color: "#0ea5e9",
    button_style: "square",
    font_family: "inter",
    background_type: "gradient",
    background_value: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
    background_blur: 0,
  },
  {
    id: "forest",
    name: "Forest",
    tier: "free",
    theme_color: "#ffffff",
    button_style: "outline",
    font_family: "serif",
    background_type: "solid",
    background_value: "#064e3b",
    background_blur: 0,
  },
  
  // PRO TEMPLATES
  {
    id: "neon-tokyo",
    name: "Neon Tokyo",
    tier: "pro",
    theme_color: "#ec4899",
    button_style: "outline",
    font_family: "mono",
    background_type: "solid",
    background_value: "#000000",
    background_blur: 0,
  },
  {
    id: "glassmorphism",
    name: "Glass",
    tier: "pro",
    theme_color: "#ffffff",
    button_style: "rounded",
    font_family: "outfit",
    background_type: "gradient",
    background_value: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    background_blur: 0, // In CSS we will apply backdrop-blur to cards
  },
  {
    id: "brutalist",
    name: "Brutalist",
    tier: "pro",
    theme_color: "#ef4444",
    button_style: "square",
    font_family: "space-grotesk",
    background_type: "solid",
    background_value: "#fbbf24",
    background_blur: 0,
  },
  {
    id: "aesthetic",
    name: "Aesthetic",
    tier: "pro",
    theme_color: "#111111",
    button_style: "pill",
    font_family: "playfair",
    background_type: "solid",
    background_value: "#fdf4ff",
    background_blur: 0,
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    tier: "pro",
    theme_color: "#fde047",
    button_style: "square",
    font_family: "mono",
    background_type: "gradient",
    background_value: "linear-gradient(135deg, #4c1d95 0%, #06b6d4 100%)",
    background_blur: 0,
  },

  // BUSINESS TEMPLATES
  {
    id: "portfolio",
    name: "Portfolio",
    tier: "business",
    theme_color: "#111111",
    button_style: "rounded",
    font_family: "cabinet",
    background_type: "solid",
    background_value: "#fafafa",
    background_blur: 0,
  },
  {
    id: "creator",
    name: "Creator",
    tier: "business",
    theme_color: "#6366f1",
    button_style: "pill",
    font_family: "clash",
    background_type: "solid",
    background_value: "#1e1b4b",
    background_blur: 0,
  }
];
