"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@/lib/supabase"
import { Profile } from "@/types"
import { Upload, ShoppingBag, TrendingUp, FileText } from "lucide-react"

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error loading profile:", error)
      } else {
        setProfile(data)
      }
      setIsLoading(false)
    }

    loadProfile()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NordNotes
          </Link>
          <nav className="flex gap-4">
            <Link href="/marketplace">
              <Button variant="ghost">Marketplace</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          Welcome back, {profile?.full_name || "User"}!
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/upload">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Upload className="w-8 h-8 mb-2" />
                <CardTitle>Upload Document</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Upload a new document to the marketplace</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/uploads">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <FileText className="w-8 h-8 mb-2" />
                <CardTitle>My Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>View and manage your uploaded documents</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/sales">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <ShoppingBag className="w-8 h-8 mb-2" />
                <CardTitle>Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>View your sales and earnings</CardDescription>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/analytics">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <TrendingUp className="w-8 h-8 mb-2" />
                <CardTitle>Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>View GPA and course analytics</CardDescription>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}

