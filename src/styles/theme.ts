"use client";

import { createTheme } from "@mui/material/styles";

/**
 * MongoDB Brand Book V4.0 — Official Brand Tokens
 */
export const mongoBrand = {
  // Primary Palette
  springGreen: "#00ED64",
  slateBlue: "#001E2B",
  white: "#FFFFFF",
  forestGreen: "#00684A",
  evergreen: "#023430",
  mist: "#E3FCF7",
  lavender: "#F9EBFF",

  // Brand-approved secondary (for illustration/accent)
  blue: "#006EFF",
  purple: "#B45AF2",

  // Functional colors (brand-adjacent)
  warningYellow: "#FFC010", // Bright Yellow from brand secondary
  errorRed: "#CF4520",

  // Neutral grays derived from Slate Blue family
  gray: {
    50: "#F9FBFA",
    100: "#E7EEEC",
    200: "#C1CCC6",
    300: "#889397",
    400: "#5C6C75",
    500: "#3D4F58",
    600: "#1C2D38",
  },
};

/**
 * @deprecated Use `mongoBrand` instead. Kept for backward compatibility.
 */
export const mongoColors = {
  green: {
    light: mongoBrand.springGreen,
    main: mongoBrand.forestGreen,
    dark: mongoBrand.evergreen,
  },
  slate: {
    light: "#293742",
    main: mongoBrand.slateBlue,
    dark: "#001419",
  },
  blue: {
    light: "#4A90FF",
    main: mongoBrand.blue,
    dark: "#0052C2",
  },
  purple: {
    light: "#C766FF",
    main: mongoBrand.purple,
    dark: "#8B2FC9",
  },
  gray: mongoBrand.gray,
};

export const hackathonTheme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: mongoBrand.forestGreen,
          light: mongoBrand.springGreen,
          dark: mongoBrand.evergreen,
          contrastText: mongoBrand.white,
        },
        secondary: {
          main: mongoBrand.blue,
          light: "#4A90FF",
          dark: "#0052C2",
          contrastText: mongoBrand.white,
        },
        success: {
          main: mongoBrand.forestGreen,
          light: mongoBrand.springGreen,
          dark: mongoBrand.evergreen,
        },
        info: {
          main: mongoBrand.blue,
        },
        warning: {
          main: mongoBrand.warningYellow,
          dark: "#E6AC00",
        },
        error: {
          main: mongoBrand.errorRed,
          light: "#E8714D",
          dark: "#A33618",
        },
        background: {
          default: mongoBrand.white,
          paper: mongoBrand.white,
        },
        text: {
          primary: mongoBrand.slateBlue,
          secondary: mongoBrand.gray[400],
        },
        divider: "rgba(0, 30, 43, 0.08)",
      },
    },
    dark: {
      palette: {
        primary: {
          main: mongoBrand.springGreen,
          light: mongoBrand.mist,
          dark: mongoBrand.forestGreen,
          contrastText: mongoBrand.slateBlue,
        },
        secondary: {
          main: mongoBrand.blue,
          light: "#4A90FF",
          dark: "#0052C2",
          contrastText: mongoBrand.white,
        },
        success: {
          main: mongoBrand.springGreen,
          light: mongoBrand.mist,
          dark: mongoBrand.forestGreen,
        },
        info: {
          main: mongoBrand.blue,
        },
        warning: {
          main: mongoBrand.warningYellow,
          dark: "#E6AC00",
        },
        error: {
          main: "#E8714D",
          light: "#F09A7D",
          dark: mongoBrand.errorRed,
        },
        background: {
          default: mongoBrand.slateBlue,
          paper: mongoBrand.evergreen,
        },
        text: {
          primary: mongoBrand.white,
          secondary: mongoBrand.gray[200],
        },
        divider: "rgba(255, 255, 255, 0.12)",
      },
    },
  },
  typography: {
    fontFamily: "'Euclid Circular A', 'Lexend Deca', Arial, sans-serif",
    h1: {
      fontFamily: "'Source Serif Pro', Georgia, serif",
      fontWeight: 700,
      letterSpacing: "-0.02em",
      fontSize: "clamp(2rem, 5vw, 3.5rem)",
    },
    h2: {
      fontFamily: "'Source Serif Pro', Georgia, serif",
      fontWeight: 700,
      letterSpacing: "-0.01em",
      fontSize: "clamp(1.75rem, 4vw, 3rem)",
    },
    h3: {
      fontWeight: 600,
      fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
    },
    h4: {
      fontWeight: 600,
      fontSize: "clamp(1.25rem, 2.5vw, 2rem)",
    },
    h5: {
      fontWeight: 600,
      fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
    },
    h6: {
      fontWeight: 600,
      fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.02em",
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "code, pre, kbd, samp": {
          fontFamily: "'Source Code Pro', 'Courier New', monospace",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          ...theme.applyStyles("dark", {
            backgroundColor: theme.vars.palette.background.paper,
          }),
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: theme.vars.palette.background.paper,
            transition: "all 0.2s ease-in-out",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.vars.palette.primary.light,
              borderWidth: 2,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.vars.palette.primary.main,
              borderWidth: 2,
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: theme.vars.palette.primary.main,
          },
          "& .MuiFormHelperText-root": {
            marginLeft: 4,
            fontSize: "0.8rem",
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 12,
          boxShadow:
            "0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04)",
          border: `1px solid ${theme.vars.palette.divider}`,
          transition: "box-shadow 0.2s ease-in-out",
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none" as const,
          fontWeight: 600,
          padding: "10px 20px",
          transition: "all 0.2s ease-in-out",
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          },
        },
        outlined: {
          borderWidth: 1.5,
          "&:hover": {
            borderWidth: 1.5,
          },
        },
        sizeLarge: {
          padding: "12px 28px",
          fontSize: "1rem",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 500,
          border: "1px solid",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none" as const,
          fontWeight: 600,
          fontSize: "0.95rem",
          minHeight: 48,
          "&.Mui-selected": {
            color: theme.vars.palette.primary.main,
          },
        }),
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          height: 3,
          borderRadius: "3px 3px 0 0",
          backgroundColor: theme.vars.palette.primary.main,
        }),
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: ({ theme }) => ({
          "&.Mui-checked": {
            color: theme.vars.palette.primary.main,
            "& + .MuiSwitch-track": {
              backgroundColor: theme.vars.palette.primary.light,
              opacity: 0.7,
            },
          },
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.vars.palette.primary.main,
          fontWeight: 600,
          textDecoration: "none",
          "&:hover": {
            color: theme.vars.palette.primary.dark,
            textDecoration: "underline",
          },
        }),
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
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
        },
        elevation2: {
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.12)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.vars.palette.divider,
        }),
      },
    },
  },
});
