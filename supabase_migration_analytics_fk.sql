-- Enforce profile_id validity at the database level instead of an extra
-- SELECT round-trip in /api/track before every insert.
-- Safe to run even if some rows already violate it — check first with:
--   select count(*) from public.analytics a
--   where not exists (select 1 from public.profiles p where p.id = a.profile_id);
-- If that returns 0, the ADD CONSTRAINT below will succeed immediately.

ALTER TABLE public.analytics
  ADD CONSTRAINT analytics_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
