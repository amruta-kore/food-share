ALTER TABLE `User`
  ADD COLUMN `phone` VARCHAR(191) NULL,
  ADD COLUMN `organization` VARCHAR(191) NULL,
  ADD COLUMN `verificationToken` VARCHAR(191) NULL,
  ADD COLUMN `passwordResetToken` VARCHAR(191) NULL,
  ADD COLUMN `passwordResetExpires` DATETIME(3) NULL,
  ADD COLUMN `documentUrl` TEXT NULL,
  ADD COLUMN `documentType` VARCHAR(191) NULL,
  ADD COLUMN `documentName` VARCHAR(191) NULL,
  ADD COLUMN `verifiedAt` DATETIME(3) NULL,
  ADD COLUMN `rejectionReason` VARCHAR(191) NULL;