export default function WeatherEffect({ weather_type, size = 'small' }) {
  const dim = size === 'large' ? 80 : size === 'medium' ? 48 : 28

  const w = weather_type || 'clear'

  return (
    <svg width={dim} height={dim} viewBox="0 0 40 40" style={{ overflow: 'visible' }}>
      {w === 'sunny' && (
        <g className="weather-sun">
          <circle cx="20" cy="20" r="8" fill="#FCD34D" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="20" y1="20"
              x2={20 + Math.cos((deg * Math.PI) / 180) * 14}
              y2={20 + Math.sin((deg * Math.PI) / 180) * 14}
              stroke="#FCD34D" strokeWidth="2" strokeLinecap="round"
              className="sun-ray"
              style={{ transformOrigin: '20px 20px', animationDelay: `${deg / 360}s` }}
            />
          ))}
        </g>
      )}
      {w === 'cloudy' && (
        <g className="weather-cloud">
          <ellipse cx="18" cy="22" rx="10" ry="7" fill="#9CA3AF" />
          <ellipse cx="24" cy="20" rx="8" ry="6" fill="#D1D5DB" style={{ animationDelay: '0.5s' }} />
          <ellipse cx="14" cy="21" rx="7" ry="5" fill="#6B7280" style={{ animationDelay: '1s' }} />
        </g>
      )}
      {w === 'rainy' && (
        <g className="weather-rain">
          <ellipse cx="20" cy="16" rx="10" ry="6" fill="#6B7280" />
          <line x1="14" y1="24" x2="12" y2="32" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="24" x2="18" y2="32" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="26" y1="24" x2="24" y2="32" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="17" y1="26" x2="15" y2="34" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="23" y1="26" x2="21" y2="34" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
      {w === 'stormy' && (
        <g>
          <ellipse cx="20" cy="14" rx="12" ry="7" fill="#374151" />
          <polyline points="22,20 18,28 22,28 17,36" fill="none" stroke="#FCD34D" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      )}
      {w === 'foggy' && (
        <g>
          {[14, 20, 26].map((y, i) => (
            <ellipse key={y} cx="20" cy={y} rx="12" ry="3" fill="white" fillOpacity="0.25"
              style={{ animation: `float 3s ease-in-out infinite`, animationDelay: `${i * 0.6}s` }} />
          ))}
        </g>
      )}
      {w === 'windy' && (
        <g className="weather-wind">
          <path d="M8,16 Q14,12 20,16 Q26,20 32,16" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
          <path d="M8,22 Q14,18 20,22 Q26,26 32,22" fill="none" stroke="#BFDBFE" strokeWidth="2" strokeLinecap="round" style={{ animationDelay: '0.4s' }} />
          <path d="M10,28 Q16,24 22,28 Q28,32 34,28" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" style={{ animationDelay: '0.8s' }} />
        </g>
      )}
      {w === 'snowy' && (
        <g className="weather-snow">
          <ellipse cx="20" cy="14" rx="10" ry="6" fill="#D1D5DB" />
          <circle cx="14" cy="26" r="2" fill="white" />
          <circle cx="20" cy="24" r="2" fill="white" style={{ animationDelay: '0.5s' }} />
          <circle cx="26" cy="28" r="2" fill="white" style={{ animationDelay: '1s' }} />
          <circle cx="17" cy="32" r="1.5" fill="white" style={{ animationDelay: '0.25s' }} />
          <circle cx="23" cy="34" r="1.5" fill="white" style={{ animationDelay: '0.75s' }} />
        </g>
      )}
      {(w === 'clear' || !['sunny','cloudy','rainy','stormy','foggy','windy','snowy'].includes(w)) && (
        <g className="weather-clear">
          <circle cx="20" cy="20" r="10" fill="rgba(59,130,246,0.15)" stroke="#3B82F6" strokeWidth="1" />
          <circle cx="20" cy="20" r="5" fill="rgba(59,130,246,0.3)" />
          <circle cx="14" cy="14" r="2" fill="#60A5FA" style={{ animationDelay: '0s' }} />
          <circle cx="26" cy="14" r="1.5" fill="#60A5FA" style={{ animationDelay: '0.5s' }} />
          <circle cx="26" cy="26" r="2" fill="#60A5FA" style={{ animationDelay: '1s' }} />
          <circle cx="14" cy="26" r="1.5" fill="#60A5FA" style={{ animationDelay: '1.5s' }} />
        </g>
      )}
    </svg>
  )
}
