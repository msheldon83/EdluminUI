import { Theme } from "@material-ui/core/styles/createMuiTheme";

interface CustomColors {
  appBackgroundGray: string;
  white: string;
  grayWhite: string;
  black: string;
  lightBlue: string;
  blue: string;
  darkBlue: string;
  gray: string;
  darkGray: string;
  darkBlueGray: string;
  medLightGray: string;
  lightGray: string;
  lighterGray: string;
  lightBlueGray: string;

  sectionBorder: string;

  eduBlue: string;
  eduBlack: string;
  edluminSlate: string;
  edluminLightSlate: string;
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
}

interface EdluminTheme extends Theme {
  customColors: CustomColors;
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
  }
  // allow configuration using `createMuiTheme`
  export interface ThemeOptions {
    customColors?: Partial<CustomColors>;
  }
}
