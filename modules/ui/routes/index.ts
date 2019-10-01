import { generatePath } from "react-router-dom";

export namespace Index {
  export const PATH_TEMPLATE = "/";

  export function generate() {
    return generatePath(PATH_TEMPLATE);
  }
}
