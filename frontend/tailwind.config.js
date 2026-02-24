/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Elegant Gold Primary Palette
        primary: {
          50: '#fdfaf5',   // Cream White
          100: '#f8f1e5',  // Champagne
          200: '#efe0c7',  // Butter Cream
          300: '#e5ca9f',  // Wheat
          400: '#d4ab6a',  // Golden
          500: '#c49347',  // Antique Gold (main brand)
          600: '#b07d35',  // Amber
          700: '#936528',  // Bronze
          800: '#77501f',  // Deep Bronze
          900: '#5e3f18',  // Umber
        },
        // Sage Green Secondary Palette
        secondary: {
          50: '#f5f7f5',
          100: '#e7ede7',
          200: '#cfdacf',
          300: '#abc2ab',
          400: '#7fa37f',
          500: '#5d835d',  // Main accent
          600: '#4a6a4a',
          700: '#3c553c',
          800: '#314531',
          900: '#283928',
        },
        // Refined Neutral Palette
        neutral: {
          50: '#fafaf9',
          100: '#f5f4f2',
          200: '#e8e6e3',
          300: '#d4d1cc',
          400: '#9e9a93',
          500: '#6f6b64',
          600: '#57544f',
          700: '#403e3a',
          800: '#2d2b28',
          900: '#1a1917',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        accent: ['Cormorant Garamond', 'serif'],
      },
      boxShadow: {
        'elegant-sm': '0 1px 2px rgba(0,0,0,0.04), 0 2px 4px rgba(0,0,0,0.02)',
        'elegant': '0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.03)',
        'elegant-md': '0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)',
        'elegant-lg': '0 8px 16px rgba(0,0,0,0.1), 0 16px 32px rgba(0,0,0,0.06)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
        '128': '32rem',
      },
      letterSpacing: {
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },
      borderRadius: {
        'elegant': '12px',
      },
      transitionTimingFunction: {
        'elegant': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
