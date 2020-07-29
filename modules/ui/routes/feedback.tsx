import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";
import { useQueryBundle } from "graphql/hooks";

// Feedback Route
export const AdminFeedbackRoute = defineSubRoute(AdminChromeRoute, "/feedback");

export const FeedbackLoader = asyncComponent({
  resolve: async () => {
    const feedbackPage = (await import("ui/pages/feedback")).Feedback;
    return feedbackPage;
  },
  name: "Feedback",
});
