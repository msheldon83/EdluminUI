import { asyncComponent } from "ui/async-component";
import * as React from "react";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const PeopleRoute = defineSubRoute(AdminChromeRoute, "/people");

export const PeopleLoader = asyncComponent({
  resolve: async () => {
    const PeoplePage = (await import("ui/pages/people")).PeoplePage;
    return PeoplePage;
  },
  name: "People",
});
