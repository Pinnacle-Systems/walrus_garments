-- AlterTable
ALTER TABLE `socksmaterial` ADD COLUMN `companyId` INTEGER NULL,
    ALTER COLUMN `Active` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `SocksMaterial` ADD CONSTRAINT `SocksMaterial_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
