import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SecurityManagedOrganizationsRoute = defineSubRoute(
  AdminChromeRoute,
  "/security-managed-organizations"
);

export const SecurityManagedOrganizationsLoader = asyncComponent({
  resolve: async () => {
    const SecurityManagedOrganizationsPage = (
      await import("ui/pages/security-managed-organizations/index")
    ).SecurityManagedOrganizations;
    return SecurityManagedOrganizationsPage;
  },
  name: "SecurityManagedOrganizations",
});
