/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', '"Courier New"', 'monospace']
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' }
        },
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' }
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        }
      },
      animation: {
        'cursor-blink': 'blink 1s step-end infinite',
        twinkle: 'twinkle 3.2s ease-in-out infinite',
        floaty: 'floaty 5s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
