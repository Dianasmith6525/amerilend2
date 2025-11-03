-- Add disbursement method support
-- Migration: Add multiple disbursement options (ACH, Wire, Check, PayCard)

ALTER TABLE `disbursements` 
ADD COLUMN `disbursementMethod` ENUM(
  'ach',
  'wire',
  'check',
  'paycard'
) NOT NULL DEFAULT 'ach' AFTER `amount`;

-- Add method-specific fields for bank transfers
ALTER TABLE `disbursements`
ADD COLUMN `accountType` ENUM('checking', 'savings') AFTER `disbursementMethod`,
ADD COLUMN `swiftCode` VARCHAR(20) AFTER `accountType`,
ADD COLUMN `bankName` VARCHAR(255) AFTER `swiftCode`;

-- Make bank details optional for all methods
ALTER TABLE `disbursements`
MODIFY COLUMN `accountHolderName` VARCHAR(255),
MODIFY COLUMN `accountNumber` VARCHAR(50),
MODIFY COLUMN `routingNumber` VARCHAR(20);

-- Add check-specific fields
ALTER TABLE `disbursements`
ADD COLUMN `checkNumber` VARCHAR(20) AFTER `routingNumber`,
ADD COLUMN `checkMailingAddress` TEXT AFTER `checkNumber`,
ADD COLUMN `checkPayeeName` VARCHAR(255) AFTER `checkMailingAddress`,
ADD COLUMN `checkMailedDate` TIMESTAMP AFTER `checkPayeeName`;

-- Add tracking and delivery fields
ALTER TABLE `disbursements`
ADD COLUMN `estimatedDeliveryDate` DATE AFTER `checkMailedDate`,
ADD COLUMN `trackingNumber` VARCHAR(100) AFTER `estimatedDeliveryDate`,
ADD COLUMN `referenceNumber` VARCHAR(100) AFTER `trackingNumber`;

-- Update status enum to include new statuses
ALTER TABLE `disbursements`
MODIFY COLUMN `status` ENUM(
  'pending',
  'processing',
  'in_transit',
  'completed',
  'failed',
  'reversed'
) NOT NULL DEFAULT 'pending';

-- Create index for quick lookup by method
CREATE INDEX `idx_disbursements_method` ON `disbursements`(`disbursementMethod`);

-- Create index for estimated delivery date (for tracking)
CREATE INDEX `idx_disbursements_estimated_delivery` ON `disbursements`(`estimatedDeliveryDate`);

-- Create index for reference number (for customer lookups)
CREATE INDEX `idx_disbursements_reference` ON `disbursements`(`referenceNumber`);
