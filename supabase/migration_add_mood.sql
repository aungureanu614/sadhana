-- Add mood column to daily_intentions
ALTER TABLE daily_intentions
  ADD COLUMN IF NOT EXISTS mood text CHECK (mood IN ('energized', 'restless', 'heavy', 'balanced'));
