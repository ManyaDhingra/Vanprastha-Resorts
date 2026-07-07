import { AdminSidebar } from '@/components/admin/sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-10">
        <AdminSidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
