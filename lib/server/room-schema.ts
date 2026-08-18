import { z } from "zod";

/**
 * Single validation source for rooms, shared by admin create/update routes.
 * Mirrors the Prisma schema (Int fields, slug unique) and adds display-safe
 * constraints (positive prices, http(s)/local image paths).
 */
export const roomSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens."),
  title: z.string().min(2).max(120),
  category: z.string().min(2).max(60),
  description: z.string().min(10).max(2000),
  capacity: z.number().int().min(1).max(50),
  size: z.number().int().min(10),
  pricePerNight: z.number().int().min(1),
  image: z
    .string()
    .min(1)
    .max(500)
    .refine(
      // Local paths only: next/image has no remotePatterns configured, so
      // external URLs would break rendering (and add tracking third parties).
      (v) => v.startsWith("/images/"),
      "Image must be a local path under /images/."
    ),
  highlights: z.array(z.string().min(1).max(200)).max(20).optional(),
  isActive: z.boolean().optional(),
});

export type RoomInput = z.infer<typeof roomSchema>;

/** Parses a numeric field from JSON body values (which arrive as strings). */
export const intField = (v: unknown) => {
  if (typeof v === "number" && Number.isInteger(v)) return v;
  // Strict decimal digits ONLY — Number() would silently coerce hex
  // ("0x10" -> 16), exponent ("1e3" -> 1000) and other notations.
  if (typeof v === "string" && /^\d+$/.test(v.trim())) {
    return Number(v);
  }
  return undefined;
};