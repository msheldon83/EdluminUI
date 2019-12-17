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

// Index View
export const PayCodeIndexRoute = defineSubRoute(PayCodeRoute, "/:payCodeId", [
  "payCodeId",
]);
