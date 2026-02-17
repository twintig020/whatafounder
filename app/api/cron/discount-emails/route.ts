// TODO: RESEND — replace console.log with real email send via Resend API
// Intended to run daily via Vercel Cron: schedule "0 9 * * *"
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { BASE_PATH, PRICES, DISCOUNT_TOKEN_TTL_HOURS } from '@/lib/constants'

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Find users who completed Day 3 and have a discount token that hasn't been sent yet
  // (discount_token set but has_purchased = false)
  const { data: eligible } = await admin
    .from('users')
    .select('id, email, discount_token, discount_token_expires_at')
    .eq('current_day', 3)
    .eq('has_purchased', false)
    .not('discount_token', 'is', null)

  if (!eligible?.length) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0
  for (const u of eligible) {
    if (!u.discount_token || !u.discount_token_expires_at) continue

    const expires = new Date(u.discount_token_expires_at)
    if (expires < new Date()) continue // token expired

    const offerUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:3000${BASE_PATH}`}/profile?offer=discount&token=${u.discount_token}`

    // TODO: RESEND — replace with:
    // await resend.emails.send({
    //   from: 'What a Founder <noreply@whatafounder.com>',
    //   to: u.email,
    //   subject: 'Your founder profile is waiting — 50% off today only',
    //   html: `<p>Unlock your full Extended Report for €${PRICES.discounted}:<br><a href="${offerUrl}">${offerUrl}</a></p>`,
    // })
    console.log(
      `[discount-email] to=${u.email} price=€${PRICES.discounted} ttl=${DISCOUNT_TOKEN_TTL_HOURS}h url=${offerUrl}`,
    )
    sent++
  }

  return NextResponse.json({ sent })
}
