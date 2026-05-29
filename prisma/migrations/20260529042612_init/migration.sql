-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `role` ENUM('USER', 'ADMIN', 'SUPERADMIN') NOT NULL DEFAULT 'USER',
    `employeeId` VARCHAR(191) NULL,
    `healthCenterHcode` VARCHAR(191) NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `provinces` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NULL,
    `name_en` VARCHAR(200) NULL,
    `short` VARCHAR(200) NULL,
    `short_en` VARCHAR(100) NULL,
    `region_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `districts` (
    `id` INTEGER NOT NULL,
    `name` VARCHAR(200) NULL,
    `chw_id` INTEGER NULL,
    `amp_id` VARCHAR(200) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subdistricts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(200) NULL,
    `chw_id` INTEGER NULL,
    `amp_id` INTEGER NULL,
    `tam_id` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `health_centers` (
    `hcode` VARCHAR(5) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `tambonId` INTEGER NULL,

    PRIMARY KEY (`hcode`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `summary_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` INTEGER NOT NULL,
    `hcode` VARCHAR(191) NOT NULL,
    `targetPopulation` INTEGER NOT NULL DEFAULT 0,
    `screenedTotal` INTEGER NOT NULL DEFAULT 0,
    `screenedNormal` INTEGER NOT NULL DEFAULT 0,
    `screenedRisk` INTEGER NOT NULL DEFAULT 0,
    `careTotal` INTEGER NOT NULL DEFAULT 0,
    `assess9QNormal` INTEGER NOT NULL DEFAULT 0,
    `assess9QRisk` INTEGER NOT NULL DEFAULT 0,
    `assess8QNormal` INTEGER NOT NULL DEFAULT 0,
    `assess8QRisk` INTEGER NOT NULL DEFAULT 0,
    `careCounseling` INTEGER NOT NULL DEFAULT 0,
    `careReferral` INTEGER NOT NULL DEFAULT 0,
    `followUpNormal` INTEGER NOT NULL DEFAULT 0,
    `followUpRiskQ12` INTEGER NOT NULL DEFAULT 0,
    `followUpRiskQ3` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `summary_reports_year_hcode_key`(`year`, `hcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `people` (
    `pid` INTEGER NOT NULL AUTO_INCREMENT,
    `cid` VARCHAR(13) NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `birthDate` DATETIME(3) NULL,
    `address` TEXT NULL,
    `subdistrictId` INTEGER NULL,
    `zipcode` VARCHAR(10) NULL,
    `telephone` VARCHAR(20) NULL,
    `mobile` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `healthCenterHcode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `people_cid_key`(`cid`),
    PRIMARY KEY (`pid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `screenings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `personId` INTEGER NOT NULL,
    `screen_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `q2Result` BOOLEAN NOT NULL DEFAULT false,
    `q9Score` INTEGER NULL,
    `q9Result` BOOLEAN NULL,
    `q8Score` INTEGER NULL,
    `q8Result` BOOLEAN NULL,
    `careType` VARCHAR(255) NULL,
    `careDetail` TEXT NULL,
    `year` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_healthCenterHcode_fkey` FOREIGN KEY (`healthCenterHcode`) REFERENCES `health_centers`(`hcode`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `districts` ADD CONSTRAINT `districts_chw_id_fkey` FOREIGN KEY (`chw_id`) REFERENCES `provinces`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subdistricts` ADD CONSTRAINT `subdistricts_chw_id_fkey` FOREIGN KEY (`chw_id`) REFERENCES `provinces`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subdistricts` ADD CONSTRAINT `subdistricts_amp_id_fkey` FOREIGN KEY (`amp_id`) REFERENCES `districts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `health_centers` ADD CONSTRAINT `health_centers_tambonId_fkey` FOREIGN KEY (`tambonId`) REFERENCES `subdistricts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `summary_reports` ADD CONSTRAINT `summary_reports_hcode_fkey` FOREIGN KEY (`hcode`) REFERENCES `health_centers`(`hcode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `people` ADD CONSTRAINT `people_subdistrictId_fkey` FOREIGN KEY (`subdistrictId`) REFERENCES `subdistricts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `people` ADD CONSTRAINT `people_healthCenterHcode_fkey` FOREIGN KEY (`healthCenterHcode`) REFERENCES `health_centers`(`hcode`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `screenings` ADD CONSTRAINT `screenings_personId_fkey` FOREIGN KEY (`personId`) REFERENCES `people`(`pid`) ON DELETE RESTRICT ON UPDATE CASCADE;
