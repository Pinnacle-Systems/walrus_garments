INSERT INTO `stock` (
  `itemType`,
  `inOrOut`,
  `itemId`,
  `itemCode`,
  `sizeId`,
  `colorId`,
  `uomId`,
  `qty`,
  `price`,
  `storeId`,
  `branchId`,
  `sectionId`,
  `createdAt`,
  `accessoryInwardItemsId`,
  `transactionId`,
  `supplierId`,
  `category`,
  `field1`,
  `field2`,
  `field3`,
  `field4`,
  `field5`,
  `field6`,
  `field7`,
  `field8`,
  `field9`,
  `field10`,
  `barcode`
)
SELECT
  NULL AS `itemType`,
  ls.`inOrOut`,
  ls.`itemId`,
  NULL AS `itemCode`,
  ls.`sizeId`,
  ls.`colorId`,
  ls.`uomId`,
  ls.`qty`,
  ls.`price`,
  ls.`storeId`,
  ls.`branchId`,
  NULL AS `sectionId`,
  ls.`createdAt`,
  NULL AS `accessoryInwardItemsId`,
  ls.`transactionId`,
  NULL AS `supplierId`,
  NULL AS `category`,
  NULL AS `field1`,
  NULL AS `field2`,
  NULL AS `field3`,
  NULL AS `field4`,
  NULL AS `field5`,
  NULL AS `field6`,
  NULL AS `field7`,
  NULL AS `field8`,
  NULL AS `field9`,
  NULL AS `field10`,
  ls.`barcode`
FROM `legacystock` ls
LEFT JOIN `stock` s
  ON s.`inOrOut` <=> ls.`inOrOut`
  AND s.`itemId` <=> ls.`itemId`
  AND s.`sizeId` <=> ls.`sizeId`
  AND s.`colorId` <=> ls.`colorId`
  AND s.`uomId` <=> ls.`uomId`
  AND s.`qty` <=> ls.`qty`
  AND s.`price` <=> ls.`price`
  AND s.`storeId` <=> ls.`storeId`
  AND s.`branchId` <=> ls.`branchId`
  AND s.`transactionId` <=> ls.`transactionId`
  AND s.`createdAt` <=> ls.`createdAt`
  AND s.`barcode` <=> ls.`barcode`
WHERE s.`id` IS NULL;
