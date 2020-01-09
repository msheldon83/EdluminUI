import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "../app-chrome";
import { defineSubRoute } from "../definition";

// List
export const SecurityPermissionSetsRoute = defineSubRoute(
  AdminChromeRoute,
  "/security/permission-sets"
);

export const SecurityPermissionSetsLoader = asyncComponent({
  resolve: async () => {
    const SecurityPermissionSetsPage = (
      await import("ui/pages/security-permission-sets/index")
    ).SecurityPermissionSets;
    return SecurityPermissionSetsPage;
  },
  name: "SecurityPermissionSets",
});

// Add
export const SecurityPermissionSetsAddRoute = defineSubRoute(
  SecurityPermissionSetsRoute,
  "/add",
  []
);

export const SecurityPermissionSetsAddLoader = asyncComponent({
  resolve: async () => {
    const SecurityPermissionSetsAddPage = (
      await import("ui/pages/security-permission-sets/add")
    ).PermissionSetAddPage;
    return SecurityPermissionSetsAddPage;
  },
  name: "SecurityPermissionSetsAddPage",
});

// View/Edit
export const SecurityPermissionSetsViewRoute = defineSubRoute(
  SecurityPermissionSetsRoute,
  "/:permissionSetId",
  ["permissionSetId"]
);

export const SecurityPermissionSetsViewLoader = asyncComponent({
  resolve: async () => {
    const SecurityPermissionSetsViewPage = (
      await import("ui/pages/security-permission-sets/view")
    ).PermissionSetViewPage;
    return SecurityPermissionSetsViewPage;
  },
  name: "SecurityPermissionSetsViewPage",
});
