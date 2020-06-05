import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

// View
export const ApprovalViewRoute = defineSubRoute(
  AdminChromeRoute,
  "/approval-detail/:approvalStateId",
  ["approvalStateId"]
);

export const ApprovalViewLoader = asyncComponent({
  resolve: async () => {
    const ApprovalViewPage = (await import("ui/pages/approval-detail"))
      .ApprovalDetail;
    return ApprovalViewPage;
  },
  name: "ApprovalViewPage",
});
