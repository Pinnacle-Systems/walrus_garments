-- CreateTable
CREATE TABLE `ExcessTolerance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docId` VARCHAR(191) NULL,
    `docDate` VARCHAR(191) NULL,
    `transaction` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,

    UNIQUE INDEX `ExcessTolerance_docId_key`(`docId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExcessToleranceItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `excessToleranceId` INTEGER NULL,
    `fromTolerance` DOUBLE NULL,
    `toTolerance` DOUBLE NULL,
    `qty` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExcessToleranceItems` ADD CONSTRAINT `ExcessToleranceItems_excessToleranceId_fkey` FOREIGN KEY (`excessToleranceId`) REFERENCES `ExcessTolerance`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
