-- CreateTable
CREATE TABLE `OrderAccessoryDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accessoryTemplateId` INTEGER NULL,
    `accessoryId` INTEGER NULL,
    `accessoryCategoryId` INTEGER NULL,
    `accessoryGroupId` INTEGER NULL,
    `colorId` INTEGER NULL,
    `sizeId` INTEGER NULL,
    `active` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrderAccessoryDetails` ADD CONSTRAINT `OrderAccessoryDetails_accessoryTemplateId_fkey` FOREIGN KEY (`accessoryTemplateId`) REFERENCES `AccessoryTemplate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderAccessoryDetails` ADD CONSTRAINT `OrderAccessoryDetails_accessoryId_fkey` FOREIGN KEY (`accessoryId`) REFERENCES `Accessory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderAccessoryDetails` ADD CONSTRAINT `OrderAccessoryDetails_accessoryCategoryId_fkey` FOREIGN KEY (`accessoryCategoryId`) REFERENCES `AccessoryCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderAccessoryDetails` ADD CONSTRAINT `OrderAccessoryDetails_accessoryGroupId_fkey` FOREIGN KEY (`accessoryGroupId`) REFERENCES `AccessoryGroup`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderAccessoryDetails` ADD CONSTRAINT `OrderAccessoryDetails_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderAccessoryDetails` ADD CONSTRAINT `OrderAccessoryDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
