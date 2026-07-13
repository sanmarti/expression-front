export const CLIMATE_INDICATORS = [
  {
    key: 'temperature',
    label: 'Activity Level',
    phenomenon: 'Temperature',
    options: [
      { value: 'cold',      icon: '❄️',  label: 'Cold',     desc: 'Inactive — low engagement' },
      { value: 'temperate', icon: '🍃',  label: 'Moderate', desc: 'Normal — regular contact' },
      { value: 'warm',      icon: '🌡️', label: 'Warm',     desc: 'Active — frequent interaction' },
      { value: 'hot',       icon: '🔥',  label: 'Hot',      desc: 'Urgent — immediate attention' },
    ],
  },
  {
    key: 'wind',
    label: 'Influence & Power',
    phenomenon: 'Wind Strength',
    options: [
      { value: 'calm',   icon: '🌈',  label: 'Calm',   desc: 'Low influence on decisions' },
      { value: 'breeze', icon: '🌬️', label: 'Breeze', desc: 'Some influence in their area' },
      { value: 'windy',  icon: '💨',  label: 'Windy',  desc: 'Significant influence' },
      { value: 'gale',   icon: '🌪️', label: 'Gale',   desc: 'Major decision maker' },
    ],
  },
  {
    key: 'storm',
    label: 'Risk & Conflict',
    phenomenon: 'Turbulence',
    options: [
      { value: 'clear',  icon: '🟢', label: 'Smooth Air',          desc: 'No risk — stable relationship' },
      { value: 'cloudy', icon: '🟡', label: 'Light Turbulence',    desc: 'Minor concerns — monitor' },
      { value: 'rainy',  icon: '🟠', label: 'Moderate Turbulence', desc: 'Active issues — needs attention' },
      { value: 'stormy', icon: '🔴', label: 'Severe Turbulence',   desc: 'High conflict — critical situation' },
    ],
  },
  {
    key: 'visibility',
    label: 'Information Quality',
    phenomenon: 'Visibility',
    options: [
      { value: 'foggy',   icon: '🌫️', label: 'Foggy',   desc: 'Unknown — no reliable data' },
      { value: 'misty',   icon: '🌁',  label: 'Misty',   desc: 'Limited — few data points' },
      { value: 'partial', icon: '👀',  label: 'Partial', desc: 'Moderate — some gaps' },
      { value: 'clear',   icon: '🧭',  label: 'Clear',   desc: 'Full visibility — well informed' },
    ],
  },
  {
    key: 'tide',
    label: 'Trend & Momentum',
    phenomenon: 'Pressure Systems',
    options: [
      { value: 'low',    icon: '📉', label: 'Low Pressure',     desc: 'Declining — losing interest' },
      { value: 'stable', icon: '➖', label: 'Stable Pressure',  desc: 'Stable — no change expected' },
      { value: 'high',   icon: '📈', label: 'Rising Pressure',  desc: 'Growing — increasing engagement' },
      { value: 'surge',  icon: '🌀', label: 'Accelerating',     desc: 'Volatile — unpredictable' },
    ],
  },
  {
    key: 'uv_index',
    label: 'Alignment & Support',
    phenomenon: 'Sky Conditions',
    options: [
      { value: 'blocked',   icon: '⛈️', label: 'Blocked',   desc: 'Opposed — actively against' },
      { value: 'neutral',   icon: '☁️',  label: 'Neutral',   desc: 'Neutral — no clear position' },
      { value: 'favorable', icon: '🌤️', label: 'Favorable', desc: 'Supportive — generally aligned' },
      { value: 'optimal',   icon: '☀️',  label: 'Optimal',   desc: 'Champion — active promoter' },
    ],
  },
]

export const getClimateIcon = (key, value) => {
  const ind = CLIMATE_INDICATORS.find((i) => i.key === key)
  return ind?.options.find((o) => o.value === value)?.icon ?? null
}
