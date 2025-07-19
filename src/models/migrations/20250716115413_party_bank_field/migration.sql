-- AlterTable
ALTER TABLE `party` ADD COLUMN `accountnumber` VARCHAR(191) NULL,
    ADD COLUMN `bankName` VARCHAR(191) NULL,
    ADD COLUMN `branchName` VARCHAR(191) NULL,
    ADD COLUMN `ifsccode` VARCHAR(191) NULL;
