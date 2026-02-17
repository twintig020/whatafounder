import type { DimensionKey } from '@/lib/dimensions'
import { DIMENSION_ORDER } from '@/lib/dimensions'
import type { ArchetypeKey } from '@/lib/archetypes'
import { ARCHETYPES, ARCHETYPE_LIST } from '@/lib/archetypes'
import type { Question } from '@/lib/questions'

export interface RawAnswer {
  questionId: string
  rawValue: string
}

/**
 * Converts a raw answer to a normalised 0-100 score.
 * Returns null for reflection questions (not numerically scored).
 */
export function scoreAnswer(rawValue: string, question: Question): number | null {
  if (question.type === 'reflection') return null

  let numericValue: number
  let scaleMin: number
  let scaleMax: number

  if (question.type === 'likert') {
    numericValue = parseInt(rawValue, 10)
    scaleMin = question.scaleMin ?? 1
    scaleMax = question.scaleMax ?? 7
  } else {
    // forced_choice: 'a' = 1 (high), 'b' = 0 (low)
    numericValue = rawValue === 'a' ? 1 : 0
    scaleMin = 0
    scaleMax = 1
  }

  if (question.reverseScored) {
    numericValue = scaleMax + scaleMin - numericValue
  }

  return Math.round(((numericValue - scaleMin) / (scaleMax - scaleMin)) * 100)
}

/**
 * Calculates per-dimension scores (0-100) from a set of answers + the full question list.
 * Dimensions with no scorable answers default to 50.
 */
export function calculateDimensionScores(
  answers: RawAnswer[],
  questions: Question[],
): Record<DimensionKey, number> {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.rawValue]))
  const buckets: Record<string, number[]> = {}

  for (const q of questions) {
    const raw = answerMap.get(q.id)
    if (!raw) continue
    const score = scoreAnswer(raw, q)
    if (score === null) continue
    if (!buckets[q.dimension]) buckets[q.dimension] = []
    buckets[q.dimension].push(score)
  }

  const result: Record<DimensionKey, number> = {
    clarity: 50,
    resilience: 50,
    velocity: 50,
    empathy: 50,
    vision: 50,
  }

  for (const dim of DIMENSION_ORDER) {
    const bucket = buckets[dim]
    if (bucket && bucket.length > 0) {
      result[dim] = Math.round(bucket.reduce((a, b) => a + b, 0) / bucket.length)
    }
  }

  return result
}

/**
 * Determines archetype by finding which archetype's primary dimensions sum to
 * the highest combined score. Ties broken by first match in ARCHETYPE_LIST.
 */
export function determineArchetype(scores: Record<DimensionKey, number>): ArchetypeKey {
  let best: ArchetypeKey = ARCHETYPE_LIST[0].key
  let bestSum = -1

  for (const archetype of ARCHETYPE_LIST) {
    const sum = archetype.primaryDimensions.reduce((acc, dim) => acc + scores[dim], 0)
    if (sum > bestSum) {
      bestSum = sum
      best = archetype.key
    }
  }

  return best
}

/**
 * Pulls up to 2 reflection answers (≥30 chars) as profile quotes.
 */
export function extractReflectionQuotes(
  answers: RawAnswer[],
  questions: Question[],
): string[] {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.rawValue]))
  const quotes: string[] = []

  for (const q of questions.filter((q) => q.type === 'reflection')) {
    const text = answerMap.get(q.id)
    if (text && text.trim().length >= 30) {
      quotes.push(text.trim())
    }
    if (quotes.length >= 2) break
  }

  return quotes
}
