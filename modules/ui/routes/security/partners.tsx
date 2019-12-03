import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "../app-chrome";
import { defineSubRoute } from "../definition";

export const SecurityPartnersRoute = defineSubRoute(
  AdminChromeRoute,
  "/security/partners"
);

export const SecurityPartnersLoader = asyncComponent({
  resolve: async () => {
    const SecurityPartnersPage = (
      await import("ui/pages/security-partners/index")
    ).SecurityPartners;
    return SecurityPartnersPage;
  },
  name: "SecurityPartners",
});
