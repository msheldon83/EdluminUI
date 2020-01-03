import { asyncComponent } from "ui/async-component";
import { SubstituteChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SubSpecificOpportunityRoute = defineSubRoute(
  SubstituteChromeRoute,
  "opportunity/:vacancyId",
  ["vacancyId"]
);

export const SubSpecificOpportunityLoader = asyncComponent({
  resolve: async () => {
    const SubSpecificOpportunity = (
      await import("ui/pages/sub-specific-opportunity/index")
    ).SubSpecificOpportunity;
    return SubSpecificOpportunity;
  },
  name: "SubSpecificOpportunity",
});
