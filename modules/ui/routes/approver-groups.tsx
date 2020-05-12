import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const ApproverGroupsRoute = defineSubRoute(
  AdminChromeRoute,
  "/approver-groups"
);

export const ApproverGroupsLoader = asyncComponent({
  resolve: async () => {
    const ApproverGroupsPage = (await import("ui/pages/approver-groups/index"))
      .ApproverGroups;
    return ApproverGroupsPage;
  },
  name: "ApproverGroups",
});

//View
export const ApproverGroupViewRoute = defineSubRoute(
  ApproverGroupsRoute,
  "/:approverGroupId",
  ["approverGroupId"]
);

export const ApproverGroupViewLoader = asyncComponent({
  resolve: async () => {
    const ApproverGroupViewPage = (
      await import("ui/pages/approver-groups/view")
    ).ApproverGroupViewPage;
    return ApproverGroupViewPage;
  },
  name: "ApproverGroupViewPage",
});

// Add
export const ApproverGroupAddRoute = defineSubRoute(
  ApproverGroupsRoute,
  "/add",
  []
);

export const ApproverGroupAddLoader = asyncComponent({
  resolve: async () => {
    const ApproverGroupAddPage = (await import("ui/pages/approver-groups/add"))
      .ApproverGroupAddPage;
    return ApproverGroupAddPage;
  },
  name: "ApproverGroupAddPage",
});
