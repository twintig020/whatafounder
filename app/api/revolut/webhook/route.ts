// TODO: REVOLUT — validate webhook signature using Revolut's public key
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // TODO: REVOLUT — verify webhook signature header:
  // const signature = request.headers.get('revolut-signature')
  // Verify using Revolut's public key before trusting payload

  console.log('[Revolut webhook]', JSON.stringify(payload))

  // TODO: REVOLUT — parse event type and handle accordingly
  // Example: if event.type === 'ORDER_COMPLETED', mark user as purchased
  // const event = payload as { type: string; order: { merchant_order_ext_ref: string } }
  // if (event.type === 'ORDER_COMPLETED') {
  //   await admin.from('users').update({ has_purchased: true }).eq('id', userId)
  // }

  const admin = createAdminClient()
  void admin // suppress unused warning

  return NextResponse.json({ received: true })
}
