import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const AbsenceVacancyRulesRoute = defineSubRoute(
  AdminChromeRoute,
  "/absence-vacancy-rules"
);

export const AbsenceVacancyRulesLoader = asyncComponent({
  resolve: async () => {
    const AbsenceVacancyRulesPage = (
      await import("ui/pages/absence-vacancy-rules/index")
    ).AbsenceVacancyRules;
    return AbsenceVacancyRulesPage;
  },
  name: "AbsenceVacancyRules",
});
