/**
 * Room block definitions for the 4 accommodation blocks at Vanprastha Resorts.
 * Each block groups individual rooms by their physical building/location.
 */

export interface BlockDefinition {
  /** Database value stored in Room.block */
  id: string;
  /** URL slug used in /rooms/{slug} */
  slug: string;
  /** Display name shown on block cards */
  name: string;
  /** Number of rooms in this block */
  roomCount: number;
  /** Room category/type label */
  category: string;
  /** View type */
  view: string;
  /** Starting price per night in INR */
  startingPrice: number;
  /** Short description for block card */
  description: string;
  /** Image path (placeholder until real images provided) */
  image: string;
}

export const BLOCKS: BlockDefinition[] = [
  {
    id: "ASHTANGA_YOGA",
    slug: "ashtanga-yoga",
    name: "Ashtanga Yoga Block",
    roomCount: 8,
    category: "Executive Rooms",
    view: "Valley/Mountain View",
    startingPrice: 12000,
    description:
      "Eight serene executive rooms inspired by the eight limbs of yoga, each offering panoramic valley and mountain views.",
    image: "/images/rooms/yama.jpg",
  },
  {
    id: "VEDIC",
    slug: "vedic",
    name: "Vedic Block",
    roomCount: 4,
    category: "Executive Rooms",
    view: "Garden View",
    startingPrice: 12000,
    description:
      "Four executive rooms named after the ancient Vedas, with tranquil garden views and twin or double bed configurations.",
    image: "/images/rooms/rigveda.jpg",
  },
  {
    id: "TRIVENI",
    slug: "triveni",
    name: "Triveni Block",
    roomCount: 3,
    category: "Executive Plus & Family Rooms",
    view: "Valley/Mountain View",
    startingPrice: 13000,
    description:
      "Three premium rooms at the confluence of comfort — executive plus doubles and a spacious family suite with valley views.",
    image: "/images/rooms/yamuna.jpg",
  },
  {
    id: "COTTAGE_WITH_ATTIC",
    slug: "cottage-with-attic",
    name: "Cottage with Attic",
    roomCount: 2,
    category: "Cottages",
    view: "Garden View",
    startingPrice: 14000,
    description:
      "Two private cottages with attic space, double beds and garden views — ideal for couples seeking seclusion.",
    image: "/images/rooms/kedarnath.jpg",
  },
];

/** Lookup block by its slug (URL segment). */
export function getBlockBySlug(slug: string): BlockDefinition | undefined {
  return BLOCKS.find((b) => b.slug === slug);
}

/** Lookup block by its database id (Room.block value). */
export function getBlockById(id: string): BlockDefinition | undefined {
  return BLOCKS.find((b) => b.id === id);
}

/** All valid block slugs. */
export const BLOCK_SLUGS = BLOCKS.map((b) => b.slug);
