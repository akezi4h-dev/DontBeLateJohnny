-- Add optional location field to shifts
-- When set, CommuteMap geocodes this address instead of the employer default
ALTER TABLE public.shifts
  ADD COLUMN IF NOT EXISTS location text DEFAULT NULL;
