-- AlterTable
ALTER TABLE `pos` ADD COLUMN `isBillClosed` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `isExchangeBillId` INTEGER NULL;
