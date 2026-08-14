import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const linkId = searchParams.get("link_id");
    if (!linkId) {
      return NextResponse.json({ error: "link_id requerido" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // RLS ("Owners view their link subscribers") ya garantiza que solo se devuelvan
    // filas de links que pertenecen al usuario autenticado.
    const { data, error } = await supabase
      .from("link_subscriptions")
      .select("email, telegram_username, status, current_period_end, created_at")
      .eq("link_id", linkId)
      .order("status", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error al obtener suscriptores:", error);
      return NextResponse.json({ error: "Error al obtener suscriptores" }, { status: 500 });
    }

    return NextResponse.json({ subscribers: data || [] });
  } catch (error: any) {
    console.error("[SUBSCRIBERS_ERROR]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
