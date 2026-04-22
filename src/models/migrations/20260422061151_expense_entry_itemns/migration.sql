-- CreateTable
CREATE TABLE `ExpenseEntryItems` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `expenseId` INTEGER NULL,
    `description` VARCHAR(191) NULL,
    `amount` VARCHAR(191) NULL,
    `paymentMethod` VARCHAR(191) NULL,
    `referenceNo` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ExpenseEntryItems` ADD CONSTRAINT `ExpenseEntryItems_expenseId_fkey` FOREIGN KEY (`expenseId`) REFERENCES `Expense`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
