import { describe, it, expect } from "vitest";
import { roomSchema, intField } from "@/lib/server/room-schema";

const valid = {
  slug: "yama",
  title: "Yama",
  category: "Executive Room | Valley/Mountain View",
  description: "A lovely executive room with a view over the valley.",
  capacity: 3,
  size: 400,
  pricePerNight: 12000,
  image: "/images/rooms/yama.jpg",
};

describe("roomSchema", () => {
  it("accepts a valid room", () => {
    expect(roomSchema.parse(valid)).toMatchObject(valid);
  });

  it("rejects remote http(s) image URLs (next/image has no remotePatterns)", () => {
    expect(() =>
      roomSchema.parse({ ...valid, image: "https://cdn.example.com/room.jpg" })
    ).toThrow();
  });

  it("rejects unsafe image values", () => {
    expect(() => roomSchema.parse({ ...valid, image: "javascript:alert(1)" })).toThrow();
    expect(() => roomSchema.parse({ ...valid, image: "data:text/html,x" })).toThrow();
    expect(() => roomSchema.parse({ ...valid, image: "/etc/passwd" })).toThrow();
  });

  it("rejects slugs with illegal characters", () => {
    expect(() => roomSchema.parse({ ...valid, slug: "Bad Slug!" })).toThrow();
    expect(() => roomSchema.parse({ ...valid, slug: "UPPER" })).toThrow();
  });

  it("rejects non-positive prices, sizes and capacities", () => {
    expect(() => roomSchema.parse({ ...valid, pricePerNight: 0 })).toThrow();
    expect(() => roomSchema.parse({ ...valid, pricePerNight: -100 })).toThrow();
    expect(() => roomSchema.parse({ ...valid, capacity: 0 })).toThrow();
    expect(() => roomSchema.parse({ ...valid, size: 5 })).toThrow();
  });

  it("rejects non-integer numeric fields", () => {
    expect(() => roomSchema.parse({ ...valid, capacity: 2.5 })).toThrow();
    expect(() => roomSchema.parse({ ...valid, pricePerNight: 999.5 })).toThrow();
  });

  it("rejects short descriptions", () => {
    expect(() => roomSchema.parse({ ...valid, description: "too short" })).toThrow();
  });

  it("accepts highlights arrays", () => {
    const parsed = roomSchema.parse({ ...valid, highlights: ["Valley view", "Balcony"] });
    expect(parsed.highlights).toEqual(["Valley view", "Balcony"]);
  });
});

describe("intField", () => {
  it("passes integers through", () => {
    expect(intField(5)).toBe(5);
  });

  it("coerces numeric strings (JSON form bodies)", () => {
    expect(intField("5")).toBe(5);
    expect(intField(" 12000 ")).toBe(12000);
  });

  it("returns undefined for junk", () => {
    expect(intField("abc")).toBeUndefined();
    expect(intField(2.5)).toBeUndefined();
    expect(intField(null)).toBeUndefined();
    expect(intField(undefined)).toBeUndefined();
  });

  it("rejects JS coercion notations (hex/octal/binary/exponent/sign)", () => {
    expect(intField("0x10")).toBeUndefined();
    expect(intField("1e3")).toBeUndefined();
    expect(intField("0b101")).toBeUndefined();
    expect(intField("0o17")).toBeUndefined();
    expect(intField("+5")).toBeUndefined();
    expect(intField("-5")).toBeUndefined();
  });
});

describe("roomSchema boundaries", () => {
  it("rejects out-of-range values", () => {
    expect(() => roomSchema.parse({ ...valid, slug: "a" })).toThrow();
    expect(() => roomSchema.parse({ ...valid, slug: "a".repeat(61) })).toThrow();
    expect(() => roomSchema.parse({ ...valid, title: "x".repeat(121) })).toThrow();
    expect(() => roomSchema.parse({ ...valid, category: "x".repeat(61) })).toThrow();
    expect(() => roomSchema.parse({ ...valid, description: "d".repeat(2001) })).toThrow();
    expect(() => roomSchema.parse({ ...valid, capacity: 51 })).toThrow();
    expect(() => roomSchema.parse({ ...valid, size: 9 })).toThrow();
    expect(() =>
      roomSchema.parse({ ...valid, image: "/images/" + "a".repeat(493) })
    ).toThrow();
  });

  it("rejects more than 20 highlights", () => {
    const many = Array.from({ length: 21 }, (_, i) => `Highlight ${i}`);
    expect(() => roomSchema.parse({ ...valid, highlights: many })).toThrow();
  });
});