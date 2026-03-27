ALTER TABLE `ItemControlPanel`
    ADD COLUMN `barcodeGenerationMethod` VARCHAR(191) NOT NULL DEFAULT 'STANDARD';

UPDATE `ItemControlPanel`
SET `barcodeGenerationMethod` = CASE
    WHEN `size_color_wise` = true THEN 'SIZE_COLOR'
    WHEN `sizeWise` = true THEN 'SIZE'
    ELSE 'STANDARD'
END;

ALTER TABLE `ItemControlPanel`
    DROP COLUMN `sizeWise`,
    DROP COLUMN `size_color_wise`;

ALTER TABLE `Item`
    DROP COLUMN `priceMethod`;
