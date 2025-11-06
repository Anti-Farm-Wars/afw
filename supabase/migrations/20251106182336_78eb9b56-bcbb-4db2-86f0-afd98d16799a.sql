-- Add color field to association_types
ALTER TABLE association_types ADD COLUMN color TEXT DEFAULT '#3b82f6';

-- Add color field to clan_associations  
ALTER TABLE clan_associations ADD COLUMN color TEXT;

-- Add color field to player_associations
ALTER TABLE player_associations ADD COLUMN color TEXT;

-- Add association_type field to player_associations to match clan_associations
ALTER TABLE player_associations ADD COLUMN association_type TEXT NOT NULL DEFAULT 'General';