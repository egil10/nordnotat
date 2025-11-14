import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, TrendingUp, Sparkles, ShoppingBag } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NordNotes
          </Link>
          <nav className="flex gap-4">
            <Link href="/marketplace">
              <Button variant="ghost">Marketplace</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign Up</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            Your Nordic Study Companion
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Buy and sell study notes, track your GPA, and use AI-powered tools to excel in your studies.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/marketplace">
              <Button size="lg">Browse Marketplace</Button>
            </Link>
            <Link href="/auth/register">
              <Button size="lg" variant="outline">Get Started</Button>
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <ShoppingBag className="w-8 h-8 mb-2" />
              <CardTitle>Notes Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Buy and sell high-quality study notes from students across Scandinavia.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="w-8 h-8 mb-2" />
              <CardTitle>GPA Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track your grades and visualize your academic progress with detailed analytics.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="w-8 h-8 mb-2" />
              <CardTitle>AI Study Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Generate flashcards, summaries, and study guides powered by AI.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BookOpen className="w-8 h-8 mb-2" />
              <CardTitle>Course Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Compare courses, view difficulty ratings, and make informed decisions.
              </CardDescription>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 NordNotes. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

