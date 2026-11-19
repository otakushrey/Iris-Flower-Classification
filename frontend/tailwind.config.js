/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0f172a',
        'surface': '#1e293b',
        'surface-2': '#334155',
        'primary': '#6366f1',
        'accent': '#ec4899',
        'success': '#10b981',
        'text-base': '#f1f5f9',
        'text-muted': '#94a3b8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
