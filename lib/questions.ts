import type { DimensionKey } from '@/lib/dimensions'

export type QuestionType = 'likert' | 'forced_choice' | 'reflection'

export interface Question {
  id: string
  day: 1 | 2 | 3
  orderIndex: number
  type: QuestionType
  dimension: DimensionKey
  text: string
  contextText?: string
  // Likert
  scaleMin?: number
  scaleMax?: number
  reverseScored?: boolean
  // Forced choice
  optionA?: string
  optionB?: string
}

// 12 questions — 4 per day
// Day 1: clarity (likert), resilience (likert), velocity (forced_choice), reflection
// Day 2: empathy (likert), vision (likert), resilience (forced_choice), reflection
// Day 3: velocity (likert), clarity (forced_choice), vision (likert), reflection
export const QUESTIONS: Question[] = [
  // ─── Day 1 ────────────────────────────────────────────────────────────────
  {
    id: 'q1_clarity_likert',
    day: 1,
    orderIndex: 0,
    type: 'likert',
    dimension: 'clarity',
    text: 'When facing an ambiguous situation, I quickly identify the core issue and know where to focus.',
    contextText: 'Think about your last complex decision.',
    scaleMin: 1,
    scaleMax: 7,
    reverseScored: false,
  },
  {
    id: 'q2_resilience_likert',
    day: 1,
    orderIndex: 1,
    type: 'likert',
    dimension: 'resilience',
    text: 'After a significant setback, I bounce back to full productivity within a reasonable time.',
    contextText: 'Recall the last time something major went wrong.',
    scaleMin: 1,
    scaleMax: 7,
    reverseScored: false,
  },
  {
    id: 'q3_velocity_choice',
    day: 1,
    orderIndex: 2,
    type: 'forced_choice',
    dimension: 'velocity',
    text: 'Which describes you more honestly?',
    optionA: 'I ship something imperfect and learn from real feedback.',
    optionB: 'I refine until it feels ready, then release with confidence.',
  },
  {
    id: 'q4_day1_reflection',
    day: 1,
    orderIndex: 3,
    type: 'reflection',
    dimension: 'clarity',
    text: 'Describe a moment when you had to make a fast decision with incomplete information. What did you do?',
    contextText: 'Be specific — the more detail, the more accurate your profile.',
  },

  // ─── Day 2 ────────────────────────────────────────────────────────────────
  {
    id: 'q5_empathy_likert',
    day: 2,
    orderIndex: 0,
    type: 'likert',
    dimension: 'empathy',
    text: 'I notice shifts in a team member\'s mood or engagement before they say anything.',
    contextText: 'Consider your last few weeks working with people.',
    scaleMin: 1,
    scaleMax: 7,
    reverseScored: false,
  },
  {
    id: 'q6_vision_likert',
    day: 2,
    orderIndex: 1,
    type: 'likert',
    dimension: 'vision',
    text: 'I regularly think about where my market will be in 5–10 years, not just the next quarter.',
    scaleMin: 1,
    scaleMax: 7,
    reverseScored: false,
  },
  {
    id: 'q7_resilience_choice',
    day: 2,
    orderIndex: 2,
    type: 'forced_choice',
    dimension: 'resilience',
    text: 'When a fundraise falls through or a key hire declines, your first instinct is to:',
    optionA: 'Regroup fast, adjust the strategy, and keep moving the same week.',
    optionB: 'Take time to fully process it before deciding the next move.',
  },
  {
    id: 'q8_day2_reflection',
    day: 2,
    orderIndex: 3,
    type: 'reflection',
    dimension: 'empathy',
    text: 'Tell me about a time you helped someone on your team through a difficult period. What did you notice, and what did you do?',
    contextText: 'Reflect honestly — even small moments count.',
  },

  // ─── Day 3 ────────────────────────────────────────────────────────────────
  {
    id: 'q9_velocity_likert',
    day: 3,
    orderIndex: 0,
    type: 'likert',
    dimension: 'velocity',
    text: 'I am comfortable making a significant commitment (time, money, team) before all the details are confirmed.',
    contextText: 'Think about how you approach big bets.',
    scaleMin: 1,
    scaleMax: 5,
    reverseScored: false,
  },
  {
    id: 'q10_clarity_choice',
    day: 3,
    orderIndex: 1,
    type: 'forced_choice',
    dimension: 'clarity',
    text: 'Your co-founder proposes a pivot. Your gut says no, but the data is mixed. You:',
    optionA: 'Trust your read of the situation and push back clearly.',
    optionB: 'Run more experiments before taking a strong position.',
  },
  {
    id: 'q11_vision_likert',
    day: 3,
    orderIndex: 2,
    type: 'likert',
    dimension: 'vision',
    text: 'People often describe my ideas as ambitious or ahead of the curve.',
    scaleMin: 1,
    scaleMax: 7,
    reverseScored: false,
  },
  {
    id: 'q12_day3_reflection',
    day: 3,
    orderIndex: 3,
    type: 'reflection',
    dimension: 'vision',
    text: 'What\'s a future you believe in that most people in your space still dismiss or underestimate?',
    contextText: 'Don\'t hedge — say what you actually think.',
  },
]

export function getQuestionsForDay(day: 1 | 2 | 3): Question[] {
  return QUESTIONS.filter((q) => q.day === day).sort(
    (a, b) => a.orderIndex - b.orderIndex
  )
}
