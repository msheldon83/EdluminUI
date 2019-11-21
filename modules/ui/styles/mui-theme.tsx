import createBreakpoints, {
  BreakpointsOptions,
} from "@material-ui/core/styles/createBreakpoints";
import createMuiTheme, { Theme } from "@material-ui/core/styles/createMuiTheme";

/*
  Material-UI's interface for defining the theme is imperfect.
  Specifically, it makes it difficult for a theme definition to reference itself
  to avoid repetition.

  I've worked around this for now by breaking definitions out into constants and
  copying some of the internals of createMuiTheme out into this file.
  (Such as pxToRem)

  Nothing from this file should be exported except PlacementTheme.
*/

/** do not export this */
const pxToRem = (size: number) => {
  const coeff = baseFontSize / 14;
  return `${(size / htmlFontSize) * coeff}rem`;
};

const smallFontSize = 12;
const baseFontSize = 14;
const htmlFontSize = 16;
const fontWeightMedium = 500;
const fontWeightRegular = 400;
const fontWeightLight = 300;

const themeColors: Theme["customColors"] = {
  /* Colors here are used by new app */
  appBackgroundGray: "#F2F2F2",
  white: "#ffffff",
  grayWhite: "#f7f7f7",
  lightBlue: "#E3F2FD",
  mediumBlue: "#90CAF9",
  darkBlueGray: "#4B506D",
  blue: "#2196F3",

  blueHover: "#0053CB",

  sectionBorder: "#e5e5e5",
  marigold: "#FFB946",

  edluminSlate: "#2B3648",
  edluminLightSlate: "#56657F",

  /* colors below are historical */
  black: "#262c36",
  darkBlue: "#031F3C",
  gray: "#b4b6b9",
  darkGray: "#6f6f6f",
  medLightGray: "#d8d8d8",
  lightGray: "#f4f4f4",
  lighterGray: "#fafafa",
  lightBlueGray: "#f4f7f9",

  /* the colors below are from placement */
  eduBlue: "#0a4e80",
  eduBlack: "#373637",

  raspberry: "#CC0079",
  pumpkin: "#E96B1C",
  mustard: "#CFAA2A",
  ocean: "#03A8A4",
  grape: "#B80FD5",
  twilight: "#37068F",
  sky: "#03a9f4",
  slate: "#6d6d6d",
  tomato: "#eb2626",
  grass: "#4caf50",

  lightTomato: "#FDE9E9",
  lightRaspberry: "#F9E5F1",
  lightPumpkin: "#FCF0E8",
  lightMustard: "#FAF6E9",
  lightOcean: "#E5F6F5",
  lightGrape: "#F7E7FA",
  lightTwilight: "#EAE6F3",
  lightSlate: "#F0F0F0",

  success: "#00c853",
  warning: "#ffa000",
  info: "#56657F",
};
const breakpointCustomization: BreakpointsOptions = {};
const breakpoints = createBreakpoints(breakpointCustomization);

export const EdluminTheme = createMuiTheme({
  breakpoints: breakpointCustomization,
  overrides: {
    MuiOutlinedInput: {
      input: {
        boxSizing: "border-box",
        fontSize: baseFontSize,
        height: pxToRem(44),
        padding: `0 ${pxToRem(14)}`,
      },
    },
    MuiButton: {
      contained: {
        color: themeColors.white,
        backgroundColor: themeColors.blue,
        textTransform: "uppercase",
        "&:hover": {
          backgroundColor: themeColors.blueHover,
        },
      },

      outlined: {
        backgroundColor: themeColors.white,
        color: themeColors.blue,
        textTransform: "uppercase",
        borderColor: themeColors.sectionBorder,
        borderWidth: pxToRem(1),
        transition: ` background-color 250ms cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1),
            border 250ms cubic-bezier(0.4, 0, 0.2, 1),
            color 250ms cubic-bezier(0.4, 0, 0.2, 1)`,
        "&$disabled": {
          borderWidth: pxToRem(1),
        },
        "&:hover": {
          backgroundColor: themeColors.edluminLightSlate,
          color: themeColors.white,
        },
      },
      root: {
        "&$disabled": {
          "& p": {
            opacity: 0.3,
          },
        },
      },
    },
    MuiDialog: {
      paper: {
        [breakpoints.down("xs")]: {
          margin: pxToRem(20),
        },
      },
    },
    MuiDialogTitle: {
      root: {
        [breakpoints.down("xs")]: {
          paddingTop: pxToRem(13),
          paddingBottom: pxToRem(10),
        },
      },
    },
    MuiDialogActions: {
      root: {
        paddingRight: pxToRem(4),
      },
      spacing: {
        // Style the typography inside of the MuiDialogAction component
        "& p": {
          fontWeight: fontWeightMedium,
          textTransform: "uppercase",
          [breakpoints.down("xs")]: {
            fontSize: pxToRem(smallFontSize),
          },
        },
      },
    },
    MuiDrawer: {
      modal: {
        zIndex: 1200,
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: `${pxToRem(1)} solid ${themeColors.gray}`,
      },
    },
    MuiTooltip: {
      popper: {
        opacity: 1,
      },
      tooltip: {
        backgroundColor: themeColors.white,
        color: themeColors.black,
      },
    },
    MuiFormLabel: {
      root: {
        fontWeight: "normal",
        color: themeColors.eduBlack,
        fontSize: pxToRem(14),
        lineHeight: pxToRem(21),
      },
    },
    MuiRadio: {
      colorPrimary: {
        color: themeColors.blue,
      },
    },
    MuiSelect: {
      iconOutlined: {
        // Override to match select with react-select positioning
        right: pxToRem(14),
      },
    },
    /*
      The overrides for the calendar aren't really documented anywhere, so the keys and values
      can be found in this directory:

      https://github.com/mui-org/material-ui-pickers/blob/3d2e99089d/lib/src/views/Calendar/Calendar.tsx
    */
    MuiPickersCalendar: {
      week: {
        "& [role='presentation']": {
          textAlign: "center",
          flex: 1,
        },
      },
    },
    MuiPickersCalendarHeader: {
      dayLabel: {
        color: themeColors.slate,
        flex: 1,
        width: "100%",
      },
    },
  },
  palette: {
    primary: {
      main: themeColors.blue,
    },
    secondary: {
      main: themeColors.darkGray,
    },
    error: {
      main: "#c62828",
    },
  },
  customColors: {
    ...themeColors,
  },
  typography: palette => ({
    color: themeColors.black,
    fontFamily: "Roboto",
    fontSize: baseFontSize,
    htmlFontSize: htmlFontSize,
    body1: {
      fontSize: pxToRem(14),
    },
    button: {
      fontSize: pxToRem(16),
      fontWeight: fontWeightMedium,
      color: palette.common.white,
      textTransform: "none",
      [breakpoints.down("xs")]: {
        fontSize: pxToRem(12),
      },
    },
    h1: {
      fontSize: pxToRem(48),
      fontWeight: "bold",
      [breakpoints.down("sm")]: {
        fontSize: pxToRem(30),
      },
    },
    h2: {
      fontSize: pxToRem(44),
      [breakpoints.down("sm")]: {
        fontSize: pxToRem(18),
      },
    },
    h3: {
      fontSize: pxToRem(38),
    },
    h4: {
      fontSize: pxToRem(32),
      fontWeight: "bold",
    },
    h5: {
      fontSize: pxToRem(24),
    },
    h6: {
      fontSize: pxToRem(16),
      fontWeight: "bold",
    },
  }),
});
