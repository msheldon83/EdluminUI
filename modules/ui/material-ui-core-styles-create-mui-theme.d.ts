import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { Overrides } from "@material-ui/core/styles/overrides";
import { MuiPickersOverrides } from "@material-ui/pickers/typings/overrides";

interface CustomColors {
  appBackgroundGray: string;
  white: string;
  grayWhite: string;
  black: string;
  lightBlue: string;
  mediumBlue: string;
  blue: string;
  darkBlue: string;
  gray: string;
  darkGray: string;
  darkBlueGray: string;
  medLightGray: string;
  lightGray: string;
  lighterGray: string;
  lightBlueGray: string;

  blueHover: string;

  sectionBorder: string;

  eduBlue: string;
  eduBlack: string;
  edluminSlate: string;
  edluminLightSlate: string;
  edluminSubText: string;
  darkRed: string;
  primary: string;

  raspberry: string;
  pumpkin: string;
  mustard: string;
  marigold: string;
  ocean: string;
  grape: string;
  twilight: string;
  sky: string;
  slate: string;
  tomato: string;
  grass: string;

  lightTomato: string;
  lightRaspberry: string;
  lightPumpkin: string;
  lightMustard: string;
  lightOcean: string;
  lightGrape: string;
  lightTwilight: string;
  lightSlate: string;

  success: string;
  warning: string;
  info: string;

  yellow1: string;
  yellow2: string;
  yellow3: string;
  yellow4: string;
  yellow5: string;
}

type CustomSpacing = {
  contentWidth: string;
  navBarWidthExpanded: string;
  navBarWidthCompact: string;
};

type Actions = {
  primary: string;
  linksDeletion: string;
  disabled: string;
  info: string;
};

type Messages = {
  default: string;
  error: string;
  success: string;
  warning: string;
  help: string;
};

type Status = {
  error: string;
  confirmed: string;
  notConfirmed: string;
};

type Background = {
  default: string;
  confirmed: string;
  information: string;
  hoverRow: string;
  dropZone: string;
};

type Calendar = {
  selected: string;
  closedDay: string;
  unavailable: string;
  absence: {
    disabled: string;
    closed: string;
    modified: string;
    inservice: string;
    existingAbsence: string;
  };
};

interface EdluminTheme extends Theme {
  customColors: CustomColors;
  customSpacing: CustomSpacing;
  actions: Actions;
  messages: Messages;
  status: Status;
  background: Background;
  calendar: Calendar;
}

declare module "@material-ui/styles/defaultTheme" {
  // export interface DefaultTheme extends EdluminTheme {
  //   stuff: boolean;
  // }
  /* eslint-disable-next-line */
  export interface DefaultTheme extends EdluminTheme {}
}

declare module "@material-ui/core/styles/createMuiTheme" {
  export interface Theme {
    customColors: CustomColors;
    customSpacing: CustomSpacing;
    actions: Actions;
    messages: Messages;
    status: Status;
    background: Background;
    calendar: Calendar;
  }
  // allow configuration using `createMuiTheme`
  export interface ThemeOptions {
    customColors?: Partial<CustomColors>;
    customSpacing?: CustomSpacing;
    actions?: Actions;
    messages?: Messages;
    status?: Status;
    background?: Background;
    calendar?: Calendar;
  }
}

type overridesNameToClassKey = {
  [P in keyof MuiPickersOverrides]: keyof MuiPickersOverrides[P];
};

declare module "@material-ui/core/styles/overrides" {
  export interface ComponentNameToClassKey extends overridesNameToClassKey {} // eslint-disable-line
}
