import type { DimensionKey } from '@/lib/dimensions'

export interface ExtendedReport {
  strengths: string[]
  growthZones: string[]
  cofounderMatch: string
  warnings: string[]
}

const STRENGTH_TEXTS: Record<DimensionKey, string> = {
  clarity:
    'You cut through ambiguity faster than almost anyone. When situations are murky, your ability to identify the signal from the noise is a genuine competitive edge. Teams and investors feel safer with you at the helm because you make the complex look simple.',
  resilience:
    "You absorb hits that would break most people and come back sharper. Your track record of bouncing back isn't luck — it's a deeply trained reflex. This makes you fundable in hard markets and indispensable to your team when things get rough.",
  velocity:
    "You ship. Where others deliberate, you execute. Your ability to move from idea to action at speed is a rare founder trait — one that compounds over time. The startups that win are rarely the ones with the best plan; they're the ones that learn fastest.",
  empathy:
    "You build loyalty without trying. People open up to you, stay longer, and go further because they feel seen by you. This is a hidden moat — it shows up in retention, in co-founder relationships, in early customer love that can't be manufactured.",
  vision:
    "You see around corners. Your ideas land 18 months ahead of the market, which means you're often right too early — but you're right. The founders who change industries aren't the ones who follow trends; they're the ones who spot them before they exist.",
}

const GROWTH_TEXTS: Record<DimensionKey, string> = {
  clarity:
    "Your biggest risk is staying in motion without a clear target. High velocity without clarity creates noise, not progress. The work here: slow down long enough to define the specific problem you're solving and who exactly it's for, before adding more speed.",
  resilience:
    "Setbacks may take longer to process than you'd like. This isn't weakness — but it's worth building your recovery system before you need it. Who do you call when things fall apart? What's your ritual for getting back? Define it now, not in crisis.",
  velocity:
    'Your tendency to over-refine before shipping costs you feedback loops. The gap between your internal quality bar and what the market actually needs is worth examining. Start with a version that embarrasses you slightly — and see what you learn.',
  empathy:
    "You may be underestimating how much team dynamics affect your results. The people issues you brush past don't disappear — they compound. Investing 30 minutes a week in understanding your team's state will return more than most growth tactics.",
  vision:
    "You may be living so far in the future that today's execution suffers. Vision without quarterly milestones is just daydreaming. Your growth edge: translate the big picture into the next 90-day bet, and make that bet with the same conviction you give the long view.",
}

const COFOUNDER_TEXTS: Record<DimensionKey, string> = {
  clarity:
    "Your ideal co-founder is someone who amplifies ideas before filtering them. You provide the decision-making spine; they provide the creative fuel. Look for a Dreamer or Connector archetype — someone whose instinct is to expand possibility, not narrow it.",
  resilience:
    "You need a co-founder who creates stability when you're absorbing a hit. Your ideal partner holds the team's confidence when you're in recovery mode. Look for a Navigator or Architect — someone who keeps executing when the environment gets chaotic.",
  velocity:
    'Slow down with the right partner. Your ideal co-founder is a deliberate thinker who asks "why are we building this?" before "how fast can we ship it?" Look for an Architect or Phoenix — someone who brings depth to balance your speed.',
  empathy:
    "You need a co-founder who makes decisions without needing full consensus. Your ideal partner is comfortable with tension and willing to push through without waiting for everyone to feel good about it. Look for a Navigator or Sprinter archetype.",
  vision:
    "Ground yourself with a builder. Your ideal co-founder is someone who turns your 10-year visions into next-week deliverables. Look for a Sprinter or Architect — someone who's energised by execution and doesn't need the big picture to get started.",
}

const WARNING_PATTERNS: Array<{
  condition: (scores: Record<DimensionKey, number>) => boolean
  text: string
}> = [
  {
    condition: (s) => s.velocity > 75 && s.clarity < 40,
    text: "High velocity without clarity is how startups run fast in the wrong direction. Before your next sprint, spend one hour with a blank page defining your riskiest assumption. Then test that first.",
  },
  {
    condition: (s) => s.vision > 75 && s.resilience < 40,
    text: "Big vision meets low resilience is a fragile combination. You'll face moments where the gap between where you are and where you're going feels crushing. Build your support system now — therapist, coach, or a peer founder group you trust.",
  },
  {
    condition: (s) => s.resilience > 75 && s.empathy < 35,
    text: "You absorb stress well — but your team may not. High personal resilience can mask a culture where people don't feel safe saying they're struggling. Add a weekly check-in where you ask, \"What's hard right now?\" and mean it.",
  },
  {
    condition: (s) => s.clarity > 75 && s.empathy < 35,
    text: 'Strong clarity can tip into impatience with people who process more slowly. The people on your team who seem uncertain or slow may be your most thoughtful contributors — if you give them the space to operate at their pace.',
  },
  {
    condition: (s) => s.empathy > 75 && s.velocity < 40,
    text: 'Deep empathy can create a bias toward consensus — and consensus kills speed. Not every decision needs buy-in. Identify the 20% of decisions that require team alignment, and make the other 80% yourself, quickly.',
  },
]

export function generateExtendedReport(
  scores: Record<DimensionKey, number>,
): ExtendedReport {
  const dims: DimensionKey[] = ['clarity', 'resilience', 'velocity', 'empathy', 'vision']

  const strengths = dims.filter((d) => scores[d] >= 65).map((d) => STRENGTH_TEXTS[d])

  const growthZones = dims.filter((d) => scores[d] < 40).map((d) => GROWTH_TEXTS[d])

  const lowestDim = dims.reduce((a, b) => (scores[a] <= scores[b] ? a : b))
  const cofounderMatch = COFOUNDER_TEXTS[lowestDim]

  const warnings = WARNING_PATTERNS.filter((p) => p.condition(scores)).map((p) => p.text)

  return { strengths, growthZones, cofounderMatch, warnings }
}
