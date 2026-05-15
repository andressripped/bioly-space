import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const cookieStore = await cookies()
  const postLoginRedirect = cookieStore.get('post_login_redirect')?.value
  
  // Prioridad: 1. Cookie guardada, 2. Parámetro "next", 3. Dashboard por defecto
  const next = postLoginRedirect || searchParams.get('next') || '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Check if the user already has a profile
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, onboarding_completed')
          .eq('id', user.id)
          .single()

        // No profile yet → go to onboarding (will consume pending_username)
        if (!profile) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
        // Profile exists but onboarding not completed → back to onboarding
        if (profile.onboarding_completed === false) {
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      }
      // Limpiar la cookie de redirección
      cookieStore.delete('post_login_redirect')
      
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    console.error('Auth exchange error:', error)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
