import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SchoolGroupsRoute = defineSubRoute(
  AdminChromeRoute,
  "/school-groups"
);

export const SchoolGroupsLoader = asyncComponent({
  resolve: async () => {
    const SchoolGroupsPage = (await import("ui/pages/school-groups/index"))
      .SchoolGroups;
    return SchoolGroupsPage;
  },
  name: "SchoolGroups",
});
