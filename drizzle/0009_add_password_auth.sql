-- Add password field to users table for password-based authentication
ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255);
