export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: { DEFAULT: '#0B1120', surface: '#141E35', surface2: '#1C2B45' },
        accent: {
          blue: '#3B82F6', teal: '#14B8A6',
          amber: '#F59E0B', green: '#10B981', red: '#EF4444'
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'drift': 'drift 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'fall': 'fall 1.2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(6px)' },
        },
        fall: {
          'from': { transform: 'translateY(-10px)', opacity: '1' },
          'to': { transform: 'translateY(10px)', opacity: '0' },
        },
      }
    }
  },
  plugins: []
}
