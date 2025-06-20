-- AlterTable
ALTER TABLE `poitems` MODIFY `discountType` ENUM('Flat', 'Percentage') NULL,
    MODIFY `discountValue` DOUBLE NULL DEFAULT 0;
