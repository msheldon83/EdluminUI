import { generatePath, RouteComponentProps } from "react-router-dom";
import { asyncComponent } from "ui/async-component";
import * as React from "react";

export namespace Profile {
  export const PATH_TEMPLATE = "/profile";

  export function generate() {
    return generatePath(PATH_TEMPLATE);
  }
}

export const ProfileLoader = asyncComponent({
  resolve: async () => {
    const ProfilePage = (await import("ui/pages/profile")).ProfilePage;
    return ProfilePage;
  },
  name: "ProfilePage",
});
