/*
  Warnings:

  - You are about to drop the column `paidCard` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `paidCash` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `paidOnline` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `paidUPI` on the `pos` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `pos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `pos` DROP COLUMN `paidCard`,
    DROP COLUMN `paidCash`,
    DROP COLUMN `paidOnline`,
    DROP COLUMN `paidUPI`,
    DROP COLUMN `paymentMethod`,
    ADD COLUMN `availableCredit` INTEGER NULL,
    ADD COLUMN `cancelReason` VARCHAR(191) NULL,
    ADD COLUMN `isCancel` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `isRetrunBillId` INTEGER NULL;
