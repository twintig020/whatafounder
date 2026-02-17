export type DimensionKey = 'clarity' | 'resilience' | 'velocity' | 'empathy' | 'vision'

export interface Dimension {
  key: DimensionKey
  name: string
  emoji: string
  color: string        // Tailwind bg class
  textColor: string    // Tailwind text class
  borderColor: string  // Tailwind border class
  description: string
}

export const DIMENSIONS: Record<DimensionKey, Dimension> = {
  clarity: {
    key: 'clarity',
    name: 'Clarity',
    emoji: '🎯',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-400',
    description: 'How clearly you define problems, decisions, and direction.',
  },
  resilience: {
    key: 'resilience',
    name: 'Resilience',
    emoji: '🔥',
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-400',
    description: 'How you absorb setbacks, maintain momentum, and recover.',
  },
  velocity: {
    key: 'velocity',
    name: 'Velocity',
    emoji: '⚡',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-400',
    description: 'How quickly you move from idea to action and decision.',
  },
  empathy: {
    key: 'empathy',
    name: 'Empathy',
    emoji: '🤝',
    color: 'bg-pink-500',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-400',
    description: 'How deeply you sense, understand, and respond to others.',
  },
  vision: {
    key: 'vision',
    name: 'Vision',
    emoji: '🔭',
    color: 'bg-violet-500',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-400',
    description: 'How far and boldly you project future possibilities.',
  },
}

export const DIMENSION_ORDER: DimensionKey[] = [
  'clarity',
  'resilience',
  'velocity',
  'empathy',
  'vision',
]
