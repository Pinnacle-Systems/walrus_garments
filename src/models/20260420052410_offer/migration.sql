-- /*
--   Warnings:

--   - You are about to drop the column `balanceReturn` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `discountType` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `discountValue` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `manualDiscount` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `netAmount` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `paidCard` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `paidCash` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `paidOnline` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `paidUPI` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `paymentMethod` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `promotionalDiscount` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `receivedAmount` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `roundOff` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the column `taxAmount` on the `pos` table. All the data in the column will be lost.
--   - You are about to drop the `deliverychallan` table. If the table is not empty, all the data it contains will be lost.
--   - You are about to drop the `deliverychallanitems` table. If the table is not empty, all the data it contains will be lost.

-- */
-- -- DropForeignKey
-- ALTER TABLE `deliverychallan` DROP FOREIGN KEY `DeliveryChallan_branchId_fkey`;

-- -- DropForeignKey
-- ALTER TABLE `deliverychallan` DROP FOREIGN KEY `DeliveryChallan_createdById_fkey`;

-- -- DropForeignKey
-- ALTER TABLE `deliverychallan` DROP FOREIGN KEY `DeliveryChallan_customerId_fkey`;

-- -- DropForeignKey
-- ALTER TABLE `deliverychallan` DROP FOREIGN KEY `DeliveryChallan_updatedById_fkey`;

-- -- DropForeignKey
-- ALTER TABLE `deliverychallanitems` DROP FOREIGN KEY `DeliveryChallanItems_colorId_fkey`;

-- -- DropForeignKey
-- ALTER TABLE `deliverychallanitems` DROP FOREIGN KEY `DeliveryChallanItems_deliveryChallanId_fkey`;

-- -- DropForeignKey
-- ALTER TABLE `deliverychallanitems` DROP FOREIGN KEY `DeliveryChallanItems_hsnId_fkey`;

-- -- DropForeignKey
-- ALTER TABLE `deliverychallanitems` DROP FOREIGN KEY `DeliveryChallanItems_itemId_fkey`;

-- -- DropForeignKey
-- ALTER TABLE `deliverychallanitems` DROP FOREIGN KEY `DeliveryChallanItems_sizeId_fkey`;

-- -- DropForeignKey
-- ALTER TABLE `deliverychallanitems` DROP FOREIGN KEY `DeliveryChallanItems_uomId_fkey`;

-- AlterTable
ALTER TABLE `offer` ADD COLUMN `applyToRegular` BOOLEAN NULL DEFAULT false;

-- AlterTable
-- ALTER TABLE `pos` DROP COLUMN `balanceReturn`,
--     DROP COLUMN `discountType`,
--     DROP COLUMN `discountValue`,
--     DROP COLUMN `manualDiscount`,
--     DROP COLUMN `netAmount`,
--     DROP COLUMN `paidCard`,
--     DROP COLUMN `paidCash`,
--     DROP COLUMN `paidOnline`,
--     DROP COLUMN `paidUPI`,
--     DROP COLUMN `paymentMethod`,
--     DROP COLUMN `promotionalDiscount`,
--     DROP COLUMN `receivedAmount`,
--     DROP COLUMN `roundOff`,
--     DROP COLUMN `taxAmount`;

-- -- DropTable
-- DROP TABLE `deliverychallan`;

-- -- DropTable
-- DROP TABLE `deliverychallanitems`;
