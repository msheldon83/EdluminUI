import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SecurityPermissionSetsRoute = defineSubRoute(
  AdminChromeRoute,
  "/security-permission-sets"
);

export const SecurityPermissionSetsLoader = asyncComponent({
  resolve: async () => {
    const SecurityPermissionSetsPage = (
      await import("ui/pages/security-permission-sets/index")
    ).SecurityPermissionSets;
    return SecurityPermissionSetsPage;
  },
  name: "SecurityPermissionSets",
});
