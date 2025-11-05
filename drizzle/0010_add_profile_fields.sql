ALTER TABLE `feeConfiguration` MODIFY COLUMN `fixedFeeAmount` int NOT NULL DEFAULT 575;--> statement-breakpoint
ALTER TABLE `users` ADD `middleInitial` varchar(1);--> statement-breakpoint
ALTER TABLE `users` ADD `dateOfBirth` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `ssn` varchar(11);--> statement-breakpoint
ALTER TABLE `users` ADD `idType` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `idNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `maritalStatus` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `dependents` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `citizenshipStatus` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `employmentStatus` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `employer` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `monthlyIncome` int;--> statement-breakpoint
ALTER TABLE `users` ADD `priorBankruptcy` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `bankruptcyDate` varchar(10);