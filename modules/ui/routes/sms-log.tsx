import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute, AdminRootChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const UserSmsLogRoute = defineSubRoute(
  AdminRootChromeRoute,
  "user/:userId/smsLog",
  ["userId"]
);

export const UserSmsLogLoader = asyncComponent({
  async resolve() {
    return (await import("ui/pages/users/sms-log")).SmsLogIndex;
  },
});
