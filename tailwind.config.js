module.exports = {
  // mode: 'jit',
  purge: ['./src/**/*.{ts,tsx,js,jsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: 'var(--ant-primary-color)',
        danger: 'var(--ant-error-color)',
      },
    },
  },
  variants: {},
  plugins: [],
};
