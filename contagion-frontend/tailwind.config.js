/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0B0E11',
        card: '#151A1F',
        border: 'rgba(255, 255, 255, 0.1)',
        text: {
          DEFAULT: '#F5F6F7',
          secondary: '#9BA1A9',
          muted: '#616E7C'
        },
        primary: '#00F7C3',
        danger: '#FF4976'
      },
      keyframes: {
        glow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.5)' }
        }
      },
      animation: {
        glow: 'glow 1s ease-in-out'
      }
    }
  }
};