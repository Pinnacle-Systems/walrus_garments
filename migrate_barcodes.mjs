import { prisma } from "./src/lib/prisma.js";

async function migrateBarcodes() {
  console.log("Starting barcode migration...");

  try {
    const priceLists = await prisma.itemPriceList.findMany({
      where: {
        barcode: { not: null, not: "" },
      },
      include: {
        ItemBarcodes: true
      }
    });

    console.log(`Found ${priceLists.length} price list items with barcodes.`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const pl of priceLists) {
      const exists = pl.ItemBarcodes.some(b => b.barcode === pl.barcode);

      if (!exists) {
        await prisma.itemBarcode.create({
          data: {
            itemPriceListId: pl.id,
            barcode: pl.barcode,
            barcodeType: "REGULAR",
            active: true
          }
        });
        migratedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log(`Migration complete.`);
    console.log(`Migrated: ${migratedCount}`);
    console.log(`Skipped (already exists): ${skippedCount}`);
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

migrateBarcodes()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
