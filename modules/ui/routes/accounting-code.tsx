import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const AccountingCodeRoute = defineSubRoute(
  AdminChromeRoute,
  "/accounting-code"
);

export const AccountingCodeLoader = asyncComponent({
  resolve: async () => {
    const AccountingCodePage = (await import("ui/pages/accounting-code/index"))
      .AccountingCode;
    return AccountingCodePage;
  },
  name: "AccountingCode",
});
