import type { DimensionKey } from '@/lib/dimensions'

export type ArchetypeKey =
  | 'the_navigator'
  | 'the_phoenix'
  | 'the_sprinter'
  | 'the_connector'
  | 'the_dreamer'
  | 'the_architect'

export interface Archetype {
  key: ArchetypeKey
  name: string
  emoji: string
  tagline: string
  primaryDimensions: [DimensionKey, DimensionKey]
  slug: string // for /types/[slug]
  description: string
  color: string // Tailwind gradient class for card
}

export const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  the_navigator: {
    key: 'the_navigator',
    name: 'The Navigator',
    emoji: '🧭',
    tagline: 'Crystal-clear decisions, steady under pressure.',
    primaryDimensions: ['clarity', 'resilience'],
    slug: 'the-navigator',
    description:
      'You cut through noise to find the signal. When everyone else is overwhelmed, you already have a plan. Your superpower is making hard decisions look easy.',
    color: 'from-indigo-500 to-amber-500',
  },
  the_phoenix: {
    key: 'the_phoenix',
    name: 'The Phoenix',
    emoji: '🦅',
    tagline: 'Falls seven times, rises eight.',
    primaryDimensions: ['resilience', 'vision'],
    slug: 'the-phoenix',
    description:
      "Setbacks are your fuel. You emerge from every failure stronger and with a clearer sense of where you're going. Investors bet on resilience — and you have it in spades.",
    color: 'from-amber-500 to-violet-500',
  },
  the_sprinter: {
    key: 'the_sprinter',
    name: 'The Sprinter',
    emoji: '⚡',
    tagline: 'Ships before others finish planning.',
    primaryDimensions: ['velocity', 'clarity'],
    slug: 'the-sprinter',
    description:
      'Speed is your moat. You ship, learn, iterate — while competitors are still in meetings. You turn ambiguity into momentum before most founders have finished their coffee.',
    color: 'from-emerald-500 to-indigo-500',
  },
  the_connector: {
    key: 'the_connector',
    name: 'The Connector',
    emoji: '🕸️',
    tagline: 'Builds teams that build companies.',
    primaryDimensions: ['empathy', 'vision'],
    slug: 'the-connector',
    description:
      "You don't just understand people — you attract and galvanize them. Great teams form around you naturally, because you make people feel seen, heard, and part of something larger.",
    color: 'from-pink-500 to-violet-500',
  },
  the_dreamer: {
    key: 'the_dreamer',
    name: 'The Dreamer',
    emoji: '🌌',
    tagline: "Sees the world that doesn't exist yet.",
    primaryDimensions: ['vision', 'empathy'],
    slug: 'the-dreamer',
    description:
      "You operate ten years ahead of the market. The most ambitious ideas don't scare you — they excite you. When others see risk, you see the only path worth taking.",
    color: 'from-violet-500 to-pink-500',
  },
  the_architect: {
    key: 'the_architect',
    name: 'The Architect',
    emoji: '🏛️',
    tagline: 'Builds systems that outlast their creator.',
    primaryDimensions: ['clarity', 'velocity'],
    slug: 'the-architect',
    description:
      'You think in systems, not tasks. Every process you design scales 10x without breaking. The infrastructure you build today is the competitive moat of tomorrow.',
    color: 'from-indigo-500 to-emerald-500',
  },
}

export const ARCHETYPE_LIST = Object.values(ARCHETYPES)
