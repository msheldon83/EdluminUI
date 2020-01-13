import { asyncComponent } from "ui/async-component";
import { defineRoute } from "./definition";

export const UnauthorizedRoleRoute = defineRoute("/:role/unauthorized", [
  "role",
]);
export const UnauthorizedRoute = defineRoute("/unauthorized");

export const UnauthorizedLoader = asyncComponent({
  resolve: async () => {
    const UnauthorizedPage = (await import("ui/pages/unauthorized"))
      .Unauthorized;
    return UnauthorizedPage;
  },
  name: "Unauthorized",
});
