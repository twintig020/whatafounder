import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(_request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  // Delete all user data in dependency order
  await admin.from('referrals').delete().eq('referrer_user_id', user.id)
  await admin.from('founder_profiles').delete().eq('user_id', user.id)
  await admin.from('dimension_scores').delete().eq('user_id', user.id)
  await admin.from('answers').delete().eq('user_id', user.id)
  await admin.from('user_consents').delete().eq('user_id', user.id)
  await admin.from('users').delete().eq('id', user.id)

  // Delete the auth user
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
