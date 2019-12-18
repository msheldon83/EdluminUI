import { asyncComponent } from "ui/async-component";
import { EmployeeChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const EmployeePtoBalanceRoute = defineSubRoute(
  EmployeeChromeRoute,
  "/pto-balance"
);

export const EmployeePtoBalanceLoader = asyncComponent({
  resolve: async () => {
    const EmployeePtoBalance = (
      await import("ui/pages/employee-pto-balances/index")
    ).EmployeePtoBalances;
    return EmployeePtoBalance;
  },
  name: "EmployeePtoBalance",
});
