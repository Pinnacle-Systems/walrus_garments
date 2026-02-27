/*
  Warnings:

  - You are about to drop the column `accessoryGroupId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `accessoryId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `accessoryItemId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `designId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `fDiaId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `fabricId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `gaugeId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `gsmId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `kDiaId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `loopLengthId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `orderDetailsId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `requirementPlanningItemsId` on the `stock` table. All the data in the column will be lost.
  - You are about to drop the column `yarnId` on the `stock` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_accessoryGroupId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_accessoryId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_accessoryItemId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_designId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_fDiaId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_fabricId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_gaugeId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_gsmId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_kDiaId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_loopLengthId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_orderDetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_orderId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_requirementPlanningItemsId_fkey`;

-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_yarnId_fkey`;

-- AlterTable
ALTER TABLE `party` ADD COLUMN `parentId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `stock` DROP COLUMN `accessoryGroupId`,
    DROP COLUMN `accessoryId`,
    DROP COLUMN `accessoryItemId`,
    DROP COLUMN `designId`,
    DROP COLUMN `fDiaId`,
    DROP COLUMN `fabricId`,
    DROP COLUMN `gaugeId`,
    DROP COLUMN `gsmId`,
    DROP COLUMN `kDiaId`,
    DROP COLUMN `loopLengthId`,
    DROP COLUMN `orderDetailsId`,
    DROP COLUMN `orderId`,
    DROP COLUMN `requirementPlanningItemsId`,
    DROP COLUMN `yarnId`;
