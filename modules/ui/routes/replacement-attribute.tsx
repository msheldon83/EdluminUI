import { asyncComponent } from "ui/async-component";
import { AdminChromeRoute } from "./app-chrome";
import { defineSubRoute } from "./definition";

export const ReplacementAttributeRoute = defineSubRoute(
  AdminChromeRoute,
  "/replacement-attribute"
);

export const ReplacementAttributeLoader = asyncComponent({
  resolve: async () => {
    const ReplacementAttributePage = (
      await import("ui/pages/replacement-attribute/index")
    ).ReplacementAttribute;
    return ReplacementAttributePage;
  },
  name: "ReplacementAttribute",
});
