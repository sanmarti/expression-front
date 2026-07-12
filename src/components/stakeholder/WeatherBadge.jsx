import Badge from '../ui/Badge.jsx'
import WeatherEffect from '../island/WeatherEffect.jsx'

const weatherVariant = {
  sunny: 'amber', cloudy: 'gray', rainy: 'blue', stormy: 'red',
  foggy: 'gray', windy: 'teal', snowy: 'blue', clear: 'teal',
}

export default function WeatherBadge({ weather_type }) {
  const variant = weatherVariant[weather_type] || 'gray'
  return (
    <Badge variant={variant}>
      <WeatherEffect weather_type={weather_type} size="small" />
      <span style={{ textTransform: 'capitalize', marginLeft: 4 }}>{weather_type || 'clear'}</span>
    </Badge>
  )
}
