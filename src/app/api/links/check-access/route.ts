import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { link_id, email } = await req.json();

    if (!link_id || !email) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabaseAdmin
      .from("link_subscriptions")
      .select("status, current_period_end")
      .eq("link_id", link_id)
      .eq("email", email.toLowerCase().trim())
      .eq("status", "active")
      .maybeSingle();

    const unlocked = !!data && (!data.current_period_end || new Date(data.current_period_end) > new Date());

    return NextResponse.json({ unlocked });
  } catch (error: any) {
    console.error("[CHECK_ACCESS_ERROR]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
