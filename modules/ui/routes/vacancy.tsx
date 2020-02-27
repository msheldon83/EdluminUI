import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const VacancyCreateRoute = defineSubRoute(
  AdminChromeRoute,
  "/vacancy/create"
);

export const VacancyCreateLoader = asyncComponent({
  resolve: async () => {
    const VacancyCreatePage = (await import("ui/pages/vacancy/create"))
      .VacancyCreate;
    return VacancyCreatePage;
  },
  name: "VacancyCreate",
});
