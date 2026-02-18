import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DISCOUNT_TOKEN_TTL_HOURS } from '@/lib/constants'
import { QUESTIONS } from '@/lib/questions'
import { DIMENSION_ORDER } from '@/lib/dimensions'
import {
  calculateDimensionScores,
  determineArchetype,
  extractReflectionQuotes,
  type RawAnswer,
} from '@/lib/scoring'
import { generateExtendedReport } from '@/lib/templates'

function nanoid(len = 8) {
  return Math.random().toString(36).slice(2, 2 + len)
}

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { answers, consentDataStorage, consentAiProcessing } = (await request.json()) as {
    answers: Array<{ questionId: string; rawValue: string; day: 1 | 2 | 3 }>
    consentDataStorage: boolean
    consentAiProcessing: boolean
  }

  if (!answers?.length || !consentDataStorage) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Idempotency guard: if profile already exists, return early
  const { data: existingProfile } = await admin
    .from('founder_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingProfile) {
    return NextResponse.json({ ok: true, redirect: '/profile' })
  }

  // Save all answers in one insert
  const answerRecords = answers.map((a) => ({
    user_id: user.id,
    question_id: a.questionId,
    day: a.day,
    raw_value: a.rawValue,
  }))

  const { error: insertAnswersError } = await admin.from('answers').insert(answerRecords)
  if (insertAnswersError) {
    return NextResponse.json({ error: insertAnswersError.message }, { status: 500 })
  }

  // Save consent
  await admin.from('user_consents').insert({
    user_id: user.id,
    data_storage: true,
    ai_processing: consentAiProcessing,
  })

  // Run scoring pipeline
  const rawAnswers: RawAnswer[] = answers.map((a) => ({
    questionId: a.questionId,
    rawValue: a.rawValue,
  }))

  const dimensionScores = calculateDimensionScores(rawAnswers, QUESTIONS)
  const archetypeKey = determineArchetype(dimensionScores)
  const quotes = extractReflectionQuotes(rawAnswers, QUESTIONS)
  const extendedReport = generateExtendedReport(dimensionScores)

  // Write per-dimension score rows
  const scoreRows = DIMENSION_ORDER.map((dim) => ({
    user_id: user.id,
    dimension: dim,
    score: dimensionScores[dim],
  }))
  await admin.from('dimension_scores').insert(scoreRows)

  // Write founder_profile
  await admin.from('founder_profiles').insert({
    user_id: user.id,
    archetype_key: archetypeKey,
    dimension_scores: dimensionScores as unknown as Record<string, number>,
    reflection_quotes: quotes,
    extended_report: extendedReport as unknown as Record<string, unknown>,
    share_code: nanoid(8),
  })

  // Mark survey complete on user row
  const today = new Date().toISOString().slice(0, 10)
  await admin
    .from('users')
    .update({ current_day: 3, last_session_date: today, onboarding_completed: true })
    .eq('id', user.id)

  // Generate discount token
  const discountToken = nanoid(16)
  const discountExpiry = new Date(
    Date.now() + DISCOUNT_TOKEN_TTL_HOURS * 60 * 60 * 1000,
  ).toISOString()
  await admin
    .from('users')
    .update({ discount_token: discountToken, discount_token_expires_at: discountExpiry })
    .eq('id', user.id)

  return NextResponse.json({ ok: true, redirect: '/profile' })
}
