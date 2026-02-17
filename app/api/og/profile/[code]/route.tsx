import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ARCHETYPES } from '@/lib/archetypes'
import { DIMENSIONS, DIMENSION_ORDER } from '@/lib/dimensions'
import type { ArchetypeKey } from '@/lib/archetypes'
import type { DimensionKey } from '@/lib/dimensions'
import { APP_NAME } from '@/lib/constants'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } },
) {
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('founder_profiles')
    .select('archetype_key, dimension_scores')
    .eq('share_code', params.code)
    .maybeSingle()

  if (!profile) {
    return new Response('Not found', { status: 404 })
  }

  const archetypeKey = profile.archetype_key as ArchetypeKey
  const archetype = ARCHETYPES[archetypeKey]
  const scores = profile.dimension_scores as Record<DimensionKey, number>

  const dimensionColors: Record<DimensionKey, string> = {
    clarity: '#6366f1',
    resilience: '#f59e0b',
    velocity: '#10b981',
    empathy: '#ec4899',
    vision: '#8b5cf6',
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          padding: '60px',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Top label */}
        <div
          style={{
            display: 'flex',
            fontSize: '14px',
            fontWeight: 600,
            opacity: 0.6,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '24px',
          }}
        >
          {APP_NAME}
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flex: 1, gap: '60px', alignItems: 'center' }}>
          {/* Left: archetype */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '440px' }}>
            <div style={{ fontSize: '88px', marginBottom: '16px' }}>{archetype.emoji}</div>
            <div style={{ fontSize: '48px', fontWeight: 800, lineHeight: 1.1, marginBottom: '12px' }}>
              {archetype.name}
            </div>
            <div style={{ fontSize: '20px', opacity: 0.75, lineHeight: 1.4 }}>
              {archetype.tagline}
            </div>
          </div>

          {/* Right: dimension bars */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '16px' }}>
            {DIMENSION_ORDER.map((dim) => {
              const d = DIMENSIONS[dim]
              const score = scores[dim] ?? 50
              return (
                <div key={dim} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 600 }}>
                    <span>{d.emoji} {d.name}</span>
                    <span style={{ color: dimensionColors[dim] }}>{score}</span>
                  </div>
                  <div
                    style={{
                      width: '100%',
                      height: '10px',
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${score}%`,
                        height: '100%',
                        background: dimensionColors[dim],
                        borderRadius: '999px',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '32px',
            fontSize: '16px',
            opacity: 0.6,
          }}
        >
          Discover your founder archetype → whatafounder.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
