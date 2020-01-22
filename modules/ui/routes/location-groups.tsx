import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const LocationGroupsRoute = defineSubRoute(
  AdminChromeRoute,
  "/location-groups"
);

export const LocationGroupViewRoute = defineSubRoute(
  LocationGroupsRoute,
  "/:locationGroupId",
  ["locationGroupId"]
);

export const LocationGroupSubPrefRoute = defineSubRoute(
  LocationGroupViewRoute,
  "/substitute-preferences"
);

export const LocationGroupsLoader = asyncComponent({
  resolve: async () => {
    const LocationGroupsPage = (await import("ui/pages/school-groups/index"))
      .LocationGroups;
    return LocationGroupsPage;
  },
  name: "LocationGroups",
});

export const LocationGroupViewLoader = asyncComponent({
  resolve: async () => {
    const LocationGroupViewPage = (await import("ui/pages/school-groups/view"))
      .LocationGroupViewPage;
    return LocationGroupViewPage;
  },
  name: "LocationGroupViewPage",
});

export const LocationGroupSubPrefLoader = asyncComponent({
  resolve: async () => {
    const LocationGroupSubPrefPage = (
      await import("ui/pages/school-groups/substitute-preferences")
    ).LocationGroupSubstitutePreferencePage;
    return LocationGroupSubPrefPage;
  },
  name: "LocationGroupSubPrefPage",
});
