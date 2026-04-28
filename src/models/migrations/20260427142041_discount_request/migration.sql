-- AlterTable
ALTER TABLE `pos` ADD COLUMN `approvalStatus` VARCHAR(191) NULL DEFAULT 'NONE',
    ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Pos` ADD CONSTRAINT `Pos_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
