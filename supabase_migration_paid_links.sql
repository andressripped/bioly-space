-- ==========================================
-- LINKS PRIVADOS / SUSCRIPCIÓN MENSUAL
-- ==========================================

-- 1. Columnas nuevas en links (is_paid = requiere pago; price_usd = precio mensual)
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS price_usd numeric(10,2);

-- 2. Si ya habías corrido una versión anterior de esta migración (pago único), la reemplazamos
DROP TABLE IF EXISTS public.link_purchases;

-- 3. Tabla de suscripciones
CREATE TABLE IF NOT EXISTS public.link_subscriptions (
    id bigserial PRIMARY KEY,
    link_id uuid NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
    email text NOT NULL,
    telegram_username text,
    status text NOT NULL DEFAULT 'pending', -- 'pending' | 'active' | 'cancelled' | 'expired'
    lemonsqueezy_subscription_id text,
    current_period_end timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (link_id, email)
);

ALTER TABLE public.link_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. El dueño del link puede ver (desde el dashboard) quién está suscrito a sus propios links
DROP POLICY IF EXISTS "Owners view their link subscribers" ON public.link_subscriptions;
CREATE POLICY "Owners view their link subscribers" ON public.link_subscriptions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.links
            WHERE links.id = link_subscriptions.link_id
            AND links.user_id = auth.uid()
        )
    );

-- El resto de escrituras (crear/actualizar suscripciones) pasa por el webhook con la Service Role Key.
