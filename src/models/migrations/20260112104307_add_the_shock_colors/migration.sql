/*
  Warnings:

  - You are about to drop the column `baseColorId` on the `orderdetails` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `orderdetails` DROP FOREIGN KEY `OrderDetails_baseColorId_fkey`;

-- AlterTable
ALTER TABLE `orderdetails` DROP COLUMN `baseColorId`,
    ADD COLUMN `footColorId` INTEGER NULL,
    ADD COLUMN `legColorId` INTEGER NULL,
    ADD COLUMN `nameAndLogo` VARCHAR(191) NULL,
    ADD COLUMN `stripeLines` INTEGER NULL,
    ADD COLUMN `stripesColorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_legColorId_fkey` FOREIGN KEY (`legColorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_footColorId_fkey` FOREIGN KEY (`footColorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_stripesColorId_fkey` FOREIGN KEY (`stripesColorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
