-- DropForeignKey
ALTER TABLE `po` DROP FOREIGN KEY `Po_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `po` DROP FOREIGN KEY `Po_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `po` DROP FOREIGN KEY `Po_supplierId_fkey`;

-- AlterTable
ALTER TABLE `po` ADD COLUMN `poMaterial` VARCHAR(191) NULL,
    ADD COLUMN `poType` VARCHAR(191) NULL,
    MODIFY `supplierId` INTEGER NULL,
    MODIFY `createdById` INTEGER NULL,
    MODIFY `docId` VARCHAR(191) NULL,
    MODIFY `branchId` INTEGER NULL,
    MODIFY `active` BOOLEAN NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Party`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Po` ADD CONSTRAINT `Po_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
