export default function BrandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {children}
    </div>
  )
}
