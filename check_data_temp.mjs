import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
  try {
    const sdCount = await prisma.salesDelivery.count();
    const ledgerCount = await prisma.ledger.count();
    const paymentCount = await prisma.payment.count();

    console.log(`Total SalesDelivery records: ${sdCount}`);
    console.log(`Total Ledger records: ${ledgerCount}`);
    console.log(`Total Payment records: ${paymentCount}`);

    // Check if there are parties with SalesDelivery but no Ledger entries
    const partiesWithSD = await prisma.$queryRaw`
      SELECT customerId, COUNT(*) as count 
      FROM SalesDelivery 
      WHERE isDeleted = 0 
      GROUP BY customerId
    `;

    const partiesWithLedger = await prisma.$queryRaw`
      SELECT partyId, COUNT(*) as count 
      FROM Ledger 
      GROUP BY partyId
    `;

    console.log("\nParties with SalesDelivery:", partiesWithSD.length);
    console.log("Parties with Ledger entries:", partiesWithLedger.length);

    // Sample check for a party
    if (partiesWithSD.length > 0) {
      const samplePartyId = partiesWithSD[0].customerId;
      console.log(`\nChecking sample party ID: ${samplePartyId}`);
      
      const sdTotal = await prisma.$queryRaw`
        SELECT SUM(COALESCE(sdi.deliveryQty, 0) * COALESCE(sdi.price, 0)) as total
        FROM SalesDelivery sd
        JOIN SalesDeliveryItems sdi ON sd.id = sdi.salesDeliveryId
        WHERE sd.customerId = ${samplePartyId} AND sd.isDeleted = 0
      `;
      
      const ledgerTotal = await prisma.$queryRaw`
        SELECT SUM(amount) as total
        FROM Ledger
        WHERE partyId = ${samplePartyId} AND creditOrDebit = 'Debit'
      `;
      
      console.log(`SalesDelivery Sum: ${sdTotal[0].total}`);
      console.log(`Ledger Debit Sum: ${ledgerTotal[0].total}`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
