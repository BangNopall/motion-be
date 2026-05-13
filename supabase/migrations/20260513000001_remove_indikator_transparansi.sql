-- Remove 'indikator' from 'motion24_aspek' and drop 'motion24_transparansi' table
ALTER TABLE public.motion24_aspek DROP COLUMN IF EXISTS indikator;
DROP TABLE IF EXISTS public.motion24_transparansi;
