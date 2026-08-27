/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './lib/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#630ed4',
        'primary-soft': '#f5f0ff',
        accent: '#ec4899',
        success: '#0f9f78',
        warning: '#f59e0b',
        danger: '#ef4444',
        background: '#f7f4ff',
        surface: '#ffffff',
        foreground: '#24114d',
        muted: '#756b84',
        border: '#e6ddf6',
      },
    },
  },
  plugins: [],
};
