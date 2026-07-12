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
    <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* Logo */}
      <div style={{
        fontSize: 48, fontWeight: 700,
        background: 'linear-gradient(135deg, #3B82F6, #14B8A6)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        Expression
      </div>

      <div style={{ fontSize: 28, fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginTop: 16, lineHeight: 1.2 }}>
        Navigate your stakeholder landscape
      </div>

      <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', marginTop: 12, lineHeight: 1.6, maxWidth: 480 }}>
        Map your stakeholders as a living island.
        Watch each camp's climate evolve in real time.
      </div>

      <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {features.map((f) => (
          <div key={f.title} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            background: '#141E35', border: '1px solid #1C2B45',
            borderRadius: 12, padding: 20,
          }}>
            <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{f.icon}</div>
            <div>
              <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.92)', marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
