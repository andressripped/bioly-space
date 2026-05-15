import { NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { setupLemonSqueezy } from "@/utils/lemonsqueezy";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { variantId, tier } = await req.json();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    if (!variantId) {
      return new Response("Variant ID is required", { status: 400 });
    }

    setupLemonSqueezy();
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    console.log("Iniciando checkout LS:", { storeId, variantId, tier, userEmail: user.email });

    if (!storeId) {
      console.error("Error: Falta LEMONSQUEEZY_STORE_ID");
      return new Response("Store ID is missing", { status: 500 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Crear sesión de checkout en Lemon Squeezy
    const { data, error } = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: user.email,
        custom: {
          user_id: user.id,
          tier: tier, // 'pro' o 'business'
        },
      },
      productOptions: {
        redirectUrl: `${origin}/dashboard?success=true`,
      },
    });

    if (error) {
      console.error("Error detallado de Lemon Squeezy:", error);
      return new Response(error.message || "Error al crear checkout en Lemon Squeezy", { status: 500 });
    }

    if (!data || !data.data) {
      console.error("Respuesta inesperada de Lemon Squeezy (sin data):", data);
      return new Response("Error al obtener la sesión de checkout", { status: 500 });
    }

    const checkoutUrl = data.data.attributes.url;
    console.log("Checkout creado exitosamente:", checkoutUrl);
    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error("[LEMONSQUEEZY_CHECKOUT_ERROR]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
