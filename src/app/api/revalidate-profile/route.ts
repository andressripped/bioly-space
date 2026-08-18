import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

// Called (fire-and-forget) right after the dashboard saves anything that
// affects the public /[username] page, so the ISR cache for that page
// doesn't have to wait out its full `revalidate` window.
export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "username requerido" }, { status: 400 });
    }

    // Only the profile's own owner can trigger a revalidation for it.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    if (!profile || profile.username !== username) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    revalidatePath(`/${username}`);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[REVALIDATE_PROFILE_ERROR]", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
