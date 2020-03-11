import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const VacancyCreateRoute = defineSubRoute(
  AdminChromeRoute,
  "/vacancy/create"
);

export const VacancyViewRoute = defineSubRoute(
  AdminChromeRoute,
  "/vacancy/:vacancyId",
  ["vacancyId"]
);

export const VacancyCreateLoader = asyncComponent({
  resolve: async () => {
    const VacancyCreatePage = (await import("ui/pages/vacancy/create"))
      .VacancyCreate;
    return VacancyCreatePage;
  },
  name: "VacancyCreate",
});

export const VacancyViewLoader = asyncComponent({
  resolve: async () => {
    const VacancyViewPage = (await import("ui/pages/vacancy/view")).VacancyView;
    return VacancyViewPage;
  },
  name: "VacancyView",
});
