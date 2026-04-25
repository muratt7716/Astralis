import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Astralis — Yıldızların Rehberliği'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #07071A 0%, #0d0425 40%, #1a0535 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'serif',
          position: 'relative',
        }}
      >
        {/* Star dots background */}
        <div style={{ position: 'absolute', top: 40, left: 80, width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 120, left: 240, width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 80, right: 160, width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: 200, right: 80, width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 100, left: 120, width: 2, height: 2, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 60, right: 200, width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.6)', display: 'flex' }} />

        {/* Glow orb */}
        <div style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
        }} />

        {/* Logo / Icon */}
        <div style={{
          fontSize: 72,
          marginBottom: 20,
          display: 'flex',
        }}>
          ✦
        </div>

        {/* Brand name */}
        <div style={{
          fontSize: 80,
          fontWeight: 700,
          color: 'white',
          letterSpacing: '-2px',
          marginBottom: 16,
          display: 'flex',
        }}>
          Astralis
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 28,
          color: 'rgba(196,181,253,0.85)',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          display: 'flex',
        }}>
          Yıldızların Rehberliği
        </div>

        {/* Bottom divider */}
        <div style={{
          position: 'absolute',
          bottom: 48,
          display: 'flex',
          gap: 24,
          alignItems: 'center',
        }}>
          <div style={{ width: 60, height: 1, background: 'rgba(139,92,246,0.4)', display: 'flex' }} />
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', display: 'flex' }}>
            astralislab.com
          </div>
          <div style={{ width: 60, height: 1, background: 'rgba(139,92,246,0.4)', display: 'flex' }} />
        </div>
      </div>
    ),
    { ...size }
  )
}
