/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        body: ['Space Grotesk', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        publix: '#00A651',
        vanderbilt: '#CFB87C',
        nashville: '#2D6DB5',
        personal: '#6B7280',
      },
    },
  },
  plugins: [],
}
