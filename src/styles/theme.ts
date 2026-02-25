"use client";

import { createTheme } from "@mui/material/styles";

/**
 * MongoDB Design System Colors
 * https://www.mongodb.design/component/palette/live-example
 */
const mongoColors = {
  // Primary MongoDB Green
  green: {
    light: "#00ED64",
    main: "#00ED64",
    dark: "#00684A",
  },
  // MongoDB Slate (backgrounds)
  slate: {
    light: "#293742",
    main: "#001E2B",
    dark: "#001419",
  },
  // MongoDB Blue (interactive elements)
  blue: {
    light: "#4A90FF",
    main: "#0068F9",
    dark: "#0052C2",
  },
  // MongoDB Purple (accent)
  purple: {
    light: "#C766FF",
    main: "#B039F8",
    dark: "#8B2FC9",
  },
  // Neutral grays
  gray: {
    100: "#F9FBFA",
    200: "#E7EEEC",
    300: "#B8C4C2",
    400: "#89979B",
    500: "#5C6C75",
    600: "#3D4F58",
    700: "#1C2D38",
    800: "#0E1B24",
  },
};

export const hackathonTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: mongoColors.green.main,
      light: mongoColors.green.light,
      dark: mongoColors.green.dark,
      contrastText: "#001E2B",
    },
    secondary: {
      main: mongoColors.blue.main,
      light: mongoColors.blue.light,
      dark: mongoColors.blue.dark,
      contrastText: "#FFFFFF",
    },
    success: {
      main: mongoColors.green.main,
      light: mongoColors.green.light,
      dark: mongoColors.green.dark,
    },
    info: {
      main: mongoColors.blue.main,
      light: mongoColors.blue.light,
      dark: mongoColors.blue.dark,
    },
    warning: {
      main: "#FFB302", // MongoDB warning yellow
      light: "#FFC94D",
      dark: "#E69E00",
    },
    error: {
      main: "#E74C3C", // MongoDB red
      light: "#F27A6A",
      dark: "#C0392B",
    },
    background: {
      default: mongoColors.gray[100],
      paper: "#FFFFFF",
    },
    text: {
      primary: mongoColors.slate.main,
      secondary: mongoColors.gray[600],
    },
  },
  typography: {
    fontFamily: "'Euclid Circular A', 'Akzidenz', 'Helvetica Neue', Arial, sans-serif",
    h1: {
      fontWeight: 600,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 8px rgba(0, 30, 43, 0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 16px",
        },
        contained: {
          boxShadow: "0 2px 4px rgba(0, 30, 43, 0.12)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0, 30, 43, 0.16)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 2px 4px rgba(0, 30, 43, 0.08)",
        },
        elevation2: {
          boxShadow: "0 4px 8px rgba(0, 30, 43, 0.12)",
        },
      },
    },
  },
});
