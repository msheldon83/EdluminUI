import { asyncComponent } from "ui/async-component";
import { SubstituteChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const SubSpecificAssignmentRoute = defineSubRoute(
  SubstituteChromeRoute,
  "assignment/:assignmentId",
  ["assignmentId"]
);

export const SubSpecificAssignmentLoader = asyncComponent({
  resolve: async () => {
    const SubSpecificAssignment = (
      await import("ui/pages/sub-specific-assignment/index")
    ).SubSpecificAssignment;
    return SubSpecificAssignment;
  },
  name: "SubSpecificAssignment",
});
