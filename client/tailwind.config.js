/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D', // Primary green
          800: '#166534',
          900: '#14532D', // Dark green
          950: '#052E16',
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          hover: '#F1F5F9'
        },
        text: {
          main: '#1E293B',
          muted: '#64748B',
          light: '#94A3B8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
