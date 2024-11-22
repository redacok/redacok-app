-- Add active field to User model
ALTER TABLE User ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
