import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/server/prisma";
import { verifyToken } from "@/lib/server/auth";
import { TOKEN_COOKIE } from "@/lib/utils";
import { AdminSidebar } from "@/components/admin/sidebar";

/**
 * Admin area gate (C2 fix). The Edge middleware only checks cookie presence
 * (no JWT_SECRET at the edge); this layout runs on the Node runtime where
 * the secret exists, so it performs the real verification and re-checks the
 * role against the DB — the same authority model the admin APIs use.
 * Unauthenticated or non-admin visitors are redirected away.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  let isAdmin = false;
  if (token) {
    try {
      const decoded = verifyToken(token);
      if (decoded.role === "ADMIN") {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { role: true },
        });
        // DB role re-check: a demoted admin is locked out immediately, not
        // at token expiry.
        isAdmin = user?.role === "ADMIN";
      }
    } catch {
      isAdmin = false;
    }
  }

  if (!isAdmin) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}