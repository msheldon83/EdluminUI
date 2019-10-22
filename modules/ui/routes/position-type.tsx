import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const PositionTypeRoute = defineSubRoute(
  AdminChromeRoute,
  "/position-type"
);

export const PositionTypeLoader = asyncComponent({
  resolve: async () => {
    const PositionTypePage = (await import("ui/pages/position-type"))
      .PositionTypePage;
    return PositionTypePage;
  },
  name: "PositionTypePage",
});
