/*
  Warnings:

  - You are about to drop the column `billingAddress` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `customer` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `deliveryDate` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNo` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `shippingAddress` on the `order` table. All the data in the column will be lost.
  - You are about to drop the `orderdetailssubgrid` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contactPersonName` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `orderdetailssubgrid` DROP FOREIGN KEY `OrderDetailsSubGrid_orderDetailsId_fkey`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `billingAddress`,
    DROP COLUMN `customer`,
    DROP COLUMN `deliveryDate`,
    DROP COLUMN `phoneNo`,
    DROP COLUMN `shippingAddress`,
    ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `address` LONGTEXT NULL,
    ADD COLUMN `companyId` INTEGER NULL,
    ADD COLUMN `contactPersonName` VARCHAR(191) NOT NULL,
    ADD COLUMN `finYearId` INTEGER NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `validDate` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `orderdetails` ADD COLUMN `description` LONGTEXT NULL,
    ADD COLUMN `fiberContentId` INTEGER NULL,
    ADD COLUMN `footcolorId` INTEGER NULL,
    ADD COLUMN `legcolorId` INTEGER NULL,
    ADD COLUMN `machineId` INTEGER NULL,
    ADD COLUMN `measurements` VARCHAR(191) NULL,
    ADD COLUMN `noOfStripes` VARCHAR(191) NULL,
    ADD COLUMN `qty` DOUBLE NULL,
    ADD COLUMN `sizeId` INTEGER NULL,
    ADD COLUMN `socksMaterialId` INTEGER NULL,
    ADD COLUMN `socksTypeId` INTEGER NULL,
    ADD COLUMN `stripecolorId` INTEGER NULL,
    ADD COLUMN `styleId` INTEGER NULL,
    ADD COLUMN `yarnNeedleId` INTEGER NULL;

-- DropTable
DROP TABLE `orderdetailssubgrid`;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_finYearId_fkey` FOREIGN KEY (`finYearId`) REFERENCES `FinYear`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_yarnNeedleId_fkey` FOREIGN KEY (`yarnNeedleId`) REFERENCES `YarnNeedle`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_machineId_fkey` FOREIGN KEY (`machineId`) REFERENCES `Machine`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_fiberContentId_fkey` FOREIGN KEY (`fiberContentId`) REFERENCES `FiberContent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_socksMaterialId_fkey` FOREIGN KEY (`socksMaterialId`) REFERENCES `SocksMaterial`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_sizeId_fkey` FOREIGN KEY (`sizeId`) REFERENCES `Size`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_styleId_fkey` FOREIGN KEY (`styleId`) REFERENCES `Style`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_legcolorId_fkey` FOREIGN KEY (`legcolorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_footcolorId_fkey` FOREIGN KEY (`footcolorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_stripecolorId_fkey` FOREIGN KEY (`stripecolorId`) REFERENCES `Color`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderDetails` ADD CONSTRAINT `OrderDetails_socksTypeId_fkey` FOREIGN KEY (`socksTypeId`) REFERENCES `SocksType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
