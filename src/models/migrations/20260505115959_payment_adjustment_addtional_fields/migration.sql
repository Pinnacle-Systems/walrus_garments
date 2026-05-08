/*
  Warnings:

  - You are about to drop the column `adjustmentAmt` on the `paymentadjustment` table. All the data in the column will be lost.
  - You are about to drop the column `billRef` on the `paymentadjustment` table. All the data in the column will be lost.
  - You are about to drop the column `newMode` on the `paymentadjustment` table. All the data in the column will be lost.
  - You are about to drop the column `originalAmount` on the `paymentadjustment` table. All the data in the column will be lost.
  - You are about to drop the column `originalMode` on the `paymentadjustment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `paymentadjustment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `paymentadjustment` DROP COLUMN `adjustmentAmt`,
    DROP COLUMN `billRef`,
    DROP COLUMN `newMode`,
    DROP COLUMN `originalAmount`,
    DROP COLUMN `originalMode`,
    DROP COLUMN `status`,
    ADD COLUMN `adjustmentAmount` VARCHAR(191) NULL,
    ADD COLUMN `paymentMode` VARCHAR(191) NULL,
    ADD COLUMN `referenceNumber` VARCHAR(50) NULL,
    ADD COLUMN `userId` INTEGER NULL,
    MODIFY `date` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `PaymentAdjustment` ADD CONSTRAINT `PaymentAdjustment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
