-- AlterTable
ALTER TABLE `pos` ADD COLUMN `offerPenalty` VARCHAR(191) NULL,
    ADD COLUMN `offerRestored` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `positems` ADD COLUMN `appliedOfferName` VARCHAR(191) NULL,
    ADD COLUMN `offerReapplied` VARCHAR(191) NULL,
    ADD COLUMN `offerReversal` VARCHAR(191) NULL;
