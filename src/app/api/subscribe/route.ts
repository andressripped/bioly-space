import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { profile_id, email } = await request.json();

    if (!profile_id || !email) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Si tenemos la Service Role Key (en Vercel/Producción), la usamos para saltarnos RLS completamente y registrar el email de forma segura
    let supabase;
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      supabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    } else {
      supabase = await createClient();
    }

    const { error } = await supabase
      .from("email_subscribers")
      .insert([{ profile_id, email }]);

    if (error) {
      // Código de error de PostgreSQL para violación de unicidad
      if (error.code === '23505') {
        return NextResponse.json({ error: "Este email ya está suscrito." }, { status: 400 });
      }
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error subscribing:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
