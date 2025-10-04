-- AlterTable
ALTER TABLE `excesstolerance` ADD COLUMN `material` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `excesstoleranceitems` ADD COLUMN `material` VARCHAR(191) NULL,
    ADD COLUMN `materialId` INTEGER NULL;
