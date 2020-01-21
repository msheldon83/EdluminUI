import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const LocationsRoute = defineSubRoute(AdminChromeRoute, "/locations");

export const LocationsLoader = asyncComponent({
  resolve: async () => {
    const LocationsPage = (await import("ui/pages/schools/index")).Locations;
    return LocationsPage;
  },
  name: "Locations",
});

// View
export const LocationViewRoute = defineSubRoute(
  LocationsRoute,
  "/:locationId",
  ["locationId"]
);
export const LocationViewLoader = asyncComponent({
  resolve: async () => {
    const LocationViewPage = (await import("ui/pages/schools/index")).Locations;
    return LocationViewPage;
  },
  name: "LocationViewPage",
});
