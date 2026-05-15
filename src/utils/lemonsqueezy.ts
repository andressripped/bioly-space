import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function setupLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    console.warn("Falta LEMONSQUEEZY_API_KEY en las variables de entorno.");
  }
  
  lemonSqueezySetup({
    apiKey: apiKey || "",
    onError: (error) => console.error("Error en Lemon Squeezy:", error),
  });
}
