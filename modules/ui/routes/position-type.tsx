import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

// List
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

// View/Edit
export const PositionTypeViewRoute = defineSubRoute(
  PositionTypeRoute,
  "/:positionTypeId",
  ["positionTypeId"]
);

export const PositionTypeViewLoader = asyncComponent({
  resolve: async () => {
    const PositionTypeViewPage = (await import("ui/pages/position-type/view"))
      .PositionTypeViewPage;
    return PositionTypeViewPage;
  },
  name: "PositionTypeViewPage",
});

// Add
export const PositionTypeAddRoute = defineSubRoute(
  PositionTypeRoute,
  "/add",
  []
);

export const PositionTypeAddLoader = asyncComponent({
  resolve: async () => {
    const PositionTypeAddPage = (await import("ui/pages/position-type/add"))
      .PositionTypeAddPage;
    return PositionTypeAddPage;
  },
  name: "PositionTypeAddPage",
});
