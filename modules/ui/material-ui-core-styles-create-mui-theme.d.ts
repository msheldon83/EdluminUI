import { Theme } from "@material-ui/core/styles/createMuiTheme";

interface EdluminTheme extends Theme {
  customColors: {
    appBackgroundGray: string;
    white: string;
    grayWhite: string;
    black: string;
    blue: string;
    darkBlue: string;
    gray: string;
    darkGray: string;
    medLightGray: string;
    lightGray: string;
    lighterGray: string;
    lightBlueGray: string;

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
  };
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
    customColors: {
      appBackgroundGray: string;
      white: string;
      grayWhite: string;
      black: string;
      blue: string;
      darkBlue: string;
      gray: string;
      darkGray: string;
      medLightGray: string;
      lightGray: string;
      lighterGray: string;
      lightBlueGray: string;

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
    };
  }
  // allow configuration using `createMuiTheme`
  export interface ThemeOptions {
    customColors?: {
      white?: string;
      grayWhite?: string;
      black?: string;
      blue?: string;
      darkBlue?: string;
      gray?: string;
      darkGray?: string;
      medLightGray?: string;
      lightGray?: string;
      lightBlueGray?: string;
      eduBlue?: string;
      eduBlack?: string;
      edluminSlate?: string;
      edluminLightSlate?: string;
      raspberry?: string;
      pumpkin?: string;
      mustard?: string;
      marigold?: string;
      ocean?: string;
      grape?: string;
      twilight?: string;
      sky?: string;
      slate?: string;
      tomato?: string;
      grass?: string;

      lightTomato?: string;
      lightRaspberry?: string;
      lightMustard?: string;
      lightOcean?: string;
      lightGrape?: string;
      lightTwilight?: string;
      lightSlate?: string;
    };
  }
}
