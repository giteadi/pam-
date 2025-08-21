-- Add comment column to inspection_items table
ALTER TABLE inspection_items ADD COLUMN comment TEXT DEFAULT NULL;