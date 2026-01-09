/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#31b09c',
          hover: '#268879',
        },
        text: {
          primary: '#3a3a3a',
          body: '#333232',
        },
        sale: '#EA0606',
        border: '#ebebeb',
        'form-border': '#cccccc',
      },
      fontFamily: {
        sans: ['Karla', 'sans-serif'],
        serif: ['Karla', 'sans-serif'],
      },
      fontSize: {
        base: '15px',
        'h1-mobile': '32px',
        'h1-desktop': '42px',
        'h2-desktop': '24px',
        'h3': '20px',
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.15em',
      },
      screens: {
        mobile: '0px',
        tablet: '750px',
        desktop: '990px',
        wide: '1400px',
      },
      maxWidth: {
        'container': '1400px',
      },
      spacing: {
        'nav-height': '60px',
      },
    },
  },
  plugins: [],
}
