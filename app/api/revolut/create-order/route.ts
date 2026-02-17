// TODO: REVOLUT — replace mock with real Revolut Merchant API call
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BASE_PATH, PRICES } from '@/lib/constants'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { discountToken } = (await request.json().catch(() => ({}))) as {
    discountToken?: string
  }

  let priceUsed: number = PRICES.full

  // Validate discount token if provided
  if (discountToken) {
    const admin = createAdminClient()
    const { data: userData } = await admin
      .from('users')
      .select('discount_token, discount_token_expires_at')
      .eq('id', user.id)
      .maybeSingle()

    if (
      userData?.discount_token === discountToken &&
      userData?.discount_token_expires_at &&
      new Date(userData.discount_token_expires_at) > new Date()
    ) {
      priceUsed = PRICES.discounted
    }
  }

  // TODO: REVOLUT — create real order via POST https://merchant.revolut.com/api/orders
  // For now: mock checkout that immediately marks as purchased
  const admin = createAdminClient()
  await admin.from('users').update({ has_purchased: true }).eq('id', user.id)

  const checkoutUrl = `${BASE_PATH}/profile?purchased=true&price=${priceUsed}`

  return NextResponse.json({ checkout_url: checkoutUrl })
}
