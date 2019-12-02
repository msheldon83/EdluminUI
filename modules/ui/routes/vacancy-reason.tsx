import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const VacancyReasonRoute = defineSubRoute(
  AdminChromeRoute,
  "/vacancy-reason"
);

export const VacancyReasonLoader = asyncComponent({
  resolve: async () => {
    const VacancyReasonPage = (await import("ui/pages/vacancy-reason/index"))
      .VacancyReason;
    return VacancyReasonPage;
  },
  name: "VacancyReason",
});
