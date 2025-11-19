-- AlterTable
ALTER TABLE `materialissueitems` ADD COLUMN `raiseIndentItemsId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `MaterialIssueItems` ADD CONSTRAINT `MaterialIssueItems_raiseIndentItemsId_fkey` FOREIGN KEY (`raiseIndentItemsId`) REFERENCES `RaiseIndentItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
