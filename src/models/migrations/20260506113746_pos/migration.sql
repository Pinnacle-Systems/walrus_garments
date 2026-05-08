-- AlterTable
ALTER TABLE `payment` MODIFY `cvv` DATETIME(3) NULL,
    MODIFY `date` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `pos` ADD COLUMN `isReturn` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `transactionType` VARCHAR(191) NULL;
