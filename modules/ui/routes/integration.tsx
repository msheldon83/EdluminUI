import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

// Integrations root
export const IntegrationRoute = defineSubRoute(
  AdminChromeRoute,
  "/integration"
);

export const IntegrationLoader = asyncComponent({
  resolve: async () => {
    const IntegrationPage = (await import("ui/pages/integration/index"))
      .IntegrationList;
    return IntegrationPage;
  },
  name: "Integration",
});

// Integration view
export const IntegrationViewRoute = defineSubRoute(
  AdminChromeRoute,
  "/integration/:applicationGrantId",
  ["applicationGrantId"]
);

export const IntegrationViewLoader = asyncComponent({
  resolve: async () => {
    const IntegrationViewPage = (await import("ui/pages/integration/view"))
      .IntegrationView;
    return IntegrationViewPage;
  },
  name: "Integration",
});
