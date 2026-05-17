-- ==========================================
-- MIGRACIÓN DE ANALÍTICAS ULTRA-RÁPIDAS (OPCIÓN 2)
-- ==========================================

-- 1. Crear tabla de resumen diario
CREATE TABLE IF NOT EXISTS public.analytics_daily_summary (
    id bigserial PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    date date NOT NULL,
    views_count integer DEFAULT 0,
    clicks_count integer DEFAULT 0,
    UNIQUE (profile_id, date)
);

-- 2. Crear tabla de resumen de dimensiones (País, Ciudad, Dispositivo, Referidor, Navegador)
CREATE TABLE IF NOT EXISTS public.analytics_dimension_summary (
    id bigserial PRIMARY KEY,
    profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    date date NOT NULL,
    dimension_type text NOT NULL, -- 'referrer', 'country', 'city', 'device', 'browser'
    dimension_value text NOT NULL,
    event_type text NOT NULL, -- 'page_view', 'link_click'
    count integer DEFAULT 0,
    UNIQUE (profile_id, date, dimension_type, dimension_value, event_type)
);

-- 3. Habilitar RLS en las nuevas tablas
ALTER TABLE public.analytics_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_dimension_summary ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de lectura para que los usuarios solo vean sus analíticas
DROP POLICY IF EXISTS "Users view own daily summaries" ON public.analytics_daily_summary;
CREATE POLICY "Users view own daily summaries" ON public.analytics_daily_summary
    FOR SELECT TO authenticated USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users view own dimension summaries" ON public.analytics_dimension_summary;
CREATE POLICY "Users view own dimension summaries" ON public.analytics_dimension_summary
    FOR SELECT TO authenticated USING (auth.uid() = profile_id);

-- 5. Crear la función del disparador (Trigger) para automatizar la agregación en tiempo real
CREATE OR REPLACE FUNCTION public.update_analytics_summaries()
RETURNS TRIGGER AS $$
DECLARE
    v_date date := COALESCE(NEW.created_at, now())::date;
BEGIN
    -- A. Actualizar resumen diario
    INSERT INTO public.analytics_daily_summary (profile_id, date, views_count, clicks_count)
    VALUES (
        NEW.profile_id,
        v_date,
        CASE WHEN NEW.event_type = 'page_view' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'link_click' THEN 1 ELSE 0 END
    )
    ON CONFLICT (profile_id, date) DO UPDATE SET
        views_count = public.analytics_daily_summary.views_count + EXCLUDED.views_count,
        clicks_count = public.analytics_daily_summary.clicks_count + EXCLUDED.clicks_count;

    -- B. Actualizar dimensión (Referrer)
    IF NEW.referrer IS NOT NULL AND NEW.referrer <> '' THEN
        INSERT INTO public.analytics_dimension_summary (profile_id, date, dimension_type, dimension_value, event_type, count)
        VALUES (NEW.profile_id, v_date, 'referrer', NEW.referrer, NEW.event_type, 1)
        ON CONFLICT (profile_id, date, dimension_type, dimension_value, event_type) DO UPDATE SET
            count = public.analytics_dimension_summary.count + 1;
    END IF;

    -- C. Actualizar dimensión (Country)
    IF NEW.country IS NOT NULL AND NEW.country <> '' THEN
        INSERT INTO public.analytics_dimension_summary (profile_id, date, dimension_type, dimension_value, event_type, count)
        VALUES (NEW.profile_id, v_date, 'country', NEW.country, NEW.event_type, 1)
        ON CONFLICT (profile_id, date, dimension_type, dimension_value, event_type) DO UPDATE SET
            count = public.analytics_dimension_summary.count + 1;
    END IF;

    -- D. Actualizar dimensión (City)
    IF NEW.city IS NOT NULL AND NEW.city <> '' THEN
        INSERT INTO public.analytics_dimension_summary (profile_id, date, dimension_type, dimension_value, event_type, count)
        VALUES (NEW.profile_id, v_date, 'city', NEW.city, NEW.event_type, 1)
        ON CONFLICT (profile_id, date, dimension_type, dimension_value, event_type) DO UPDATE SET
            count = public.analytics_dimension_summary.count + 1;
    END IF;

    -- E. Actualizar dimensión (Device)
    IF NEW.device IS NOT NULL AND NEW.device <> '' THEN
        INSERT INTO public.analytics_dimension_summary (profile_id, date, dimension_type, dimension_value, event_type, count)
        VALUES (NEW.profile_id, v_date, 'device', NEW.device, NEW.event_type, 1)
        ON CONFLICT (profile_id, date, dimension_type, dimension_value, event_type) DO UPDATE SET
            count = public.analytics_dimension_summary.count + 1;
    END IF;

    -- F. Actualizar dimensión (Browser)
    IF NEW.browser IS NOT NULL AND NEW.browser <> '' THEN
        INSERT INTO public.analytics_dimension_summary (profile_id, date, dimension_type, dimension_value, event_type, count)
        VALUES (NEW.profile_id, v_date, 'browser', NEW.browser, NEW.event_type, 1)
        ON CONFLICT (profile_id, date, dimension_type, dimension_value, event_type) DO UPDATE SET
            count = public.analytics_dimension_summary.count + 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear el disparador en la tabla analytics
DROP TRIGGER IF EXISTS trg_update_analytics_summaries ON public.analytics;
CREATE TRIGGER trg_update_analytics_summaries
AFTER INSERT ON public.analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_analytics_summaries();

-- 7. MIGRAR HISTORIAL CRUDO EXISTENTE A LAS TABLAS DE RESUMEN
-- A. Historial Diario
INSERT INTO public.analytics_daily_summary (profile_id, date, views_count, clicks_count)
SELECT 
    profile_id,
    created_at::date as date,
    SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) as views_count,
    SUM(CASE WHEN event_type = 'link_click' THEN 1 ELSE 0 END) as clicks_count
FROM public.analytics
GROUP BY profile_id, created_at::date
ON CONFLICT (profile_id, date) DO UPDATE SET
    views_count = EXCLUDED.views_count,
    clicks_count = EXCLUDED.clicks_count;

-- B. Historial de Referrers
INSERT INTO public.analytics_dimension_summary (profile_id, date, dimension_type, dimension_value, event_type, count)
SELECT 
    profile_id,
    created_at::date as date,
    'referrer' as dimension_type,
    referrer as dimension_value,
    event_type,
    COUNT(*) as count
FROM public.analytics
WHERE referrer IS NOT NULL AND referrer <> ''
GROUP BY profile_id, created_at::date, referrer, event_type
ON CONFLICT (profile_id, date, dimension_type, dimension_value, event_type) DO UPDATE SET
    count = EXCLUDED.count;

-- C. Historial de Países
INSERT INTO public.analytics_dimension_summary (profile_id, date, dimension_type, dimension_value, event_type, count)
SELECT 
    profile_id,
    created_at::date as date,
    'country' as dimension_type,
    country as dimension_value,
    event_type,
    COUNT(*) as count
FROM public.analytics
WHERE country IS NOT NULL AND country <> ''
GROUP BY profile_id, created_at::date, country, event_type
ON CONFLICT (profile_id, date, dimension_type, dimension_value, event_type) DO UPDATE SET
    count = EXCLUDED.count;

-- D. Historial de Ciudades
INSERT INTO public.analytics_dimension_summary (profile_id, date, dimension_type, dimension_value, event_type, count)
SELECT 
    profile_id,
    created_at::date as date,
    'city' as dimension_type,
    city as dimension_value,
    event_type,
    COUNT(*) as count
FROM public.analytics
WHERE city IS NOT NULL AND city <> ''
GROUP BY profile_id, created_at::date, city, event_type
ON CONFLICT (profile_id, date, dimension_type, dimension_value, event_type) DO UPDATE SET
    count = EXCLUDED.count;

-- E. Historial de Dispositivos
INSERT INTO public.analytics_dimension_summary (profile_id, date, dimension_type, dimension_value, event_type, count)
SELECT 
    profile_id,
    created_at::date as date,
    'device' as dimension_type,
    device as dimension_value,
    event_type,
    COUNT(*) as count
FROM public.analytics
WHERE device IS NOT NULL AND device <> ''
GROUP BY profile_id, created_at::date, device, event_type
ON CONFLICT (profile_id, date, dimension_type, dimension_value, event_type) DO UPDATE SET
    count = EXCLUDED.count;

-- F. Historial de Navegadores
INSERT INTO public.analytics_dimension_summary (profile_id, date, dimension_type, dimension_value, event_type, count)
SELECT 
    profile_id,
    created_at::date as date,
    'browser' as dimension_type,
    browser as dimension_value,
    event_type,
    COUNT(*) as count
FROM public.analytics
WHERE browser IS NOT NULL AND browser <> ''
GROUP BY profile_id, created_at::date, browser, event_type
ON CONFLICT (profile_id, date, dimension_type, dimension_value, event_type) DO UPDATE SET
    count = EXCLUDED.count;
