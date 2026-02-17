import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { BASE_PATH } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? `${BASE_PATH}/today`

  if (!code) {
    return NextResponse.redirect(new URL(`${BASE_PATH}/`, request.url))
  }

  const supabase = createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(new URL(`${BASE_PATH}/?error=auth`, request.url))
  }

  // Check if user needs onboarding
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle()

    if (!userData?.onboarding_completed) {
      return NextResponse.redirect(new URL(`${BASE_PATH}/onboarding`, request.url))
    }
  }

  return NextResponse.redirect(new URL(next, request.url))
}
