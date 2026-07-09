import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.room.createMany({
    data: [
      {
        slug: "yama",
        title: "Yama",
        category: "Standard",
        description: "A peaceful room designed for rest and relaxation.",
        capacity: 2,
        size: 35,
        pricePerNight: 10000,
        image: "/images/yama.jpg",
      },
      {
        slug: "niyama",
        title: "Niyama",
        category: "Deluxe",
        description: "A spacious room with elegant interiors and garden views.",
        capacity: 2,
        size: 40,
        pricePerNight: 10000,
        image: "/images/niyama.jpg",
      },
      {
        slug: "asana",
        title: "Asana",
        category: "Premium",
        description: "Comfortable accommodation with modern amenities.",
        capacity: 3,
        size: 45,
        pricePerNight: 10000,
        image: "/images/asana.jpg",
      },
      {
        slug: "pranayama",
        title: "Pranayama",
        category: "Luxury",
        description: "Luxury room with scenic surroundings and premium facilities.",
        capacity: 4,
        size: 55,
        pricePerNight: 10000,
        image: "/images/pranayama.jpg",
      },
    ],

    skipDuplicates: true,
  });

  console.log("✅ Rooms seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });