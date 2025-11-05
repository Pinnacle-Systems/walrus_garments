/*
  Warnings:

  - You are about to drop the column `accessoryCategory` on the `accessory` table. All the data in the column will be lost.
  - Added the required column `accessoryCategoryId` to the `Accessory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `accessoryitem` DROP FOREIGN KEY `AccessoryItem_accessoryGroupId_fkey`;

-- AlterTable
ALTER TABLE `accessory` DROP COLUMN `accessoryCategory`,
    ADD COLUMN `accessoryCategoryId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `accessoryitem` MODIFY `accessoryGroupId` INTEGER NULL;

-- CreateTable
CREATE TABLE `AccessoryCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AccessoryItem` ADD CONSTRAINT `AccessoryItem_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Accessory` ADD CONSTRAINT `Accessory_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
