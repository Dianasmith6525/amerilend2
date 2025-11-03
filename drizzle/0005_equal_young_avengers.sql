CREATE TABLE `fraudAuditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loanApplicationId` int NOT NULL,
	`userId` int NOT NULL,
	`fraudScore` int NOT NULL,
	`fraudFlags` text NOT NULL,
	`ssnDuplicate` int NOT NULL DEFAULT 0,
	`invalidSSNPattern` int NOT NULL DEFAULT 0,
	`invalidPhonePattern` int NOT NULL DEFAULT 0,
	`disposableEmail` int NOT NULL DEFAULT 0,
	`recentApplication` int NOT NULL DEFAULT 0,
	`highLoanLeverageRatio` int NOT NULL DEFAULT 0,
	`recentBankruptcy` int NOT NULL DEFAULT 0,
	`adminReview` enum('pending','approved','rejected','manual_review') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`adminReviewedBy` int,
	`finalDecision` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fraudAuditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loanDocumentRequirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loanType` varchar(50) NOT NULL,
	`documentName` varchar(255) NOT NULL,
	`description` text,
	`isRequired` tinyint NOT NULL DEFAULT 1,
	`category` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `loanDocumentRequirements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referralCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(16) NOT NULL,
	`referrerRewardType` enum('discount','bonus_credit','cash_bonus') NOT NULL DEFAULT 'cash_bonus',
	`referrerRewardAmount` int NOT NULL,
	`refereeRewardType` enum('discount','bonus_credit','cash_bonus') NOT NULL DEFAULT 'discount',
	`refereeRewardAmount` int NOT NULL,
	`referralStatus` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`totalReferrals` int NOT NULL DEFAULT 0,
	`totalRewardsEarned` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deactivatedAt` timestamp,
	CONSTRAINT `referralCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `referralCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referralCodeId` int NOT NULL,
	`referrerId` int NOT NULL,
	`refereeId` int NOT NULL,
	`referralSource` varchar(100),
	`ipAddress` varchar(45),
	`referralStatus` enum('pending','signed_up','loan_applied','loan_approved','completed') NOT NULL DEFAULT 'signed_up',
	`rewardStatus` enum('pending','earned','applied','cancelled') NOT NULL DEFAULT 'pending',
	`referrerRewardAmount` int NOT NULL,
	`referrerRewardPaidAt` timestamp,
	`refereeRewardAmount` int NOT NULL,
	`refereeRewardAppliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `submittedDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`loanApplicationId` int NOT NULL,
	`documentType` varchar(100) NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileUrl` varchar(500) NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(50) NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	`verificationStatus` enum('pending','approved','rejected','needs_reupload') NOT NULL DEFAULT 'pending',
	`verifiedBy` int,
	`verifiedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `submittedDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `disbursements` MODIFY COLUMN `accountHolderName` varchar(255);--> statement-breakpoint
ALTER TABLE `disbursements` MODIFY COLUMN `accountNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `disbursements` MODIFY COLUMN `routingNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `disbursements` MODIFY COLUMN `status` enum('pending','processing','in_transit','completed','failed','reversed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `loanApplications` MODIFY COLUMN `loanType` enum('personal','installment','short_term','auto','home_equity','heloc','student','business','debt_consolidation','mortgage','private_money','title','credit_builder','signature','peer_to_peer') NOT NULL;--> statement-breakpoint
ALTER TABLE `disbursements` ADD `disbursementMethod` enum('ach','wire','check','paycard') DEFAULT 'ach' NOT NULL;--> statement-breakpoint
ALTER TABLE `disbursements` ADD `accountType` enum('checking','savings');--> statement-breakpoint
ALTER TABLE `disbursements` ADD `swiftCode` varchar(20);--> statement-breakpoint
ALTER TABLE `disbursements` ADD `bankName` varchar(255);--> statement-breakpoint
ALTER TABLE `disbursements` ADD `checkNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `disbursements` ADD `checkMailingAddress` text;--> statement-breakpoint
ALTER TABLE `disbursements` ADD `checkPayeeName` varchar(255);--> statement-breakpoint
ALTER TABLE `disbursements` ADD `checkMailedDate` timestamp;--> statement-breakpoint
ALTER TABLE `disbursements` ADD `estimatedDeliveryDate` date;--> statement-breakpoint
ALTER TABLE `disbursements` ADD `trackingNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `disbursements` ADD `referenceNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `loanApplications` ADD `middleInitial` varchar(1) NOT NULL;--> statement-breakpoint
ALTER TABLE `loanApplications` ADD `idType` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `loanApplications` ADD `idNumber` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `loanApplications` ADD `maritalStatus` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `loanApplications` ADD `dependents` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `loanApplications` ADD `citizenshipStatus` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `loanApplications` ADD `priorBankruptcy` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `loanApplications` ADD `bankruptcyDate` varchar(10);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);