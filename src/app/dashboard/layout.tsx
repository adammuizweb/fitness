import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { requireUnbanned } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUnbanned()

  return (
    <>
      <MobileNav />
      <Sidebar />
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </>
  )
}
