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

  sectionBorder: "#d2d0d0",
  marigold: "#FFB946",

  edluminSlate: "#050039",
  edluminLightSlate: "#38336C",
  edluminSubText: "#9E9E9E",
  darkRed: "#C62828",
  primary: "#FF5555",

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

  yellow1: "rgba(255, 204, 1, 0.2)",
  yellow2: "rgba(255, 204, 1, 0.4)",
  yellow3: "rgba(255, 204, 1, 0.5)",
  yellow4: "rgba(255, 204, 1, 0.8)",
  yellow5: "rgba(255, 204, 1, 1)",
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
        padding: `0 ${pxToRem(12)}`,
      },
      notchedOutline: {
        borderColor: themeColors.edluminSubText,

        "&:hover": {
          borderColor: themeColors.edluminSubText,
        },
        "&:focus": {
          borderColor: themeColors.black,
        },
        "&:active": {
          borderColor: themeColors.black,
        },
      },
      root: {
        "&$focused $notchedOutline": {
          borderColor: themeColors.black,
          borderWidth: pxToRem(1),
        },
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
        fontSize: pxToRem(14),
        letterSpacing: pxToRem(1.25),

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
        borderBottom: 0,
      },
    },
    MuiTooltip: {
      popper: {
        opacity: 1,
      },
      tooltip: {
        backgroundColor: themeColors.white,
        color: themeColors.black,
        boxShadow:
          "0px 9px 18px rgba(0, 0, 0, 0.18), 0px 6px 5px rgba(0, 0, 0, 0.24);",
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
    MuiLink: {
      root: {
        color: themeColors.blue,
      },
    },
    /*
      The overrides for the calendar aren't really documented anywhere, so the keys and values
      can be found in this directory:

      https://github.com/mui-org/material-ui-pickers/blob/3d2e99089d/lib/src/views/Calendar/Calendar.tsx
    */
  },
  palette: {
    primary: {
      main: themeColors.primary,
    },
    secondary: {
      main: themeColors.darkGray,
    },
    error: {
      main: themeColors.darkRed,
    },
  },

  customColors: {
    ...themeColors,
  },
  customSpacing: {
    contentWidth: pxToRem(1140),
    navBarWidthExpanded: pxToRem(258),
    navBarWidthCompact: pxToRem(53),
  },

  actions: {
    primary: themeColors.edluminSlate,
    linksDeletion: themeColors.primary,
    disabled: themeColors.lightSlate,
    info: "#3D4ED7",
  },
  messages: {
    default: themeColors.edluminSlate,
    error: themeColors.darkRed,
    success: "#099E47",
    warning: "#FFCC01",
    help: "#3D4ED7",
  },
  status: {
    error: themeColors.primary,
    confirmed: "#099E47",
    notConfirmed: "#FFA000",
  },
  background: {
    default: themeColors.edluminSlate,
    confirmed: "#84CFA3",
    information: themeColors.lightSlate,
    hoverRow: "#d8dbf6",
    dropZone: themeColors.medLightGray,
  },
  calendar: {
    selected: themeColors.edluminSlate,
    unavailable: themeColors.lightSlate,
    disabled: "#E1E1E1",
    closed: "#FF5555",
    modified: "#FFCC01",
    inservice: "#6471DF",
    absence: {
      disabled: themeColors.lightGray,
      closed: "#FFBBBB",
      modified: "#FFF5CC",
      inservice: "#D8DCF7",
      existingAbsence: "#9B99B0",
      pendingApproval: themeColors.yellow4,
      denied: themeColors.darkRed,
    },
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
      letterSpacing: pxToRem(0.15),
    },
  }),
});
