/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nature-inspired peaceful palette
        warm: {
          white: '#F7F8F3', // Primary background
          ivory: '#FBFAF6', // Soft ivory surface
        },
        sage: {
          pale: '#E9EDE2',  // Secondary background
          soft: '#DCE5D5',  // Soft sage green
          muted: '#A9BDA5', // Primary accent 1
          light: '#F0F4EC',
        },
        forest: {
          deep: '#294A40',  // Deep forest green for key actions/active nav
          dark: '#1F3831',
          hover: '#223E36',
        },
        serene: {
          lavender: '#E9E5F2', // Muted lavender
          blue: '#E4ECF2',     // Soft dusty blue
          peach: '#F3D8C8',    // Soft peach accent
        },
        ink: {
          primary: '#293B38',   // Primary text
          secondary: '#78817D', // Secondary text
          muted: '#969D97',     // Muted text
        },
        border: {
          soft: '#E5E8DF',     // Soft neutral border
          subtle: '#EDF0E8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'peaceful': '0 2px 12px rgba(41, 59, 56, 0.04), 0 1px 3px rgba(41, 59, 56, 0.02)',
        'peaceful-hover': '0 6px 20px rgba(41, 59, 56, 0.07), 0 2px 6px rgba(41, 59, 56, 0.03)',
        'peaceful-card': '0 2px 8px rgba(41, 59, 56, 0.03)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
}

