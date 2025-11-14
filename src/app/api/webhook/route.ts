import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { calculateFees } from "@/lib/stripe"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { platformFee, sellerAmount } = calculateFees(session.amount_total)

    // Save purchase to database
    await supabase.from("purchases").insert({
      buyer_id: session.metadata.buyerId,
      document_id: session.metadata.documentId,
      payment_id: session.payment_intent,
      amount: session.amount_total,
      platform_fee: platformFee,
      seller_amount: sellerAmount,
    })
  }

  return NextResponse.json({ received: true })
}

