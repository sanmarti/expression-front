const features = [
  {
    icon: '🗺️',
    title: 'Interactive Island Map',
    desc: 'Visualize your stakeholders as camps on a living tropical island',
  },
  {
    icon: '🌦️',
    title: 'Living Climate System',
    desc: 'Each stakeholder has its own weather. Track sentiment and risk in real time',
  },
  {
    icon: '👥',
    title: 'Team Collaboration',
    desc: 'Invite your team with role-based access. Scale with your plan',
  },
]

export default function HeroLeft() {
  return (
    <div style={{
      padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      minHeight: '100vh',
    }}>
      {/* Logo */}
      <div style={{
        fontSize: 52, fontWeight: 800,
        background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        textShadow: 'none',
        filter: 'drop-shadow(0 2px 12px rgba(59,130,246,0.35))',
      }}>
        Expression
      </div>

      <div style={{
        fontSize: 30, fontWeight: 700, color: '#ffffff', marginTop: 16, lineHeight: 1.25,
        textShadow: '0 2px 16px rgba(0,0,0,0.6)',
      }}>
        Navigate your stakeholder landscape
      </div>

      <div style={{
        fontSize: 17, color: 'rgba(255,255,255,0.80)', marginTop: 14, lineHeight: 1.7, maxWidth: 480,
        textShadow: '0 1px 8px rgba(0,0,0,0.5)',
      }}>
        Map your stakeholders as a living island.
        Watch each camp's climate evolve in real time.
      </div>

      <div style={{ marginTop: 44, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {features.map((f) => (
          <div key={f.title} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            background: 'rgba(14,22,45,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: 14, padding: 20,
          }}>
            <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{f.icon}</div>
            <div>
              <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.95)', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
