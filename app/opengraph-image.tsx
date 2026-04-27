// app/opengraph-image.tsx

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'
export const alt = 'ai studio — Architecture, Design, Urbanism'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#1a1a1a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 96,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: '#ffffff',
          }}
        >
          <span>ai</span>
          <span style={{ color: '#d4602c', margin: '0 2px' }}>/</span>
          <span>studio</span>
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 400,
            letterSpacing: '0.35em',
            color: '#999999',
            marginTop: 24,
            textTransform: 'uppercase',
          }}
        >
          Architecture &middot; Design &middot; Urbanism
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
