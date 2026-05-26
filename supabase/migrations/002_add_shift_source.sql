-- Migration 002: Add source column to shifts
-- Tracks whether a shift was entered manually or imported via OCR screenshot.
-- Run this in: Supabase Dashboard → SQL Editor → New query

ALTER TABLE public.shifts
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual'
  CHECK (source IN ('manual', 'ocr'));

-- Backfill: all existing rows are assumed manual
UPDATE public.shifts SET source = 'manual' WHERE source IS NULL;
