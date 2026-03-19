/*
  Warnings:

  - You are about to drop the column `active` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `cuttingDeliveryDetailsId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `cuttingExcessFabricReturnDetailsId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `inwardLotDetailsId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `lotNo` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `noOfBags` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `noOfRolls` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `processDeliveryReturnRawMaterialDetailsId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `processId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `programInwardLotDetailsId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `rawMaterialOpeningStockItemsId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `rawMaterialsSalesDetailsId` on the `stock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_cuttingDeliveryDetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_cuttingExcessFabricReturnDetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_inwardLotDetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_processDeliveryReturnRawMaterialDetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_processId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_programInwardLotDetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_rawMaterialOpeningStockItemsId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_rawMaterialsSalesDetailsId_fkey`;

-- AlterTable
ALTER TABLE `cuttingdeliverydetails` ADD COLUMN `stockId` INTEGER NULL;

-- AlterTable
ALTER TABLE `stock` DROP COLUMN `active`,
    DROP COLUMN `cuttingDeliveryDetailsId`,
    DROP COLUMN `cuttingExcessFabricReturnDetailsId`,
    DROP COLUMN `inwardLotDetailsId`,
    DROP COLUMN `lotNo`,
    DROP COLUMN `noOfBags`,
    DROP COLUMN `noOfRolls`,
    DROP COLUMN `processDeliveryReturnRawMaterialDetailsId`,
    DROP COLUMN `processId`,
    DROP COLUMN `programInwardLotDetailsId`,
    DROP COLUMN `rawMaterialOpeningStockItemsId`,
    DROP COLUMN `rawMaterialsSalesDetailsId`;

-- AddForeignKey
ALTER TABLE `CuttingDeliveryDetails` ADD CONSTRAINT `CuttingDeliveryDetails_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
