import { generatePath, RouteComponentProps } from "react-router-dom";
import { asyncComponent } from "ui/async-component";
import * as React from "react";
import { AppChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const ProfileRoute = defineSubRoute(AppChromeRoute, "/profile");

export const ProfileLoader = asyncComponent({
  resolve: async () => {
    const ProfilePage = (await import("ui/pages/profile")).ProfilePage;
    return ProfilePage;
  },
  name: "ProfilePage",
});
