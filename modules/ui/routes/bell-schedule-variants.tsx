import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const BellScheduleVariantsRoute = defineSubRoute(
  AdminChromeRoute,
  "/bell-schedule-variants"
);

export const BellScheduleVariantsLoader = asyncComponent({
  resolve: async () => {
    const BellScheduleVariantsPage = (
      await import("ui/pages/bell-schedule-variants/index")
    ).BellScheduleVariants;
    return BellScheduleVariantsPage;
  },
  name: "BellScheduleVariants",
});

// Index View
export const BellScheduleVariantsIndexRoute = defineSubRoute(
  BellScheduleVariantsRoute,
  "/:workDayScheduleVariantTypeId",
  ["workDayScheduleVariantTypeId"]
);
