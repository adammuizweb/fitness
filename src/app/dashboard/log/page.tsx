import { LogPageClient } from './LogPageClient'
import { Breadcrumb } from '@/components/ui/breadcrumb'

export default function LogPage() {
  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Log', href: '/dashboard/log' },
        { label: 'Hari Ini' },
      ]} />
      <LogPageClient />
    </div>
  )
}
