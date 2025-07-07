import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Mobile-first responsive theme
const baseTheme = createTheme({
  // Mobile-optimized breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  
  // Dark theme optimized for soundscape immersion
  palette: {
    mode: 'dark',
    primary: {
      main: '#0077be', // Ocean blue
      light: '#4da6e6',
      dark: '#005085',
    },
    secondary: {
      main: '#228b22', // Forest green
      light: '#52bb52',
      dark: '#155d15',
    },
    background: {
      default: '#0a0a0a', // Deep black for immersion
      paper: '#1a1a1a',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    // Category colors for soundscapes
    ocean: '#0077be',
    forest: '#228b22', 
    weather: '#483d8b',
    meditation: '#9370db',
    ambient: '#ff6347',
  },

  // Mobile-optimized typography
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    
    // Large touch targets for mobile
    h1: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.2,
      '@media (max-width:600px)': {
        fontSize: '1.75rem',
      },
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      '@media (max-width:600px)': {
        fontSize: '0.9rem',
      },
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      '@media (max-width:600px)': {
        fontSize: '0.8rem',
      },
    },
    caption: {
      fontSize: '0.75rem',
      '@media (max-width:600px)': {
        fontSize: '0.7rem',
      },
    },
  },

  // Mobile-first component overrides
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48, // Touch-friendly minimum
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 500,
          '@media (max-width:600px)': {
            minHeight: 44,
            fontSize: '0.9rem',
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          // Mobile-optimized touch interaction
          '@media (max-width:600px)': {
            borderRadius: 12,
            margin: '8px',
          },
        },
      },
    },

    MuiCardActionArea: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          // Touch feedback for mobile
          '&:active': {
            transform: 'scale(0.98)',
            transition: 'transform 0.1s ease',
          },
          '@media (max-width:600px)': {
            borderRadius: 12,
          },
        },
      },
    },

    MuiSlider: {
      styleOverrides: {
        root: {
          height: 8,
          // Larger touch targets for mobile
          '@media (max-width:600px)': {
            height: 12,
          },
        },
        thumb: {
          width: 24,
          height: 24,
          // Larger thumb for touch interaction
          '@media (max-width:600px)': {
            width: 28,
            height: 28,
          },
          '&:hover': {
            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.1)',
          },
          '&.Mui-active': {
            boxShadow: '0 0 0 12px rgba(255, 255, 255, 0.2)',
          },
        },
        track: {
          borderRadius: 4,
        },
        rail: {
          borderRadius: 4,
          opacity: 0.3,
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          // Touch-friendly icon buttons
          minWidth: 48,
          minHeight: 48,
          '@media (max-width:600px)': {
            minWidth: 44,
            minHeight: 44,
          },
        },
      },
    },

    MuiFab: {
      styleOverrides: {
        root: {
          // Mobile-optimized FAB
          width: 64,
          height: 64,
          '@media (max-width:600px)': {
            width: 56,
            height: 56,
          },
        },
      },
    },

    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          // Safe area for mobile notches
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
      },
    },

    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(10px)',
          // Safe area for mobile notches
          paddingTop: 'env(safe-area-inset-top)',
        },
      },
    },

    // Mobile-optimized grid spacing
    MuiGrid: {
      styleOverrides: {
        container: {
          '@media (max-width:600px)': {
            '& .MuiGrid-item': {
              paddingLeft: 8,
              paddingTop: 8,
            },
          },
        },
      },
    },

    // Touch-friendly menu items
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 48,
          '@media (max-width:600px)': {
            minHeight: 44,
            fontSize: '0.9rem',
          },
        },
      },
    },

    // Mobile-optimized dialog
    MuiDialog: {
      styleOverrides: {
        paper: {
          margin: 16,
          '@media (max-width:600px)': {
            margin: 8,
            maxHeight: 'calc(100% - 16px)',
          },
        },
      },
    },

    // Mobile swipe support
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          backdropFilter: 'blur(10px)',
        },
      },
    },

    // Custom scrollbar for mobile
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
        },
        '*::-webkit-scrollbar': {
          width: 6,
          height: 6,
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 3,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
        // Mobile touch improvements
        body: {
          touchAction: 'manipulation', // Disable double-tap zoom
          '-webkit-touch-callout': 'none', // Disable callout on iOS
          '-webkit-user-select': 'none',
          '-webkit-tap-highlight-color': 'transparent',
        },
        // Smooth scrolling for mobile
        html: {
          scrollBehavior: 'smooth',
        },
      },
    },
  },

  // Mobile-specific spacing
  spacing: (factor) => `${0.25 * factor}rem`,

  // Mobile-optimized shadows
  shadows: [
    'none',
    '0 1px 3px rgba(0, 0, 0, 0.3)',
    '0 1px 5px rgba(0, 0, 0, 0.3)',
    '0 1px 8px rgba(0, 0, 0, 0.3)',
    '0 1px 10px rgba(0, 0, 0, 0.3)',
    '0 1px 14px rgba(0, 0, 0, 0.3)',
    '0 1px 18px rgba(0, 0, 0, 0.3)',
    '0 2px 16px rgba(0, 0, 0, 0.3)',
    '0 3px 14px rgba(0, 0, 0, 0.3)',
    '0 3px 16px rgba(0, 0, 0, 0.3)',
    '0 4px 18px rgba(0, 0, 0, 0.3)',
    '0 4px 20px rgba(0, 0, 0, 0.3)',
    '0 5px 22px rgba(0, 0, 0, 0.3)',
    '0 5px 24px rgba(0, 0, 0, 0.3)',
    '0 5px 26px rgba(0, 0, 0, 0.3)',
    '0 6px 28px rgba(0, 0, 0, 0.3)',
    '0 6px 30px rgba(0, 0, 0, 0.3)',
    '0 6px 32px rgba(0, 0, 0, 0.3)',
    '0 7px 34px rgba(0, 0, 0, 0.3)',
    '0 7px 36px rgba(0, 0, 0, 0.3)',
    '0 8px 38px rgba(0, 0, 0, 0.3)',
    '0 8px 40px rgba(0, 0, 0, 0.3)',
    '0 8px 42px rgba(0, 0, 0, 0.3)',
    '0 9px 44px rgba(0, 0, 0, 0.3)',
    '0 9px 46px rgba(0, 0, 0, 0.3)',
  ],

  // Mobile-friendly transitions
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
});

// Apply responsive font sizes for mobile optimization
export const theme = responsiveFontSizes(baseTheme, {
  breakpoints: ['xs', 'sm', 'md', 'lg'],
  disableAlign: false,
  factor: 2,
  variants: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2'],
});

export default theme;