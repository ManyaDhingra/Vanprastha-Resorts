import jwt from "jsonwebtoken";

type AuthTokenPayload = {
  id: string;
  email: string;
  role: string;
};

export function signAuthToken(user: AuthTokenPayload) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    {
      expiresIn: "7d",
    }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string;
    email: string;
    role: string;
  };
}