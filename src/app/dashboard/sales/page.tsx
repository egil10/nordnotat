"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@/lib/supabase"
import { Purchase, Document } from "@/types"
import { formatPrice, formatDate } from "@/lib/utils"
import { ArrowLeft } from "lucide-react"

export default function SalesPage() {
  const [sales, setSales] = useState<(Purchase & { document: Document })[]>([])
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadSales() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get all documents by this user
      const { data: documents } = await supabase
        .from("documents")
        .select("id")
        .eq("user_id", user.id)

      if (!documents || documents.length === 0) {
        setIsLoading(false)
        return
      }

      const documentIds = documents.map((d) => d.id)

      // Get purchases for these documents
      const { data, error } = await supabase
        .from("purchases")
        .select("*, document:documents(*)")
        .in("document_id", documentIds)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading sales:", error)
      } else {
        const salesData = (data || []) as (Purchase & { document: Document })[]
        setSales(salesData)
        const total = salesData.reduce((sum, sale) => sum + sale.seller_amount, 0)
        setTotalEarnings(total)
      }
      setIsLoading(false)
    }

    loadSales()
  }, [router, supabase])

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            NordNotes
          </Link>
          <nav className="flex gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost">Marketplace</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Sales</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPrice(totalEarnings)}</p>
          </CardContent>
        </Card>

        {isLoading ? (
          <p>Loading...</p>
        ) : sales.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No sales yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your sales will appear here once someone purchases your documents.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <Card key={sale.id}>
                <CardHeader>
                  <CardTitle>{(sale.document as Document).title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Sold on {formatDate(sale.created_at)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Platform fee: {formatPrice(sale.platform_fee)}
                      </p>
                    </div>
                    <p className="text-xl font-bold">
                      {formatPrice(sale.seller_amount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

