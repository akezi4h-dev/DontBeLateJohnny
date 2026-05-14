-- Migration 001: Remove employer CHECK constraint
-- Allows custom category keys (e.g. custom_1718293847) to be stored in shifts.
-- Run this in: Supabase Dashboard → SQL Editor → New query

ALTER TABLE public.shifts DROP CONSTRAINT IF EXISTS shifts_employer_check;
