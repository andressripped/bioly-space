import { createPublicClient } from "@/utils/supabase/public";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProfileView from "./ProfileView";

// Statically render this page and regenerate it at most once an hour, or
// immediately when the owner saves changes (see /api/revalidate-profile).
export const revalidate = 3600;

type Props = {
  params: Promise<{ username: string }>;
};

// ─── Dynamic Open Graph Metadata ─────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const supabase = createPublicClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, avatar_url, username, seo_title, seo_description")
    .eq("username", username)
    .single();

  if (!profile) {
    return {
      title: "Perfil no encontrado | Bioly",
    };
  }

  const displayName = profile.display_name || profile.username;
  const bio = profile.bio || "Mira todos mis links en Bioly";
  
  const title = profile.seo_title || `${displayName} | Bioly`;
  const description = profile.seo_description || bio;
  
  const ogImageUrl = `/api/og/${username}`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://bioly.space/${username}`,
      siteName: "Bioly",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayName} en Bioly`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [ogImageUrl],
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const supabase = createPublicClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    return notFound();
  }

  const { data: links } = await supabase
    .from("links")
    .select("*")
    .eq("user_id", profile.id)
    .order("position", { ascending: true });

  return (
    <ProfileView
      profile={profile}
      links={links || []}
    />
  );
}
