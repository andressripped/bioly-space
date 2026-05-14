import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { profile_id, email } = await request.json();

    if (!profile_id || !email) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const supabase = await createClient();

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
