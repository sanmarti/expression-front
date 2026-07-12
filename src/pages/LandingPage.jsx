import HeroLeft from '../components/landing/HeroLeft.jsx'
import AuthPanel from '../components/landing/AuthPanel.jsx'

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      display: 'flex',
      flexDirection: 'row',
      overflow: 'hidden',
    }}>
      {/* Full-screen background image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        zIndex: 0,
      }} />

      {/* Dark gradient overlay — lighter on left, darker on right for contrast */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(105deg, rgba(11,17,32,0.55) 0%, rgba(11,17,32,0.30) 60%, rgba(11,17,32,0.20) 100%)',
        zIndex: 1,
      }} />

      {/* Left: hero text */}
      <div style={{ flex: '0 0 55%', position: 'relative', zIndex: 2 }}>
        <HeroLeft />
      </div>

      {/* Right: auth card centered in transparent column */}
      <div style={{
        flex: '0 0 45%', position: 'relative', zIndex: 2,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px',
      }}>
        <AuthPanel />
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="flex-direction: row"] { flex-direction: column !important; }
        }
      `}</style>
    </div>
  )
}
