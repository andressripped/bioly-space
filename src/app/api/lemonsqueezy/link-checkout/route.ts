import { NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { setupLemonSqueezy } from "@/utils/lemonsqueezy";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isValidLinkPrice, linkVariantEnvVar } from "@/lib/linkPricing";

export async function POST(req: Request) {
  try {
    const { link_id, email, telegram_username, redirect_path } = await req.json();

    if (!link_id || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedTelegram = telegram_username ? String(telegram_username).replace(/^@/, "").trim() : null;

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: link, error: linkError } = await supabaseAdmin
      .from("links")
      .select("id, is_paid, price_usd, title")
      .eq("id", link_id)
      .single();

    if (linkError || !link) {
      return NextResponse.json({ error: "Link no encontrado" }, { status: 404 });
    }
    if (!link.is_paid || !link.price_usd || !isValidLinkPrice(Number(link.price_usd))) {
      return NextResponse.json({ error: "Este link no tiene un precio válido configurado" }, { status: 400 });
    }

    setupLemonSqueezy();
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const variantId = process.env[linkVariantEnvVar(Number(link.price_usd))];

    if (!storeId || !variantId) {
      console.error(`Falta LEMONSQUEEZY_STORE_ID o ${linkVariantEnvVar(Number(link.price_usd))}`);
      return NextResponse.json({ error: "Configuración de pagos incompleta" }, { status: 500 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const safeRedirectPath = typeof redirect_path === "string" && redirect_path.startsWith("/") ? redirect_path : "/";

    const { data, error } = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: normalizedEmail,
        custom: {
          type: "link_subscription",
          link_id,
          email: normalizedEmail,
          telegram_username: normalizedTelegram,
        },
      },
      checkoutOptions: {
        embed: false,
      },
      productOptions: {
        name: `Suscripción: ${link.title}`,
        redirectUrl: `${origin}${safeRedirectPath}?unlock_link=${link_id}`,
      },
    });

    if (error || !data?.data) {
      console.error("Error creando checkout de link:", error);
      return NextResponse.json({ error: "No se pudo crear el checkout" }, { status: 500 });
    }

    return NextResponse.json({ url: data.data.attributes.url });
  } catch (error: any) {
    console.error("[LINK_CHECKOUT_ERROR]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
