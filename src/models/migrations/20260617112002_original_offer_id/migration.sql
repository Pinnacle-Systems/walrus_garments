-- AlterTable
ALTER TABLE `positems` ADD COLUMN `appliedOfferId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `PosItems` ADD CONSTRAINT `PosItems_appliedOfferId_fkey` FOREIGN KEY (`appliedOfferId`) REFERENCES `Offer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
