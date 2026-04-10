import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 土と緑をベースにした暖かみのある配色
        cream: '#FBF7EE',
        soil: '#3B2B12',
        soilLight: '#6B4F2A',
        leaf: '#6B8E23',
        leafDark: '#4A6B16',
        leafLight: '#A8C66C',
        sunset: '#E07A3C',
        sky: '#7FB3D5',
        frost: '#B8D4DB',
      },
      fontFamily: {
        zen: ['var(--font-zen-maru)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
