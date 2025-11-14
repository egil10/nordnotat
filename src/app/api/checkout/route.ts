import { NextRequest, NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const { documentId, amount, buyerId } = await request.json()

    // Get user from cookies
    const cookieStore = await cookies()
    const supabaseClient = createServerClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // No-op for API routes - cookies are read-only here
          },
          remove(name: string, options: any) {
            // No-op for API routes
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user || user.id !== buyerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify document exists
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Check if user already purchased this document
    const { data: existingPurchase } = await supabase
      .from("purchases")
      .select("*")
      .eq("buyer_id", buyerId)
      .eq("document_id", documentId)
      .single()

    if (existingPurchase) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const session = await createCheckoutSession(
      documentId,
      amount,
      buyerId,
      `${baseUrl}/marketplace/${documentId}?success=true`,
      `${baseUrl}/marketplace/${documentId}?canceled=true`
    )

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 })
  }
}

