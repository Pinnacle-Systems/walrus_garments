-- AlterTable
ALTER TABLE `poitems` MODIFY `discountType` ENUM('Flat', 'Percentage') NULL DEFAULT 'Flat';
