import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./../app-chrome";
import { defineSubRoute } from "./../definition";

export const AbsenceReasonRoute = defineSubRoute(AdminChromeRoute, "/reason");

export const AbsenceReasonLoader = asyncComponent({
  resolve: async () => {
    const AbsenceReasonPage = (await import("ui/pages/absence-reason/index"))
      .AbsenceReason;
    return AbsenceReasonPage;
  },
  name: "AbsenceReason",
});
