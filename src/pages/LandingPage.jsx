import HeroLeft from '../components/landing/HeroLeft.jsx'
import AuthPanel from '../components/landing/AuthPanel.jsx'

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B1120',
      display: 'flex',
      flexDirection: 'row',
    }}>
      <div style={{ flex: '0 0 55%' }}>
        <HeroLeft />
      </div>
      <div style={{ flex: '0 0 45%' }}>
        <AuthPanel />
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="flex-direction: row"] { flex-direction: column !important; }
          div[style*="flex: 0 0 55%"] { flex: 1 !important; }
          div[style*="flex: 0 0 45%"] { flex: 1 !important; }
        }
      `}</style>
    </div>
  )
}
