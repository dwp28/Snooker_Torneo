-- ============================================================================
-- 🎱 TORNEO SNOOKER BLACKPOOL MADRID - ESQUEMA SUPABASE
-- Pega y ejecuta este código en: Supabase -> SQL Editor -> New Query -> Run
-- ============================================================================

-- 1. Crear tabla para almacenar el estado global del torneo
CREATE TABLE IF NOT EXISTS public.tournament_state (
    id TEXT PRIMARY KEY DEFAULT 'current',
    title TEXT NOT NULL DEFAULT 'Torneo Snooker Blackpool Madrid',
    state JSONB NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.tournament_state ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas previas si existían para evitar duplicados
DROP POLICY IF EXISTS "Permitir lectura publica a todos los usuarios" ON public.tournament_state;
DROP POLICY IF EXISTS "Permitir actualizacion del torneo" ON public.tournament_state;

-- 4. Política de lectura pública: cualquier espectador puede consultar el torneo en tiempo real
CREATE POLICY "Permitir lectura publica a todos los usuarios"
ON public.tournament_state
FOR SELECT
USING (true);

-- 5. Política de escritura y actualización para sincronizar resultados
CREATE POLICY "Permitir actualizacion del torneo"
ON public.tournament_state
FOR ALL
USING (true)
WITH CHECK (true);

-- 6. Habilitar Supabase Realtime para recibir cambios en vivo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'tournament_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tournament_state;
  END IF;
END $$;
