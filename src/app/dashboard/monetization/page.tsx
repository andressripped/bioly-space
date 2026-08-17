import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import MonetizationClient from "./MonetizationClient";

export const dynamic = "force-dynamic";

export default async function MonetizationPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: links } = await supabase
    .from("links")
    .select("id, title, url, icon, is_paid, price_usd, position")
    .eq("user_id", user.id)
    .eq("is_paid", true)
    .order("position", { ascending: true });

  return (
    <main className="w-full p-6 md:p-12 max-w-4xl mx-auto">
      <div className="mb-10 mt-16 md:mt-0">
        <h1 className="text-3xl font-serif font-bold text-[#111111] dark:text-white mb-2">
          Monetización
        </h1>
        <p className="text-[#555555] dark:text-[#a1a1aa]">
          Cobra a tus seguidores por acceso a grupos privados, contenido exclusivo y más.
        </p>
      </div>

      <MonetizationClient initialLinks={links || []} userId={user.id} />
    </main>
  );
}
