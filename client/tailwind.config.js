/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        panel: 'var(--panel)',
        panel2: 'var(--panel2)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        primary: 'var(--primary)',
        lav: 'var(--lav)',
        glow: 'var(--glow)',
      },
      fontFamily: {
        head: ['Sora', 'Segoe UI', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        brand: 'var(--shadow)',
      },
    },
  },
  plugins: [],
};
