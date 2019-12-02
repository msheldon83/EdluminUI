import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const AbsenceVacancyVerifyRoute = defineSubRoute(
  AdminChromeRoute,
  "/absence-vacancy-verify"
);

export const AbsenceVacancyVerifyLoader = asyncComponent({
  resolve: async () => {
    const AbsenceVacancyVerifyPage = (
      await import("ui/pages/absence-vacancy-verify/index")
    ).AbsenceVacancyVerify;
    return AbsenceVacancyVerifyPage;
  },
  name: "AbsenceVacancyVerify",
});
