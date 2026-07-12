const mkSVG = (bg, label) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="100" fill="${bg}"/>
    <circle cx="100" cy="76" r="30" fill="rgba(255,255,255,0.90)"/>
    <ellipse cx="100" cy="152" rx="44" ry="40" fill="rgba(255,255,255,0.85)"/>
    <text x="100" y="194" text-anchor="middle" fill="rgba(255,255,255,0.70)" font-size="16" font-family="sans-serif" font-weight="700">${label}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const COLORS = [
  '#3B82F6', '#14B8A6', '#F59E0B', '#10B981',
  '#8B5CF6', '#EC4899', '#EF4444', '#6366F1',
  '#06B6D4', '#84CC16', '#F97316', '#A855F7',
  '#22D3EE', '#4ADE80', '#FB923C', '#E879F9',
  '#38BDF8', '#34D399', '#FBBF24', '#818CF8',
  '#67E8F9', '#86EFAC', '#FCD34D', '#C084FC',
  '#7DD3FC', '#6EE7B7', '#FDE68A', '#DDD6FE',
]

export const AVATARS = [
  { id: 'pilot_1',  name: 'Marco',   color: COLORS[0],  src: '/avatars/pilot_1.png',  placeholder: mkSVG(COLORS[0],  'MARCO') },
  { id: 'pilot_2',  name: 'Rex',     color: COLORS[1],  src: '/avatars/pilot_2.png',  placeholder: mkSVG(COLORS[1],  'REX') },
  { id: 'pilot_3',  name: 'Maya',    color: COLORS[2],  src: '/avatars/pilot_3.png',  placeholder: mkSVG(COLORS[2],  'MAYA') },
  { id: 'pilot_4',  name: 'Elena',   color: COLORS[3],  src: '/avatars/pilot_4.png',  placeholder: mkSVG(COLORS[3],  'ELENA') },
  { id: 'pilot_5',  name: 'Zaid',    color: COLORS[4],  src: '/avatars/pilot_5.png',  placeholder: mkSVG(COLORS[4],  'ZAID') },
  { id: 'pilot_6',  name: 'Kaya',    color: COLORS[5],  src: '/avatars/pilot_6.png',  placeholder: mkSVG(COLORS[5],  'KAYA') },
  { id: 'pilot_7',  name: 'Kai',     color: COLORS[6],  src: '/avatars/pilot_7.png',  placeholder: mkSVG(COLORS[6],  'KAI') },
  { id: 'pilot_8',  name: 'Kofi',    color: COLORS[7],  src: '/avatars/pilot_8.png',  placeholder: mkSVG(COLORS[7],  'KOFI') },
  { id: 'pilot_9',  name: 'Ray',     color: COLORS[8],  src: '/avatars/pilot_9.png',  placeholder: mkSVG(COLORS[8],  'RAY') },
  { id: 'pilot_10', name: 'Luca',    color: COLORS[9],  src: '/avatars/pilot_10.png', placeholder: mkSVG(COLORS[9],  'LUCA') },
  { id: 'pilot_11', name: 'Vera',    color: COLORS[10], src: '/avatars/pilot_11.png', placeholder: mkSVG(COLORS[10], 'VERA') },
  { id: 'pilot_12', name: 'Nina',    color: COLORS[11], src: '/avatars/pilot_12.png', placeholder: mkSVG(COLORS[11], 'NINA') },
  { id: 'pilot_13', name: 'Mia',     color: COLORS[12], src: '/avatars/pilot_13.png', placeholder: mkSVG(COLORS[12], 'MIA') },
  { id: 'pilot_14', name: 'Amara',   color: COLORS[13], src: '/avatars/pilot_14.png', placeholder: mkSVG(COLORS[13], 'AMARA') },
  { id: 'pilot_15', name: 'Stella',  color: COLORS[14], src: '/avatars/pilot_15.png', placeholder: mkSVG(COLORS[14], 'STELLA') },
  { id: 'pilot_16', name: 'Leila',   color: COLORS[15], src: '/avatars/pilot_16.png', placeholder: mkSVG(COLORS[15], 'LEILA') },
  { id: 'pilot_17', name: 'Val',     color: COLORS[16], src: '/avatars/pilot_17.png', placeholder: mkSVG(COLORS[16], 'VAL') },
  { id: 'pilot_18', name: 'Sofia',   color: COLORS[17], src: '/avatars/pilot_18.png', placeholder: mkSVG(COLORS[17], 'SOFIA') },
  { id: 'pilot_19', name: 'Alex',    color: COLORS[18], src: '/avatars/pilot_19.png', placeholder: mkSVG(COLORS[18], 'ALEX') },
  { id: 'pilot_20', name: 'Rico',    color: COLORS[19], src: '/avatars/pilot_20.png', placeholder: mkSVG(COLORS[19], 'RICO') },
  { id: 'pilot_21', name: 'Lin',     color: COLORS[20], src: '/avatars/pilot_21.png', placeholder: mkSVG(COLORS[20], 'LIN') },
  { id: 'pilot_22', name: 'Omar',    color: COLORS[21], src: '/avatars/pilot_22.png', placeholder: mkSVG(COLORS[21], 'OMAR') },
  { id: 'pilot_23', name: 'Yuki',    color: COLORS[22], src: '/avatars/pilot_23.png', placeholder: mkSVG(COLORS[22], 'YUKI') },
  { id: 'pilot_24', name: 'Tariq',   color: COLORS[23], src: '/avatars/pilot_24.png', placeholder: mkSVG(COLORS[23], 'TARIQ') },
  { id: 'pilot_25', name: 'Jaden',   color: COLORS[24], src: '/avatars/pilot_25.png', placeholder: mkSVG(COLORS[24], 'JADEN') },
  { id: 'pilot_26', name: 'Rosa',    color: COLORS[25], src: '/avatars/pilot_26.png', placeholder: mkSVG(COLORS[25], 'ROSA') },
  { id: 'pilot_27', name: 'Aisha',   color: COLORS[26], src: '/avatars/pilot_27.png', placeholder: mkSVG(COLORS[26], 'AISHA') },
  { id: 'pilot_28', name: 'Luna',    color: COLORS[27], src: '/avatars/pilot_28.png', placeholder: mkSVG(COLORS[27], 'LUNA') },
]

export const getAvatar = (id) => AVATARS.find((a) => a.id === id) || null

export const INDICATORS = [
  { id: 'altitude',   label: 'Altitude',   description: 'Vision & ambition',   color: '#3B82F6', icon: '🔭' },
  { id: 'fuel',       label: 'Fuel',       description: 'Energy & motivation',  color: '#F59E0B', icon: '⚡' },
  { id: 'visibility', label: 'Visibility', description: 'Strategic clarity',    color: '#14B8A6', icon: '🎯' },
  { id: 'speed',      label: 'Speed',      description: 'Execution pace',       color: '#10B981', icon: '🚀' },
]
