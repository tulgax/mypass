import { ExploreHeader } from '@/components/explore/ExploreHeader'

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ExploreHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
