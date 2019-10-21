import { generatePath } from "react-router-dom";
import { asyncComponent } from "ui/async-component";

export namespace PositionType {
  export const PATH_TEMPLATE = "/position-type";

  export function generate() {
    return generatePath(PATH_TEMPLATE);
  }
}

export const PositionTypeLoader = asyncComponent({
  resolve: async () => {
    const PositionTypePage = (await import("ui/pages/position-type"))
      .PositionTypePage;
    return PositionTypePage;
  },
  name: "PositionTypePage",
});
