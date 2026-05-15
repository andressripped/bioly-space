import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== "andreslit6@gmail.com") {
    redirect("/dashboard");
  }

  // Fetch all profiles to manage
  // Nota: Para poder ver los emails de todos, tendríamos que tener acceso de superadmin en Supabase.
  // Como los perfiles no guardan el email por defecto, haremos un JOIN o aseguraremos que auth.users sea accesible.
  // Pero Supabase bloquea leer auth.users desde el cliente anon.
  // La mejor forma es que guardemos el email en profiles al momento de crear la cuenta.
  
  // Vamos a traer los perfiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (profilesError) {
    console.error("Error al obtener perfiles en Admin:", profilesError);
  } else {
    console.log(`[Admin] Se encontraron ${profiles?.length || 0} perfiles.`);
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#050505] text-[#111111] dark:text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-serif font-bold text-emerald-600 mb-2">
            SuperAdmin Panel
          </h1>
          <p className="text-[#555555] dark:text-[#a1a1aa]">
            Control total de Bioly. Gestiona usuarios y planes.
          </p>
        </div>

        <AdminClient profiles={profiles || []} />
      </div>
    </div>
  );
}
