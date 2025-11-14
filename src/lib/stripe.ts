import Stripe from 'stripe'

// Only initialize Stripe if the secret key is available
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

const PLATFORM_FEE_PERCENTAGE = 0.10 // 10%
const SELLER_PERCENTAGE = 0.90 // 90%

export function calculateFees(amount: number) {
  const platformFee = Math.round(amount * PLATFORM_FEE_PERCENTAGE)
  const sellerAmount = amount - platformFee
  return {
    platformFee,
    sellerAmount,
  }
}

export async function createCheckoutSession(
  documentId: string,
  amount: number,
  buyerId: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.')
  }

  const { platformFee, sellerAmount } = calculateFees(amount)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'nok',
          product_data: {
            name: 'Document Purchase',
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      documentId,
      buyerId,
      platformFee: platformFee.toString(),
      sellerAmount: sellerAmount.toString(),
    },
  })

  return session
}

// Placeholder for future Vipps integration
export async function createVippsPayment(
  documentId: string,
  amount: number,
  buyerId: string
) {
  // TODO: Implement Vipps PSP integration
  throw new Error('Vipps integration not yet implemented')
}

