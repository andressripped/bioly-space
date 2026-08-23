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

    // 2a. Suscripción mensual a un link privado
    const LINK_SUBSCRIPTION_EVENTS = [
      "order_created", // fired for the subscription's first invoice, before subscription_created
      "subscription_created",
      "subscription_updated",
      "subscription_payment_success",
      "subscription_cancelled",
      "subscription_expired",
      "subscription_payment_failed",
    ];
    if (LINK_SUBSCRIPTION_EVENTS.includes(eventName) && customData?.type === "link_subscription") {
      const linkId = customData?.link_id;
      const email = customData?.email;
      const telegramUsername = customData?.telegram_username || null;

      if (!linkId || !email) {
        console.error("⚠️ Webhook de link_subscription sin link_id o email:", customData);
        return new Response("Missing custom data", { status: 200 });
      }

      const attrs = payload.data?.attributes || {};
      const lsStatus = attrs.status as string | undefined; // active | on_trial | past_due | cancelled | unpaid | expired | paused
      const periodEnd = attrs.ends_at || attrs.renews_at || null;
      // "order_created" fires for the subscription's first invoice, before the
      // subscription itself exists — its attributes.status ("paid") doesn't map to
      // our set, and it has no subscription id/period end yet (subscription_created
      // arrives right after with those, and updates this same row via upsert).
      const subscriptionId = eventName === "order_created" ? null : payload.data?.id || null;

      // Colapsamos los estados de Lemon Squeezy a nuestro propio set. Por seguridad,
      // el default es 'active': para una función que cobra dinero, es mucho peor
      // marcar por error como vencido a alguien que sí pagó (y bloquearlo) que lo
      // contrario. Solo pasamos a 'expired' ante una señal explícita y definitiva
      // de que la suscripción ya no está vigente — nunca por "no reconozco este
      // estado" (eso fue exactamente lo que causó el bug: un status intermedio de
      // Lemon Squeezy que no estaba en la lista blanca caía en "expired" por
      // defecto, aunque el cliente siguiera pagando con normalidad).
      let ourStatus: "active" | "expired" = "active";
      if (eventName === "subscription_expired" || lsStatus === "expired" || lsStatus === "unpaid") {
        ourStatus = "expired";
      }

      const { error: subError } = await supabaseAdmin
        .from("link_subscriptions")
        .upsert(
          {
            link_id: linkId,
            email: String(email).toLowerCase().trim(),
            telegram_username: telegramUsername,
            status: ourStatus,
            lemonsqueezy_subscription_id: subscriptionId,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "link_id,email" }
        );

      if (subError) {
        console.error("❌ Error registrando link_subscription:", subError);
        return new Response("Database Error", { status: 500 });
      }

      console.log(`🔁 Suscripción de link ${linkId} para ${email}: ${ourStatus} (LS status: ${lsStatus})`);
      return new Response("OK", { status: 200 });
    }

    // 2b. Procesar evento de compra/suscripción de planes (Pro/Business)
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
