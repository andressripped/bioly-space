import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import ProfileView from "./ProfileView";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  // 1. Buscar el perfil por el username
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    return notFound();
  }

  // 2. Buscar los enlaces de ese usuario
  const { data: links, error: linksError } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("position", { ascending: true });

  return (
    <ProfileView 
      profile={profile} 
      links={links || []} 
    />
  );
}
