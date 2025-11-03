-- Fix email column: add UNIQUE constraint for email queries
-- This ensures email lookups work properly in SQL queries
ALTER TABLE `users` ADD UNIQUE KEY `email_unique` (`email`);
