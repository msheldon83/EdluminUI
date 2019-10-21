import { generatePath } from "react-router";

export namespace AppChrome {
  export type Params = {
    organizationId: string;
    role: string;
  };
  export const PATH_TEMPLATE = "/:organizationId/:role";

  export function generate(params: Params) {
    return generatePath(PATH_TEMPLATE, params);
  }
}
