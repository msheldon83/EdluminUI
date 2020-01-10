import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const LocationGroupsRoute = defineSubRoute(
  AdminChromeRoute,
  "/location-groups"
);

export const LocationGroupsLoader = asyncComponent({
  resolve: async () => {
    const LocationGroupsPage = (await import("ui/pages/school-groups/index"))
      .LocationGroups;
    return LocationGroupsPage;
  },
  name: "LocationGroups",
});
