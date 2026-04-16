-- AlterTable
ALTER TABLE `offer` ADD COLUMN `stacking` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `pos` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `salesPersonId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Pos` ADD CONSTRAINT `Pos_salesPersonId_fkey` FOREIGN KEY (`salesPersonId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
