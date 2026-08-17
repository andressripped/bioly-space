// Fixed monthly price tiers for private/paid links. Each tier maps to its own
// Lemon Squeezy subscription variant (env var LEMONSQUEEZY_LINK_VARIANT_<price in cents>),
// so the checkout always shows a real fixed price — no editable "pay what you
// want" field the buyer could lower.
export const LINK_PRICE_TIERS = [4.95, 9.99, 14.99, 19.99, 24.99, 29.99] as const;

export type LinkPriceTier = (typeof LINK_PRICE_TIERS)[number];

export function isValidLinkPrice(price: number): price is LinkPriceTier {
  return (LINK_PRICE_TIERS as readonly number[]).some((tier) => Math.abs(tier - price) < 0.001);
}

export function linkVariantEnvVar(price: number): string {
  return `LEMONSQUEEZY_LINK_VARIANT_${Math.round(price * 100)}`;
}
