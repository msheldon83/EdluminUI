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
export const EmployeeAbsScheduleRoute = defineSubRoute(
  PersonViewRoute,
  "/schedule"
);

export const EmployeeAbsScheduleListViewRoute = defineSubRoute(
  EmployeeAbsScheduleRoute,
  "/list-view"
);
export const EmployeeAbsScheduleCalendarViewRoute = defineSubRoute(
  EmployeeAbsScheduleRoute,
  "/calendar-view"
);

export const EmployeeAbsScheduleLoader = asyncComponent({
  resolve: async () => {
    const EmployeeAbsSchedulePage = (
      await import("ui/pages/people/employee-abs-schedule")
    ).EmployeeAbsenceSchedulePage;
    return EmployeeAbsSchedulePage;
  },
  name: "EmployeeAbsSchedulePage",
});
