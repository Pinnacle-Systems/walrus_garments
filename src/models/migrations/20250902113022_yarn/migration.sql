-- AlterTable
ALTER TABLE `yarncounts` ADD COLUMN `yarnId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `yarnCounts` ADD CONSTRAINT `yarnCounts_yarnId_fkey` FOREIGN KEY (`yarnId`) REFERENCES `Yarn`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
