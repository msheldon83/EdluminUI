import * as React from "react";
import { Redirect } from "react-router-dom";
import {
  VerifyRoute,
  VerifyOverviewRoute,
} from "ui/routes/absence-vacancy/verify";
import { useRouteParams } from "ui/routes/definition";

export const VerifyPage: React.FC<{}> = props => {
  const params = useRouteParams(VerifyRoute);

  return <Redirect to={VerifyOverviewRoute.generate(params)} />;
};
