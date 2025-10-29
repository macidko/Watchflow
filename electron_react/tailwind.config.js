/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Tema desteği için class-based dark mode
  theme: {
    extend: {
      // Colors - CSS değişkenlerini Tailwind'e entegre et
      colors: {
        // Ana renk paleti
        primary: {
          bg: 'var(--primary-bg)',
          text: 'var(--primary-text)',
        },
        secondary: {
          bg: 'var(--secondary-bg)',
          text: 'var(--secondary-text)',
          'bg-transparent': 'var(--secondary-bg-transparent)',
        },
        accent: {
          DEFAULT: 'var(--accent-color)',
          hover: 'var(--hover-color)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
          hover: 'var(--border-color-hover)',
        },
        // UI Component renkleri
        input: {
          bg: 'var(--input-bg)',
        },
        dropdown: {
          bg: 'var(--dropdown-bg)',
        },
        card: {
          bg: 'var(--card-bg)',
        },
        hover: {
          bg: 'var(--hover-bg)',
        },
        tag: {
          bg: 'var(--tag-bg)',
        },
        overlay: {
          bg: 'var(--overlay-bg)',
        },
        // Semantic renkler
        success: {
          DEFAULT: 'var(--success-color)',
          text: 'var(--success-text)',
        },
        danger: {
          DEFAULT: 'var(--danger-color)',
          text: 'var(--danger-text)',
        },
        warning: {
          DEFAULT: 'var(--warning-color)',
        },
        star: {
          DEFAULT: 'var(--star-color)',
        },
        muted: 'var(--muted)',
        'text-muted': 'var(--text-muted)',
      },

      // Spacing - CSS spacing değişkenlerini Tailwind'e entegre et
      spacing: {
        'xs': 'var(--space-4)',
        'sm': 'var(--space-8)',
        'md': 'var(--space-12)',
        'lg': 'var(--space-16)',
        'xl': 'var(--space-20)',
        '2xl': 'var(--space-24)',
        '3xl': 'var(--space-32)',
      },

      // Font Size - CSS font-size değişkenlerini Tailwind'e entegre et
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'md': 'var(--font-size-md)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
      },

      // Border Radius - CSS radius değişkenlerini Tailwind'e entegre et
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'card': 'var(--radius-lg)', // Card için özel
        'popup': 'var(--popup-radius)',
      },

      // Box Shadow - CSS shadow değişkenlerini Tailwind'e entegre et
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'card': 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
        'dropdown': 'var(--dropdown-shadow)',
        'popup': 'var(--popup-shadow)',
      },

      // Animasyonlar
      transitionDuration: {
        'standard': 'var(--transition-standard)',
        'popup': 'var(--popup-animation-time)',
      },

      // Z-index layers
      zIndex: {
        'dropdown': '1000',
        'modal': '1050',
        'tooltip': '1070',
      },

      // Custom utilities için
      backgroundImage: {
        'gradient-card': 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 30%, rgba(0,0,0,0.1) 100%)',
      },

      // Layout için özel değerler
      maxWidth: {
        'card-small': '8rem',
        'card-medium': '11rem',
        'card-large': '14rem',
      },
      minHeight: {
        'card-small': '12rem',
        'card-medium': '16rem',
        'card-large': '20rem',
      },
    },
  },
  plugins: [],
}
