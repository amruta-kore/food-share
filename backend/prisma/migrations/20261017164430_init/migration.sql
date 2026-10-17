-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('DONOR', 'NGO', 'VOLUNTEER', 'ADMIN') NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Donation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `foodName` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `isVegetarian` BOOLEAN NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `servings` INTEGER NOT NULL,
    `preparedAt` DATETIME(3) NOT NULL,
    `consumeBefore` DATETIME(3) NOT NULL,
    `storage` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `pickupAddress` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `pickupStart` DATETIME(3) NOT NULL,
    `pickupEnd` DATETIME(3) NOT NULL,
    `contactPerson` VARCHAR(191) NOT NULL,
    `contactPhone` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'REQUESTED', 'ACCEPTED', 'VOLUNTEER_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'REJECTED') NOT NULL DEFAULT 'AVAILABLE',
    `donorId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Request` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ngoId` INTEGER NOT NULL,
    `donationId` INTEGER NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Request_donationId_key`(`donationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Donation` ADD CONSTRAINT `Donation_donorId_fkey` FOREIGN KEY (`donorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_ngoId_fkey` FOREIGN KEY (`ngoId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_donationId_fkey` FOREIGN KEY (`donationId`) REFERENCES `Donation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
