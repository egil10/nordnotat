"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PDFPreview } from "@/components/PDFPreview"
import { createClientComponentClient } from "@/lib/supabase"
import { Document, Profile } from "@/types"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft, Star, BookOpen, User } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export default function DocumentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadDocument() {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error || !data) {
        console.error("Error loading document:", error)
        router.push("/marketplace")
        return
      }

      setDocument(data)

      // Load seller profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user_id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      setIsLoading(false)
    }

    if (params.id) {
      loadDocument()
    }
  }, [params.id, router, supabase])

  const handlePurchase = async () => {
    if (!document) return

    setIsPurchasing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          documentId: document.id,
          amount: document.price,
          buyerId: user.id,
        }),
      })

      const { sessionId } = await response.json()

      const stripe = await stripePromise
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
    } finally {
      setIsPurchasing(false)
    }
  }

  if (isLoading || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const fileUrl = supabase.storage.from("documents").getPublicUrl(document.file_path).data.publicUrl

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
        <div className="flex items-center gap-4 mb-8">
          <Link href="/marketplace">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{document.title}</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PDFPreview fileUrl={fileUrl} title={document.title} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{formatPrice(document.price)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing}
                  className="w-full"
                  size="lg"
                >
                  {isPurchasing ? "Processing..." : "Buy Document"}
                </Button>

                <div className="space-y-2">
                  {document.course_code && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{document.course_code}</span>
                    </div>
                  )}
                  {document.difficulty && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Difficulty: {document.difficulty}/5</span>
                    </div>
                  )}
                  {document.university && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{document.university}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {document.summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{document.summary}</p>
                </CardContent>
              </Card>
            )}

            {document.tags && document.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle>Seller</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{profile.full_name || "Anonymous"}</span>
                  </div>
                  {profile.university && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {profile.university}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

