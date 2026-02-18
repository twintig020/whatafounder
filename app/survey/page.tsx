import type { Metadata } from 'next'
import { QUESTIONS } from '@/lib/questions'
import SurveyFlow from './SurveyFlow'

export const metadata: Metadata = {
  title: 'Discover your founder archetype',
  description: '12 questions. One brutally honest founder profile.',
}

export default function SurveyPage() {
  return <SurveyFlow questions={QUESTIONS} />
}
