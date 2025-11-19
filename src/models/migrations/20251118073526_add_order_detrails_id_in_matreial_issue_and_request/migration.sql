/*
  Warnings:

  - You are about to drop the column `orderdetailsId` on the `materialissueitems` table. All the data in the column will be lost.
  - You are about to drop the column `orderdetailsId` on the `raiseindentitems` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `materialissueitems` DROP FOREIGN KEY `MaterialIssueItems_orderdetailsId_fkey`;

-- DropForeignKey
ALTER TABLE `raiseindentitems` DROP FOREIGN KEY `RaiseIndentItems_orderdetailsId_fkey`;

-- AlterTable
ALTER TABLE `materialissueitems` DROP COLUMN `orderdetailsId`,
    ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AlterTable
ALTER TABLE `raiseindentitems` DROP COLUMN `orderdetailsId`,
    ADD COLUMN `orderDetailsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `RaiseIndentItems` ADD CONSTRAINT `RaiseIndentItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_orderDetailsId_fkey` FOREIGN KEY (`orderDetailsId`) REFERENCES `OrderDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
