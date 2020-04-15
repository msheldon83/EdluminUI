import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute, AdminRootChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const AbsenceVacancyNotificationLogRoute = defineSubRoute(
  AdminChromeRoute,
  "absence/notificationlog/:vacancyId",
  ["vacancyId"]
);

export const VacancyNotificationLogRoute = defineSubRoute(
  AdminChromeRoute,
  "vacancy/notificationlog/:vacancyId",
  ["vacancyId"]
);

export const VacancyNotificationLogLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/vacancy-notification-log"))
      .VacancyNotificationLogIndex;
  },
});

export const UserNotificationLogRoute = defineSubRoute(
  AdminRootChromeRoute,
  "user/:userId/notificationlog",
  ["userId"]
);

export const UserNotificationLogLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/users/notification-log"))
      .UserNotificationLogIndex;
  },
});
