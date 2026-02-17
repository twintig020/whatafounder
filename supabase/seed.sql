-- What a Founder — Seed: 12 questions (4 per day)
-- Run AFTER schema.sql

insert into public.questions
  (id, day, order_index, type, dimension, text, context_text, option_a, option_b, scale_min, scale_max, reverse_scored)
values
  -- ─── Day 1 ─────────────────────────────────────────────────────────────
  (
    'q1_clarity_likert', 1, 0, 'likert', 'clarity',
    'When facing an ambiguous situation, I quickly identify the core issue and know where to focus.',
    'Think about your last complex decision.',
    null, null, 1, 7, false
  ),
  (
    'q2_resilience_likert', 1, 1, 'likert', 'resilience',
    'After a significant setback, I bounce back to full productivity within a reasonable time.',
    'Recall the last time something major went wrong.',
    null, null, 1, 7, false
  ),
  (
    'q3_velocity_choice', 1, 2, 'forced_choice', 'velocity',
    'Which describes you more honestly?',
    null,
    'I ship something imperfect and learn from real feedback.',
    'I refine until it feels ready, then release with confidence.',
    null, null, false
  ),
  (
    'q4_day1_reflection', 1, 3, 'reflection', 'clarity',
    'Describe a moment when you had to make a fast decision with incomplete information. What did you do?',
    'Be specific — the more detail, the more accurate your profile.',
    null, null, null, null, false
  ),

  -- ─── Day 2 ─────────────────────────────────────────────────────────────
  (
    'q5_empathy_likert', 2, 0, 'likert', 'empathy',
    'I notice shifts in a team member''s mood or engagement before they say anything.',
    'Consider your last few weeks working with people.',
    null, null, 1, 7, false
  ),
  (
    'q6_vision_likert', 2, 1, 'likert', 'vision',
    'I regularly think about where my market will be in 5–10 years, not just the next quarter.',
    null,
    null, null, 1, 7, false
  ),
  (
    'q7_resilience_choice', 2, 2, 'forced_choice', 'resilience',
    'When a fundraise falls through or a key hire declines, your first instinct is to:',
    null,
    'Regroup fast, adjust the strategy, and keep moving the same week.',
    'Take time to fully process it before deciding the next move.',
    null, null, false
  ),
  (
    'q8_day2_reflection', 2, 3, 'reflection', 'empathy',
    'Tell me about a time you helped someone on your team through a difficult period. What did you notice, and what did you do?',
    'Reflect honestly — even small moments count.',
    null, null, null, null, false
  ),

  -- ─── Day 3 ─────────────────────────────────────────────────────────────
  (
    'q9_velocity_likert', 3, 0, 'likert', 'velocity',
    'I am comfortable making a significant commitment (time, money, team) before all the details are confirmed.',
    'Think about how you approach big bets.',
    null, null, 1, 5, false
  ),
  (
    'q10_clarity_choice', 3, 1, 'forced_choice', 'clarity',
    'Your co-founder proposes a pivot. Your gut says no, but the data is mixed. You:',
    null,
    'Trust your read of the situation and push back clearly.',
    'Run more experiments before taking a strong position.',
    null, null, false
  ),
  (
    'q11_vision_likert', 3, 2, 'likert', 'vision',
    'People often describe my ideas as ambitious or ahead of the curve.',
    null,
    null, null, 1, 7, false
  ),
  (
    'q12_day3_reflection', 3, 3, 'reflection', 'vision',
    'What''s a future you believe in that most people in your space still dismiss or underestimate?',
    'Don''t hedge — say what you actually think.',
    null, null, null, null, false
  )
on conflict (id) do nothing;
