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
export const PayCodeViewEditRoute = defineSubRoute(
  PayCodeViewRoute,
  "/view",
  []
);

export const PayCodeViewEditLoader = asyncComponent({
  resolve: async () => {
    const PayCodeViewEditPage = (await import("ui/pages/pay-code/view"))
      .PayCodeViewEditPage;
    return PayCodeViewEditPage;
  },
  name: "PayCodeViewEditPage",
});
