import { generatePath, RouteComponentProps } from "react-router-dom";
import { asyncComponent } from "ui/async-component";
import * as React from "react";
import { AppChrome } from "./app-chrome";

export namespace Profile {
  export const PATH_TEMPLATE = `${AppChrome.PATH_TEMPLATE}/profile`;

  export type Params = AppChrome.Params;

  export function generate(params: Params) {
    return generatePath(PATH_TEMPLATE, params);
  }
}

export const ProfileLoader = asyncComponent({
  resolve: async () => {
    const ProfilePage = (await import("ui/pages/profile")).ProfilePage;
    return ProfilePage;
  },
  name: "ProfilePage",
});
