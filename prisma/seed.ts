import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding crops...");

  const crops = [
    { id: "tomato", nameEn: "Tomato", nameHi: "टमाटर", nameKn: "ಟೊಮೆಟೊ", supportedInV1: true },
    { id: "potato", nameEn: "Potato", nameHi: "आलू", nameKn: "ಆಲೂಗಡ್ಡೆ", supportedInV1: true },
    { id: "rice", nameEn: "Rice", nameHi: "चावल", nameKn: "ಅಕ್ಕಿ", supportedInV1: true },
    { id: "cotton", nameEn: "Cotton", nameHi: "कपास", nameKn: "ಹತ್ತಿ", supportedInV1: true },
    { id: "chili", nameEn: "Chili", nameHi: "मिर्च", nameKn: "ಮೆಣಸಿನಕಾಯಿ", supportedInV1: false },
    { id: "onion", nameEn: "Onion", nameHi: "प्याज", nameKn: "ಈರುಳ್ಳಿ", supportedInV1: false },
  ];

  for (const crop of crops) {
    await prisma.crop.upsert({
      where: { id: crop.id },
      update: crop,
      create: crop,
    });
  }

  console.log(`Seeded ${crops.length} crops.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });