// Charte graphique de PrepaCameroun
const theme = {
    colors: {
      primary: '#bf0051',       // Rouge principal (logo)
      secondary: '#0274d9',     // Bleu (logo)
      dark: '#212529',          // Gris foncé pour texte
      light: '#f8f9fa',         // Gris très clair pour fonds
      lightAccent: '#f1f1f1',   // Gris clair pour accents
      primaryDark: '#8c003c',   // Rouge foncé pour hover
      secondaryDark: '#015aa9', // Bleu foncé pour hover
      success: '#28a745',       // Vert standard
      danger: '#dc3545',        // Rouge d'alerte
      warning: '#ffc107',       // Orange d'avertissement
      info: '#17a2b8',          // Bleu d'information
      white: '#ffffff',
      black: '#000000',
      gray: '#6c757d',
    },
    fonts: {
      primary: "'Poppins', sans-serif",
      sizes: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        md: '1.125rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '1.75rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        '5xl': '3rem',
        '6xl': '3.5rem',
      },
      weights: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      }
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
      '2xl': '1.5rem',
      pill: '30px',
    },
    shadows: {
      card: '0 10px 20px rgba(0, 0, 0, 0.05), 0 6px 6px rgba(0, 0, 0, 0.1)',
      button: '0 4px 14px rgba(191, 0, 81, 0.4)',
      buttonSecondary: '0 4px 14px rgba(2, 116, 217, 0.4)',
      hover: '0 7px 14px rgba(0, 0, 0, 0.1)',
    },
    transitions: {
      default: 'all 0.3s ease',
      fast: 'all 0.15s ease',
      slow: 'all 0.5s ease',
    },
    breakpoints: {
      xs: '0px',
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1200px',
      xxl: '1400px',
    },
    spacing: {
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '1rem',
      4: '1.5rem',
      5: '2rem',
      6: '3rem',
      7: '4rem',
      8: '6rem',
    }
  };
  
  export default theme;
  