-- DropForeignKey
ALTER TABLE `process` DROP FOREIGN KEY `Process_companyId_fkey`;

-- DropForeignKey
ALTER TABLE `yarncounts` DROP FOREIGN KEY `yarnCounts_yarnId_fkey`;

-- AlterTable
ALTER TABLE `process` ADD COLUMN `hsn` VARCHAR(191) NULL,
    ADD COLUMN `processType` VARCHAR(191) NULL,
    ADD COLUMN `tax` DOUBLE NULL,
    MODIFY `name` VARCHAR(191) NULL,
    MODIFY `code` VARCHAR(191) NULL,
    MODIFY `isCutting` BOOLEAN NULL DEFAULT false,
    MODIFY `isPacking` BOOLEAN NULL DEFAULT false,
    MODIFY `isPcsStage` BOOLEAN NULL DEFAULT false,
    MODIFY `isIroning` BOOLEAN NULL DEFAULT false,
    MODIFY `active` BOOLEAN NULL DEFAULT true,
    MODIFY `companyId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `yarnCounts` ADD CONSTRAINT `yarnCounts_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Process` ADD CONSTRAINT `Process_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
