import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useScreenSize } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { CreateAbsenceUI } from "./ui";
import { useRouteParams } from "ui/routes/definition";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";

type Props = {};

export const CreateAbsence: React.FC<Props> = props => {
  const { organizationId } = useRouteParams(AdminCreateAbsenceRoute);
  return <CreateAbsenceUI organizationId={organizationId} />;
};
