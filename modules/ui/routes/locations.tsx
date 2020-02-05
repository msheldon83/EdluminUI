import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const LocationsRoute = defineSubRoute(AdminChromeRoute, "/locations");

export const LocationViewRoute = defineSubRoute(
  LocationsRoute,
  "/:locationId",
  ["locationId"]
);

export const LocationSubPrefRoute = defineSubRoute(
  LocationViewRoute,
  "/substitute-preferences"
);

export const LocationsLoader = asyncComponent({
  resolve: async () => {
    const LocationsPage = (await import("ui/pages/schools/index")).Locations;
    return LocationsPage;
  },
  name: "Locations",
});

export const LocationViewLoader = asyncComponent({
  resolve: async () => {
    const LocationViewPage = (await import("ui/pages/schools/view"))
      .LocationViewPage;
    return LocationViewPage;
  },
  name: "LocationViewPage",
});

export const LocationSubPrefLoader = asyncComponent({
  resolve: async () => {
    const LocationSubPrefPage = (
      await import("ui/pages/schools/substitute-preferences")
    ).LocationSubstitutePreferencePage;
    return LocationSubPrefPage;
  },
  name: "LocationsSubPrefPage",
});

// Add
export const LocationAddRoute = defineSubRoute(LocationsRoute, "/add", []);

export const LocationAddLoader = asyncComponent({
  resolve: async () => {
    const LocationAddBasicInfo = (
      await import("ui/pages/schools/components/add-basic-info")
    ).LocationAddBasicInfo;
    return LocationAddBasicInfo;
  },
  name: "LocationAddBasicInfo",
});
