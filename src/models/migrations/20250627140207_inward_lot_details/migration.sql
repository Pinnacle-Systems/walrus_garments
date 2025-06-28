-- AlterTable
ALTER TABLE `stock` ADD COLUMN `inwardLotDetailsId` INTEGER NULL;

-- CreateTable
CREATE TABLE `InwardLotDetails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `directItemsId` INTEGER NOT NULL,
    `lotNo` VARCHAR(191) NULL,
    `qty` DOUBLE NULL,
    `noOfRolls` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_inwardLotDetailsId_fkey` FOREIGN KEY (`inwardLotDetailsId`) REFERENCES `InwardLotDetails`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InwardLotDetails` ADD CONSTRAINT `InwardLotDetails_directItemsId_fkey` FOREIGN KEY (`directItemsId`) REFERENCES `DirectItems`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
