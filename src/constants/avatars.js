const mkSVG = (bg, label) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="100" fill="${bg}"/>
    <circle cx="100" cy="76" r="30" fill="rgba(255,255,255,0.90)"/>
    <rect x="62" y="60" width="76" height="10" rx="5" fill="rgba(0,0,0,0.45)"/>
    <rect x="70" y="48" width="60" height="18" rx="5" fill="rgba(0,0,0,0.55)"/>
    <circle cx="100" cy="56" r="7" fill="rgba(255,215,0,0.95)"/>
    <ellipse cx="100" cy="152" rx="44" ry="40" fill="rgba(255,255,255,0.85)"/>
    <rect x="80" y="106" width="40" height="28" rx="4" fill="rgba(0,0,0,0.20)"/>
    <text x="100" y="194" text-anchor="middle" fill="rgba(255,255,255,0.70)" font-size="16" font-family="sans-serif" font-weight="700">${label}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export const AVATARS = [
  { id: 'pilot_1', name: 'Ace',     color: '#3B82F6', src: '/avatars/pilot_1.png', placeholder: mkSVG('#3B82F6',  'ACE') },
  { id: 'pilot_2', name: 'Storm',   color: '#14B8A6', src: '/avatars/pilot_2.png', placeholder: mkSVG('#14B8A6',  'STORM') },
  { id: 'pilot_3', name: 'Blaze',   color: '#F59E0B', src: '/avatars/pilot_3.png', placeholder: mkSVG('#F59E0B',  'BLAZE') },
  { id: 'pilot_4', name: 'Nova',    color: '#10B981', src: '/avatars/pilot_4.png', placeholder: mkSVG('#10B981',  'NOVA') },
  { id: 'pilot_5', name: 'Vega',    color: '#8B5CF6', src: '/avatars/pilot_5.png', placeholder: mkSVG('#8B5CF6',  'VEGA') },
  { id: 'pilot_6', name: 'Cruz',    color: '#EC4899', src: '/avatars/pilot_6.png', placeholder: mkSVG('#EC4899',  'CRUZ') },
  { id: 'pilot_7', name: 'Rook',    color: '#EF4444', src: '/avatars/pilot_7.png', placeholder: mkSVG('#EF4444',  'ROOK') },
  { id: 'pilot_8', name: 'Flux',    color: '#6366F1', src: '/avatars/pilot_8.png', placeholder: mkSVG('#6366F1',  'FLUX') },
]

export const getAvatar = (id) => AVATARS.find((a) => a.id === id) || null

export const INDICATORS = [
  { id: 'altitude',   label: 'Altitude',   description: 'Vision & ambition',   color: '#3B82F6', icon: '🔭' },
  { id: 'fuel',       label: 'Fuel',       description: 'Energy & motivation',  color: '#F59E0B', icon: '⚡' },
  { id: 'visibility', label: 'Visibility', description: 'Strategic clarity',    color: '#14B8A6', icon: '🎯' },
  { id: 'speed',      label: 'Speed',      description: 'Execution pace',       color: '#10B981', icon: '🚀' },
]
