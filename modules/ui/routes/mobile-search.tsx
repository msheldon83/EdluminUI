import { asyncComponent } from "ui/async-component";
import {
  AdminChromeRoute,
  EmployeeChromeRoute,
  SubstituteChromeRoute,
} from "./app-chrome";
import { defineSubRoute } from "./definition";

export const AdminMobileSearchRoute = defineSubRoute(
  AdminChromeRoute,
  "/mobilesearch"
);

export const EmpMobileSearchRoute = defineSubRoute(
  EmployeeChromeRoute,
  "/mobilesearch"
);

export const SubMobileSearchRoute = defineSubRoute(
  SubstituteChromeRoute,
  "/mobilesearch"
);

export const AdminMobileSearchLoader = asyncComponent({
  resolve: async () => {
    const AdminMobileSearchPage = (
      await import("ui/pages/mobile/admin-mobile-search")
    ).AdminMobileSearchPage;
    return AdminMobileSearchPage;
  },
  name: "AdminMobileSearchPage",
});

export const EmployeeMobileSearchLoader = asyncComponent({
  resolve: async () => {
    const EmployeeMobileSearchPage = (
      await import("ui/pages/mobile/employee-mobile-search")
    ).EmployeeMobileSearchPage;
    return EmployeeMobileSearchPage;
  },
  name: "EmployeeMobileSearchPage",
});

export const SubstituteMobileSearchLoader = asyncComponent({
  resolve: async () => {
    const SubstituteMobileSearchPage = (
      await import("ui/pages/mobile/substitute-mobile-search")
    ).SubstituteMobileSearchPage;
    return SubstituteMobileSearchPage;
  },
  name: "SubstituteMobileSearchPage",
});
