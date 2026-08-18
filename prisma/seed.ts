import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.room.createMany({
    data: [
      // =========================
      // ASHTANGA YOGA BLOCK
      // =========================
      {
        slug: "yama",
        title: "Yama",
        category: "Executive Room | Valley/Mountain View",
        description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.",
        capacity: 3,
        size: 400,
        pricePerNight: 12000,
        image: "/images/rooms/yama.jpg",
      },
      {
        slug: "niyama",
        title: "Niyama",
        category: "Executive Room | Valley/Mountain View",
        description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.",
        capacity: 3,
        size: 400,
        pricePerNight: 12000,
        image: "/images/rooms/niyama.jpg",
      },
      {
        slug: "asana",
        title: "Asana",
        category: "Executive Room | Valley/Mountain View",
        description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.",
        capacity: 3,
        size: 400,
        pricePerNight: 12000,
        image: "/images/rooms/asana.jpg",
      },
      {
        slug: "pranayama",
        title: "Pranayama",
        category: "Executive Room | Valley/Mountain View",
        description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.",
        capacity: 3,
        size: 400,
        pricePerNight: 12000,
        image: "/images/rooms/pranayama.jpg",
      },
      {
        slug: "pratyahara",
        title: "Pratyahara",
        category: "Executive Room | Valley/Mountain View",
        description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.",
        capacity: 3,
        size: 400,
        pricePerNight: 12000,
        image: "/images/rooms/pratyahara.jpg",
      },
      {
        slug: "dharna",
        title: "Dharna",
        category: "Executive Room | Valley/Mountain View",
        description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.",
        capacity: 3,
        size: 400,
        pricePerNight: 12000,
        image: "/images/rooms/dharna.jpg",
      },
      {
        slug: "dhyana",
        title: "Dhyana",
        category: "Executive Room | Valley/Mountain View",
        description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.",
        capacity: 3,
        size: 400,
        pricePerNight: 12000,
        image: "/images/rooms/dhyana.jpg",
      },
      {
        slug: "samadhi",
        title: "Samadhi",
        category: "Executive Room | Valley/Mountain View",
        description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.",
        capacity: 3,
        size: 400,
        pricePerNight: 12000,
        image: "/images/rooms/samadhi.jpg",
      },

      // =========================
      // VEDIC BLOCK
      // =========================
      {
        slug: "rigveda",
        title: "Rigveda",
        category: "Executive Room | Garden View",
        description: "Vedic Block - Twin Sharing (2 Single Beds).",
        capacity: 2,
        size: 400,
        pricePerNight: 12000,
        image: "/images/rooms/rigveda.jpg",
      },
      {
        slug: "yajurveda",
        title: "Yajurveda",
        category: "Executive Room | Garden View",
        description: "Vedic Block - Twin Sharing (2 Single Beds).",
        capacity: 2,
        size: 400,
        pricePerNight: 12000,
        image: "/images/rooms/yajurveda.jpg",
      },
      {
        slug: "samaveda",
        title: "Samaveda",
        category: "Executive Room | Garden View",
        description: "Vedic Block - Double Bed with provision for one extra bed.",
        capacity: 3,
        size: 450,
        pricePerNight: 12000,
        image: "/images/rooms/samaveda.jpg",
      },
      {
        slug: "atharvaveda",
        title: "Atharvaveda",
        category: "Executive Room | Garden View",
        description: "Vedic Block - Double Bed with provision for one extra bed.",
        capacity: 3,
        size: 450,
        pricePerNight: 12000,
        image: "/images/rooms/atharvaveda.jpg",
      },

      // =========================
      // TRIVENI BLOCK
      // =========================
      {
        slug: "ganga",
        title: "Ganga",
        category: "Family Room",
        description: "Triveni Block - 4 Single Beds.",
        capacity: 4,
        size: 850,
        pricePerNight: 18000,
        image: "/images/rooms/ganga.jpg",
      },
      {
        slug: "yamuna",
        title: "Yamuna",
        category: "Executive Plus Room | Valley/Mountain View",
        description: "Triveni Block - Twin Sharing (2 Single Beds).",
        capacity: 2,
        size: 550,
        pricePerNight: 13000,
        image: "/images/rooms/yamuna.jpg",
      },
      {
        slug: "saraswati",
        title: "Saraswati",
        category: "Executive Plus Room | Valley/Mountain View",
        description: "Triveni Block - Twin Sharing (2 Single Beds).",
        capacity: 2,
        size: 550,
        pricePerNight: 13000,
        image: "/images/rooms/saraswati.jpg",
      },

      // =========================
      // COTTAGES
      // =========================
      {
        slug: "kedarnath",
        title: "Kedarnath",
        category: "Cottage with Garden View",
        description: "Cottage with attic. One Double Bed with one mattress in attic.",
        capacity: 3,
        size: 600,
        pricePerNight: 14000,
        image: "/images/rooms/kedarnath.jpg",
      },
      {
        slug: "badrinath",
        title: "Badrinath",
        category: "Cottage with Garden View",
        description: "Cottage with attic. One Double Bed with one mattress in attic.",
        capacity: 3,
        size: 600,
        pricePerNight: 14000,
        image: "/images/rooms/badrinath.jpg",
      },
    ],

    skipDuplicates: true,
  });

  console.log("✅ All Vanprastha rooms seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });