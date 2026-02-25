-- AlterTable
ALTER TABLE `directinwardorreturn` ADD COLUMN `branchId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `DirectInwardOrReturn` ADD CONSTRAINT `DirectInwardOrReturn_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
