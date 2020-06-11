import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const ApprovalInboxRoute = defineSubRoute(
  AdminChromeRoute,
  "absence/approval-inbox"
);

export const ApprovalInboxLoader = asyncComponent({
  resolve: async () => {
    const ApprovalInboxPage = (await import("ui/pages/approval-inbox"))
      .ApprovalInbox;
    return ApprovalInboxPage;
  },
  name: "Approval Inbox",
});
