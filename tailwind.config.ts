import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ['var(--font-nunito)', 'Nunito', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 1.4s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
