-- ============================================================================
-- TORNEO SNOOKER BLACKPOOL MADRID - ESQUEMA SUPABASE
-- Ejecutar este script en el SQL Editor de Supabase (https://supabase.com/dashboard)
-- ============================================================================

-- 1. Crear tabla para el estado del torneo
CREATE TABLE IF NOT EXISTS public.tournament_state (
    id TEXT PRIMARY KEY DEFAULT 'current',
    title TEXT NOT NULL DEFAULT 'Torneo Snooker Blackpool Madrid',
    state JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.tournament_state ENABLE ROW LEVEL SECURITY;

-- 3. Política de lectura pública: CUALQUIER usuario puede ver los datos en tiempo real
CREATE POLICY "Permitir lectura publica a todos los usuarios"
ON public.tournament_state
FOR SELECT
USING (true);

-- 4. Política de inserción / actualización para la clave publishable / anon y usuarios autorizados
CREATE POLICY "Permitir actualizacion del torneo"
ON public.tournament_state
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Habilitar Realtime para la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_state;
