export const CLIMATE_INDICATORS = [
  {
    key: 'temperature',
    label: 'Activity Level',
    options: [
      { value: 'cold',      icon: '❄️',  label: 'Cold',      desc: 'Inactive — low engagement' },
      { value: 'temperate', icon: '🌤️', label: 'Temperate', desc: 'Normal — regular contact' },
      { value: 'warm',      icon: '☀️',  label: 'Warm',      desc: 'Active — frequent interaction' },
      { value: 'hot',       icon: '🔥',  label: 'Hot',       desc: 'Urgent — immediate attention' },
    ],
  },
  {
    key: 'wind',
    label: 'Influence & Power',
    options: [
      { value: 'calm',   icon: '🍃',  label: 'Calm',   desc: 'Low influence on decisions' },
      { value: 'breeze', icon: '💨',  label: 'Breeze', desc: 'Some influence in their area' },
      { value: 'windy',  icon: '🌬️', label: 'Windy',  desc: 'Significant influence' },
      { value: 'gale',   icon: '🌀',  label: 'Gale',   desc: 'Major decision maker' },
    ],
  },
  {
    key: 'storm',
    label: 'Risk & Conflict',
    options: [
      { value: 'clear',  icon: '☀️',  label: 'Clear',  desc: 'No risk — stable relationship' },
      { value: 'cloudy', icon: '⛅',  label: 'Cloudy', desc: 'Minor concerns — monitor' },
      { value: 'rainy',  icon: '🌧️', label: 'Rainy',  desc: 'Active issues — needs attention' },
      { value: 'stormy', icon: '⛈️', label: 'Stormy', desc: 'High conflict — critical situation' },
    ],
  },
  {
    key: 'visibility',
    label: 'Information Quality',
    options: [
      { value: 'foggy',   icon: '🌫️',    label: 'Foggy',   desc: 'Unknown — no reliable data' },
      { value: 'misty',   icon: '😶‍🌫️', label: 'Misty',   desc: 'Limited — few data points' },
      { value: 'partial', icon: '🌤️',   label: 'Partial', desc: 'Moderate — some gaps' },
      { value: 'clear',   icon: '🔭',    label: 'Clear',   desc: 'Full visibility — well informed' },
    ],
  },
  {
    key: 'tide',
    label: 'Trend & Momentum',
    options: [
      { value: 'low',    icon: '📉', label: 'Low',    desc: 'Declining — losing interest' },
      { value: 'stable', icon: '➡️', label: 'Stable', desc: 'Stable — no change expected' },
      { value: 'high',   icon: '📈', label: 'High',   desc: 'Growing — increasing engagement' },
      { value: 'surge',  icon: '🌊', label: 'Surge',  desc: 'Volatile — unpredictable' },
    ],
  },
  {
    key: 'uv_index',
    label: 'Alignment & Support',
    options: [
      { value: 'blocked',   icon: '🚫', label: 'Blocked',   desc: 'Opposed — actively against' },
      { value: 'neutral',   icon: '🌑', label: 'Neutral',   desc: 'Neutral — no clear position' },
      { value: 'favorable', icon: '🌤️', label: 'Favorable', desc: 'Supportive — generally aligned' },
      { value: 'optimal',   icon: '✨', label: 'Optimal',   desc: 'Champion — active promoter' },
    ],
  },
]

export const getClimateIcon = (key, value) => {
  const ind = CLIMATE_INDICATORS.find((i) => i.key === key)
  return ind?.options.find((o) => o.value === value)?.icon ?? null
}
