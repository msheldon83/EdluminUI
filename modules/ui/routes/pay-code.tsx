import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const PayCodeRoute = defineSubRoute(AdminChromeRoute, "/pay-code");

export const PayCodeLoader = asyncComponent({
  resolve: async () => {
    const PayCodePage = (await import("ui/pages/pay-code/index")).PayCode;
    return PayCodePage;
  },
  name: "PayCode",
});

// View/Edit
export const PayCodeViewRoute = defineSubRoute(PayCodeRoute, "/:payCodeId", [
  "payCodeId",
]);

export const PayCodeViewLoader = asyncComponent({
  resolve: async () => {
    const PayCodeViewPage = (await import("ui/pages/pay-code/view"))
      .PayCodeViewPage;
    return PayCodeViewPage;
  },
  name: "PayCodeViewPage",
});

// Add
export const PayCodeAddRoute = defineSubRoute(PayCodeRoute, "/add", []);

export const PayCodeAddLoader = asyncComponent({
  resolve: async () => {
    const PayCodeAddPage = (await import("ui/pages/pay-code/add"))
      .PayCodeAddPage;
    return PayCodeAddPage;
  },
  name: "PayCodeAddPage",
});

// Edit Settings
export const PayCodeEditSettingsRoute = defineSubRoute(
  PayCodeViewRoute,
  "/edit-settings",
  []
);

export const PayCodeEditSettingsLoader = asyncComponent({
  resolve: async () => {
    const PayCodeEditSettingsPage = (
      await import("ui/pages/pay-code/edit-settings")
    ).PayCodeEditSettingsPage;
    return PayCodeEditSettingsPage;
  },
  name: "PayCodeEditSettingsPage",
});
