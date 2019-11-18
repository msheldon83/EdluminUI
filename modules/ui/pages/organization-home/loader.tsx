import { asyncComponent } from "ui/async-component";

export const OrganizationHomeLoader = asyncComponent({
  async resolve() {
    return (await import("./index")).OrganizationsHome;
  },
  name: "Organization Home",
});
