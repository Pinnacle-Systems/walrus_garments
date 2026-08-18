/*
  Warnings:

  - A unique constraint covering the columns `[saleType]` on the table `ItemSequence` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ItemSequence_saleType_key` ON `ItemSequence`(`saleType`);
