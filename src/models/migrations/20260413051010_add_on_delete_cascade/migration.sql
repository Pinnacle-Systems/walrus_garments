-- DropForeignKey
ALTER TABLE `offerrule` DROP FOREIGN KEY `OfferRule_offerId_fkey`;

-- DropForeignKey
ALTER TABLE `offerscope` DROP FOREIGN KEY `OfferScope_offerId_fkey`;

-- AddForeignKey
ALTER TABLE `OfferScope` ADD CONSTRAINT `OfferScope_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `Offer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OfferRule` ADD CONSTRAINT `OfferRule_offerId_fkey` FOREIGN KEY (`offerId`) REFERENCES `Offer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
