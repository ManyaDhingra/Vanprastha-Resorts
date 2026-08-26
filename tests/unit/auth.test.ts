import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";
import { signAuthToken, verifyToken } from "@/lib/server/auth";
import { HttpError } from "@/lib/server/errors";

const SECRET = "test-secret-0123456789abcdef0123456789abcdef";

describe("auth tokens", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = SECRET;
  });

  it("roundtrips sign -> verify", () => {
    const token = signAuthToken({ id: "user-1", email: "a@b.co", role: "USER" });
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("user-1");
    expect(decoded.email).toBe("a@b.co");
    expect(decoded.role).toBe("USER");
  });

  it("rejects a tampered signature", () => {
    const token = signAuthToken({ id: "user-1", email: "a@b.co", role: "USER" });
    const [h, p, s] = token.split(".");
    const tampered = `${h}.${p}.${s.slice(0, -2)}xx`;
    expect(() => verifyToken(tampered)).toThrow(HttpError);
  });

  it("rejects garbage input", () => {
    expect(() => verifyToken("garbage")).toThrow(HttpError);
    expect(() => verifyToken("a.b")).toThrow(HttpError);
  });

  it("rejects tokens signed with a different secret", () => {
    const foreign = jwt.sign(
      { userId: "user-1" },
      "another-secret-0123456789abcdef0123456789abcd",
      { algorithm: "HS256", expiresIn: "1h" }
    );
    expect(() => verifyToken(foreign)).toThrow(HttpError);
  });

  it("rejects expired tokens", async () => {
    const token = jwt.sign({ userId: "user-1" }, SECRET, {
      algorithm: "HS256",
      expiresIn: "1ms",
    });
    await new Promise((r) => setTimeout(r, 25));
    expect(() => verifyToken(token)).toThrow(/expired/i);
  });

  it("requires a strong JWT_SECRET at first use", () => {
    const prev = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "short";
    try {
      expect(() => signAuthToken({ id: "u", email: "e", role: "USER" })).toThrow(
        /JWT_SECRET/
      );
    } finally {
      process.env.JWT_SECRET = prev;
    }
  });
});