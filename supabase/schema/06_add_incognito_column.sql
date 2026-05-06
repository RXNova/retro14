-- Add is_incognito column to retro_items table for anonymous card posting
ALTER TABLE public.retro_items
ADD COLUMN IF NOT EXISTS is_incognito BOOLEAN DEFAULT false;

-- Create index for efficient filtering
CREATE INDEX IF NOT EXISTS retro_items_is_incognito_idx ON public.retro_items (is_incognito);
