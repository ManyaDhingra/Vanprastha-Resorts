import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

type SeedRoom = {
  slug: string;
  title: string;
  category: string;
  block: string;
  description: string;
  capacity: number;
  size: number;
  pricePerNight: number;
  image: string;
  highlights: string[];
};

const HIGHLIGHTS: Record<string, string[]> = {
  "Executive Room | Valley/Mountain View": [
    "Valley and mountain views",
    "Premium 400 sq ft interiors",
    "Complimentary morning yoga",
    "Attached private balcony",
  ],
  "Executive Room | Garden View": [
    "Serene garden views",
    "Calm twin-sharing layout",
    "Complimentary morning yoga",
    "Direct garden access",
  ],
  "Executive Plus Room | Valley/Mountain View": [
    "Valley and mountain views",
    "Spacious 550 sq ft layout",
    "Complimentary morning yoga",
    "Premium plus amenities",
  ],
  "Family Room": [
    "Spacious 850 sq ft family suite",
    "Four comfortable beds",
    "Ideal for family retreats",
    "Valley-facing windows",
  ],
  "Cottage with Garden View": [
    "Private cottage with attic",
    "Garden view with direct access",
    "Cozy double-bed setup",
    "Peaceful, secluded setting",
  ],
};

const ROOMS: SeedRoom[] = [
  // ASHTANGA YOGA BLOCK
  { slug: "yama", title: "Yama", category: "Executive Room | Valley/Mountain View", block: "ASHTANGA_YOGA", description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.", capacity: 3, size: 400, pricePerNight: 12000, image: "/images/rooms/yama.jpg", highlights: [] },
  { slug: "niyama", title: "Niyama", category: "Executive Room | Valley/Mountain View", block: "ASHTANGA_YOGA", description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.", capacity: 3, size: 400, pricePerNight: 12000, image: "/images/rooms/niyama.jpg", highlights: [] },
  { slug: "asana", title: "Asana", category: "Executive Room | Valley/Mountain View", block: "ASHTANGA_YOGA", description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.", capacity: 3, size: 400, pricePerNight: 12000, image: "/images/rooms/asana.jpg", highlights: [] },
  { slug: "pranayama", title: "Pranayama", category: "Executive Room | Valley/Mountain View", block: "ASHTANGA_YOGA", description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.", capacity: 3, size: 400, pricePerNight: 12000, image: "/images/rooms/pranayama.jpg", highlights: [] },
  { slug: "pratyahara", title: "Pratyahara", category: "Executive Room | Valley/Mountain View", block: "ASHTANGA_YOGA", description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.", capacity: 3, size: 400, pricePerNight: 12000, image: "/images/rooms/pratyahara.jpg", highlights: [] },
  { slug: "dharna", title: "Dharna", category: "Executive Room | Valley/Mountain View", block: "ASHTANGA_YOGA", description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.", capacity: 3, size: 400, pricePerNight: 12000, image: "/images/rooms/dharna.jpg", highlights: [] },
  { slug: "dhyana", title: "Dhyana", category: "Executive Room | Valley/Mountain View", block: "ASHTANGA_YOGA", description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.", capacity: 3, size: 400, pricePerNight: 12000, image: "/images/rooms/dhyana.jpg", highlights: [] },
  { slug: "samadhi", title: "Samadhi", category: "Executive Room | Valley/Mountain View", block: "ASHTANGA_YOGA", description: "Ashtanga Yoga Block - Executive Room with Valley/Mountain View.", capacity: 3, size: 400, pricePerNight: 12000, image: "/images/rooms/samadhi.jpg", highlights: [] },

  // VEDIC BLOCK
  { slug: "rigveda", title: "Rigveda", category: "Executive Room | Garden View", block: "VEDIC", description: "Vedic Block - Twin Sharing (2 Single Beds).", capacity: 2, size: 400, pricePerNight: 12000, image: "/images/rooms/rigveda.jpg", highlights: [] },
  { slug: "yajurveda", title: "Yajurveda", category: "Executive Room | Garden View", block: "VEDIC", description: "Vedic Block - Twin Sharing (2 Single Beds).", capacity: 2, size: 400, pricePerNight: 12000, image: "/images/rooms/yajurveda.jpg", highlights: [] },
  { slug: "samaveda", title: "Samaveda", category: "Executive Room | Garden View", block: "VEDIC", description: "Vedic Block - Double Bed with provision for one extra bed.", capacity: 3, size: 450, pricePerNight: 12000, image: "/images/rooms/samaveda.jpg", highlights: [] },
  { slug: "atharvaveda", title: "Atharvaveda", category: "Executive Room | Garden View", block: "VEDIC", description: "Vedic Block - Double Bed with provision for one extra bed.", capacity: 3, size: 450, pricePerNight: 12000, image: "/images/rooms/atharvaveda.jpg", highlights: [] },

  // TRIVENI BLOCK
  { slug: "ganga", title: "Ganga", category: "Family Room", block: "TRIVENI", description: "Triveni Block - 4 Single Beds.", capacity: 4, size: 850, pricePerNight: 18000, image: "/images/rooms/ganga.jpg", highlights: [] },
  { slug: "yamuna", title: "Yamuna", category: "Executive Plus Room | Valley/Mountain View", block: "TRIVENI", description: "Triveni Block - Twin Sharing (2 Single Beds).", capacity: 2, size: 550, pricePerNight: 13000, image: "/images/rooms/yamuna.jpg", highlights: [] },
  { slug: "saraswati", title: "Saraswati", category: "Executive Plus Room | Valley/Mountain View", block: "TRIVENI", description: "Triveni Block - Twin Sharing (2 Single Beds).", capacity: 2, size: 550, pricePerNight: 13000, image: "/images/rooms/saraswati.jpg", highlights: [] },

  // COTTAGE WITH ATTIC
  { slug: "kedarnath", title: "Kedarnath", category: "Cottage with Garden View", block: "COTTAGE_WITH_ATTIC", description: "Cottage with attic. One Double Bed with one mattress in attic.", capacity: 3, size: 600, pricePerNight: 14000, image: "/images/rooms/kedarnath.jpg", highlights: [] },
  { slug: "badrinath", title: "Badrinath", category: "Cottage with Garden View", block: "COTTAGE_WITH_ATTIC", description: "Cottage with attic. One Double Bed with one mattress in attic.", capacity: 3, size: 600, pricePerNight: 14000, image: "/images/rooms/badrinath.jpg", highlights: [] },
];

async function seedRooms() {
  for (const room of ROOMS) {
    const highlights =
      room.highlights.length > 0 ? room.highlights : (HIGHLIGHTS[room.category] ?? []);
    const data = { ...room, highlights };
    await prisma.room.upsert({
      where: { slug: room.slug },
      update: data,
      create: data,
    });
  }
  console.log(`✅ Seeded/updated ${ROOMS.length} rooms`);
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@vanprastha.com").toLowerCase();

  // Never rotate credentials on re-seed: a production re-run would silently
  // change the live admin password and lock the ops team out. Role is
  // enforced; the password of an existing admin stays untouched (rotate it
  // deliberately instead).
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });
    console.log(
      `✅ Admin exists: ${email} (role ensured; password NOT rotated by re-seed)`
    );
    return;
  }

  // C1: no default credential. The old hardcoded default ("VanprasthaAdmin2026!")
  // was repo-known and exploitable; refusing to seed without a real password
  // makes the failure loud instead of shipping a backdoor.
  const KNOWN_DEFAULT = "VanprasthaAdmin2026!";
  const password = process.env.ADMIN_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error(
      "ADMIN_PASSWORD must be set to at least 12 characters before seeding. Refusing to create an admin with a weak password."
    );
  }
  if (password === KNOWN_DEFAULT) {
    throw new Error(
      "ADMIN_PASSWORD must not be the known default credential (" +
        KNOWN_DEFAULT +
        "). Rotate it before seeding."
    );
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: "Vanprastha Admin",
      email,
      password: hashed,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user created: ${email} (role: ADMIN)`);
}

async function main() {
  await seedRooms();
  await seedAdmin();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
