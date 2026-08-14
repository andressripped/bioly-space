import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-signature") || "";
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

    console.log("🔔 Webhook de Lemon Squeezy recibido");

    // 1. Verificar firma
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from(hmac.update(body).digest("hex"), "utf8");
    const signatureBuffer = Buffer.from(signature, "utf8");

    if (
      signatureBuffer.length !== digest.length ||
      !crypto.timingSafeEqual(signatureBuffer, digest)
    ) {
      console.error("❌ Firma de webhook inválida");
      return new Response("Invalid signature", { status: 400 });
    }

    const payload = JSON.parse(body);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data;

    console.log(`📥 Evento: ${eventName}`, { customData });

    // 2. Procesar evento de compra/suscripción
    if (eventName === "order_created" || eventName === "subscription_created" || eventName === "subscription_payment_success") {
      const userId = customData?.user_id;
      const tier = customData?.tier;

      if (!userId || !tier) {
        console.error("⚠️ Webhook sin datos de usuario o tier:", customData);
        return new Response("Missing custom data", { status: 200 }); // Respondemos 200 para que LS no reintente
      }

      console.log(`🚀 Activando plan ${tier} para usuario ${userId}`);

      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { data, error } = await supabaseAdmin
        .from("profiles")
        .update({
          plan: tier,
          subscription_expires_at: expiresAt.toISOString(),
        })
        .eq("id", userId)
        .select();

      if (error) {
        console.error("❌ Error de Supabase al actualizar perfil:", error);
        return new Response("Database Error", { status: 500 });
      }

      console.log("✅ Perfil actualizado exitosamente:", data);
    }

    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("💥 Error crítico en Webhook:", error.message);
    return new Response("Internal Error", { status: 500 });
  }
}
