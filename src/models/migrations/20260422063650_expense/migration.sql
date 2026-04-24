/*
  Warnings:

  - You are about to drop the column `amount` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `expenseCategoryId` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `expense` table. All the data in the column will be lost.
  - You are about to drop the column `referenceNo` on the `expense` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `expense` DROP FOREIGN KEY `Expense_expenseCategoryId_fkey`;

-- AlterTable
ALTER TABLE `expense` DROP COLUMN `amount`,
    DROP COLUMN `description`,
    DROP COLUMN `expenseCategoryId`,
    DROP COLUMN `paymentMethod`,
    DROP COLUMN `referenceNo`;

-- AlterTable
ALTER TABLE `expenseentryitems` ADD COLUMN `expenseCategoryId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ExpenseEntryItems` ADD CONSTRAINT `ExpenseEntryItems_expenseCategoryId_fkey` FOREIGN KEY (`expenseCategoryId`) REFERENCES `ExpenseCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
