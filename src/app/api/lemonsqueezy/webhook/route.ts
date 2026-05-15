import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("X-Signature") as string;
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

  // Verificar firma de Lemon Squeezy
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(body).digest("hex"), "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const payload = JSON.parse(body);
  const eventName = payload.meta.event_name;
  const customData = payload.meta.custom_data;

  if (eventName === "order_created" || eventName === "subscription_created") {
    const userId = customData.user_id;
    const tier = customData.tier;

    if (userId && tier) {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          plan: tier,
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error actualizando perfil vía Webhook LS:", error);
        return new Response("Database Error", { status: 500 });
      }
    }
  }

  return new Response("OK", { status: 200 });
}
