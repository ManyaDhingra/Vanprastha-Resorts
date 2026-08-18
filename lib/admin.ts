import { NextRequest } from "next/server";
import { verifyToken } from "./auth";

export function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  const decoded = verifyToken(token);

  if (decoded.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  return decoded;
}