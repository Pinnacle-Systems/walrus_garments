-- CreateTable
CREATE TABLE `TermsAndConditionsNew` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `termsAndCondition` VARCHAR(191) NULL,
    `active` BOOLEAN NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
