import * as React from "react";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";
import { CreateAbsenceUI } from "./ui";

type Props = {};

export const CreateAbsence: React.FC<Props> = props => {
  const { organizationId } = useRouteParams(AdminCreateAbsenceRoute);
  return <CreateAbsenceUI organizationId={organizationId} />;
};
