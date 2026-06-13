import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const offers = await prisma.offer.findMany({
    include: {
      OfferScope: true,
      OfferRule: true,
      OfferTier: true
    }
  });
  console.log("ALL OFFERS IN DB:", JSON.stringify(offers, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
