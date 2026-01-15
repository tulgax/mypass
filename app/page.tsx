import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">MyPass</h1>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto flex flex-col items-center justify-center gap-8 px-4 py-24 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Scheduling software for fitness studios
        </h2>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Start taking bookings in under 30 minutes. Made for studios and trainers who want simple
          setup without the headaches.
        </p>
        <div className="flex gap-4">
          <Link href="/auth/signup">
            <Button size="lg">Start free trial</Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" size="lg">
              Learn more
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/50 py-24">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">Your booking page with class schedule</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Easy Setup</CardTitle>
                <CardDescription>
                  Create your studio profile and start taking bookings in minutes
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Online & Offline Classes</CardTitle>
                <CardDescription>
                  Support both online classes with Zoom links and offline classes with QR check-in
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment Integration</CardTitle>
                <CardDescription>
                  Accept payments through Mongolian payment gateways
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t py-24">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 text-3xl font-bold">Ready to get started?</h3>
          <p className="text-muted-foreground mb-8 text-lg">
            Join fitness studios using MyPass to manage their bookings
          </p>
          <Link href="/auth/signup">
            <Button size="lg">Start free trial</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 MyPass. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
