/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#141414',
        surface: '#F8F8F8',
        muted: '#666666',
        hairline: '#E5E5E5',
        cardDark: '#1E1E1E',
        pear: { DEFAULT: '#D8E82E', lip: '#A8B800', ink: '#141414' },
        link: '#456DFF',
        correct: { DEFAULT: '#29CC57', bg: '#D4F5DD', ink: '#00370F' },
        wrong: { bg: '#E5E5E5', ink: '#383838' },
        retry: { bg: '#FCE49D', ink: '#403000' },
        danger: '#FF5D5D',
      },
      fontFamily: {
        sans: ['General Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      maxWidth: { col: '432px' },
      borderRadius: { key: '14px', tile: '16px', big: '20px' },
      boxShadow: {
        rest: '0 2px 0 0 #CCCCCC',
        key: '0 4px 0 0 #A8B800',
        keyPress: '0 2px 0 0 #A8B800',
        tile: '0 2px 0 0 #D8D8D8',
      },
      transitionTimingFunction: {
        pop: 'cubic-bezier(0.16, 1, 0.3, 1)',
        smooth: 'cubic-bezier(0, 0, 0.2, 1)',
      },
      keyframes: {
        pop: {
          '0%': { transform: 'scale(0.96)' },
          '55%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
        risein: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pop: 'pop 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        risein: 'risein 0.25s cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
