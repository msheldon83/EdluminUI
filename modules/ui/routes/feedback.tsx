import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";
import { useQueryBundle } from "graphql/hooks";
//DAVE: import { ThisWillBeTheNameOfMyGraphQLMethod } from "the-path-to-my-gen.ts";

// Feedback Route
export const AdminFeedbackRoute = defineSubRoute(AdminChromeRoute, "/feedback");

export const FeedbackLoader = asyncComponent({
  resolve: async () => {
    const feedbackPage = (await import("ui/pages/feedback")).Feedback;
    return feedbackPage;
  },
  name: "Feedback",
});
