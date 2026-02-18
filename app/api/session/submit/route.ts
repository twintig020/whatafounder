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

  const { answers, day } = (await request.json()) as {
    answers: { questionId: string; rawValue: string }[]
    day: number
  }

  if (!answers?.length || !day || day < 1 || day > 3) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)
  const admin = createAdminClient()

  // Prevent double-submit
  const { data: userData } = await admin
    .from('users')
    .select('last_session_date, current_day')
    .eq('id', user.id)
    .maybeSingle()

  if (userData?.last_session_date === today) {
    return NextResponse.json({ error: 'Already submitted today' }, { status: 409 })
  }

  // Save answers
  const answerRecords = answers.map((a) => ({
    user_id: user.id,
    question_id: a.questionId,
    day,
    raw_value: a.rawValue,
  }))

  const { error: insertError } = await admin.from('answers').insert(answerRecords)
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Mark day complete
  await admin
    .from('users')
    .update({ current_day: day, last_session_date: today })
    .eq('id', user.id)

  let redirectPath = `/today?completed=true&nextDay=${day + 1}`

  // On day 3: score everything and generate profile
  if (day === 3) {
    const { data: allAnswerRows } = await admin
      .from('answers')
      .select('question_id, raw_value')
      .eq('user_id', user.id)

    if (allAnswerRows) {
      const rawAnswers: RawAnswer[] = allAnswerRows.map((a) => ({
        questionId: a.question_id,
        rawValue: a.raw_value,
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

      // Write founder_profile with extended report
      await admin.from('founder_profiles').insert({
        user_id: user.id,
        archetype_key: archetypeKey,
        dimension_scores: dimensionScores as unknown as Record<string, number>,
        reflection_quotes: quotes,
        extended_report: extendedReport as unknown as Record<string, unknown>,
        share_code: nanoid(8),
      })

      // Generate discount token valid for DISCOUNT_TOKEN_TTL_HOURS hours (for Day 4 email)
      const discountToken = nanoid(16)
      const discountExpiry = new Date(
        Date.now() + DISCOUNT_TOKEN_TTL_HOURS * 60 * 60 * 1000,
      ).toISOString()
      await admin
        .from('users')
        .update({ discount_token: discountToken, discount_token_expires_at: discountExpiry })
        .eq('id', user.id)
    }

    redirectPath = '/profile'
  }

  return NextResponse.json({ ok: true, redirect: redirectPath })
}
