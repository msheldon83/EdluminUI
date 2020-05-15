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
export const ApproverGroupHeaderViewRoute = defineSubRoute(
  ApproverGroupsRoute,
  "/:approverGroupHeaderId",
  ["approverGroupHeaderId"]
);

//View
export const ApproverGroupViewRoute = defineSubRoute(
  ApproverGroupsRoute,
  "/:approverGroupId",
  ["approverGroupId"]
);

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

//Add Location
export const ApproverGroupAddLocationsRoute = defineSubRoute(
  ApproverGroupHeaderViewRoute,
  "/add-location",
  []
);

export const ApproverGroupAddLocationsLoader = asyncComponent({
  resolve: async () => {
    const ApproverGroupLocationsPage = (
      await import("ui/pages/approver-groups/add-locations")
    ).ApproverGroupLocationsPage;
    return ApproverGroupLocationsPage;
  },
  name: "ApproverGroupLocationsPage",
});

//Add | Remove Members
export const ApproverGroupAddRemoveMembersRoute = defineSubRoute(
  ApproverGroupViewRoute,
  "/add-members",
  []
);

export const ApproverGroupAddRemoveMembersLoader = asyncComponent({
  resolve: async () => {
    const ApproverGroupAddRemoveMemberPage = (
      await import("ui/pages/approver-groups/add-remove-members")
    ).ApproverGroupAddRemoveMemberPage;
    return ApproverGroupAddRemoveMemberPage;
  },
  name: "ApproverGroupAddRemoveMemberPage",
});
