import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const ContractsRoute = defineSubRoute(AdminChromeRoute, "/contracts");

export const ContractsLoader = asyncComponent({
  resolve: async () => {
    const ContractsPage = (await import("ui/pages/contracts/index")).Contracts;
    return ContractsPage;
  },
  name: "Contracts",
});
