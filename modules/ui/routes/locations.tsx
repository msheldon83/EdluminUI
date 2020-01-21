import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const LocationsRoute = defineSubRoute(AdminChromeRoute, "/locations");

export const LocationsViewRoute = defineSubRoute(
  LocationsRoute,
  "/:locationId",
  ["locationId"]
);

export const LocationsSubPrefRoute = defineSubRoute(
  LocationsViewRoute,
  "/substitute-preferences"
);

export const LocationsLoader = asyncComponent({
  resolve: async () => {
    const LocationsPage = (await import("ui/pages/schools/index")).Locations;
    return LocationsPage;
  },
  name: "Locations",
});

export const LocationsViewLoader = asyncComponent({
  resolve: async () => {
    const LocationsViewPage = (await import("ui/pages/schools/view"))
      .LocationsViewPage;
    return LocationsViewPage;
  },
  name: "LocationsViewPage",
});

export const LocationsSubPrefLoader = asyncComponent({
  resolve: async () => {
    const LocationsSubPrefPage = (
      await import("ui/pages/schools/substitute-preferences")
    ).LocationsSubstitutePreferencePage;
    return LocationsSubPrefPage;
  },
  name: "LocationsSubPrefPage",
});
