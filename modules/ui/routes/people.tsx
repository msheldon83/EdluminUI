import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const PeopleRoute = defineSubRoute(AdminChromeRoute, "/people");

export enum QueryParamKeys {
  name = "name",
  acitve = "active",
}

export type QueryParams = {
  name: string;
  active: boolean;
};

export const PersonViewRoute = defineSubRoute(PeopleRoute, "/:orgUserId", [
  "orgUserId",
]);

export const PersonViewLoader = asyncComponent({
  resolve: async () => {
    const PersonViewPage = (await import("ui/pages/people/view"))
      .PersonViewPage;
    return PersonViewPage;
  },
  name: "PersonViewPage",
});

export const PeopleLoader = asyncComponent({
  resolve: async () => {
    const PeoplePage = (await import("ui/pages/people")).PeoplePage;
    return PeoplePage;
  },
  name: "People",
});

//employee abs schedule
export const PersonAbsScheduleRoute = defineSubRoute(
  PersonViewRoute,
  "/schedule"
);

export const PersonAbsScheduleListViewRoute = defineSubRoute(
  PersonAbsScheduleRoute,
  "/list-view"
);
export const PersonAbsScheduleCalendarViewRoute = defineSubRoute(
  PersonAbsScheduleRoute,
  "/calendar-view"
);

export const PersonAbsScheduleLoader = asyncComponent({
  resolve: async () => {
    const PersonAbsSchedulePage = (
      await import("ui/pages/people/person-abs-schedule")
    ).PersonAbsenceSchedulePage;
    return PersonAbsSchedulePage;
  },
  name: "PersonAbsSchedulePage",
});
