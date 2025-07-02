/*
  Warnings:

  - You are about to drop the column `stockId` on the `directitems` table. All the data in the column will be lost.
  - You are about to drop the column `noOfRolls` on the `inwardlotdetails` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `directitems` DROP FOREIGN KEY `DirectItems_stockId_fkey`;

-- AlterTable
ALTER TABLE `directitems` DROP COLUMN `stockId`;

-- AlterTable
ALTER TABLE `inwardlotdetails` DROP COLUMN `noOfRolls`,
    ADD COLUMN `noOfBags` INTEGER NULL;

-- CreateTable
CREATE TABLE `_DirectItemsToStock` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_DirectItemsToStock_AB_unique`(`A`, `B`),
    INDEX `_DirectItemsToStock_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_DirectItemsToStock` ADD CONSTRAINT `_DirectItemsToStock_A_fkey` FOREIGN KEY (`A`) REFERENCES `DirectItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_DirectItemsToStock` ADD CONSTRAINT `_DirectItemsToStock_B_fkey` FOREIGN KEY (`B`) REFERENCES `Stock`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
