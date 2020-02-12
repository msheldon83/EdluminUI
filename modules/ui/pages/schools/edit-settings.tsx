import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { makeStyles, Grid, Typography } from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { Location } from "graphql/server-types.gen";
import { LocationViewRoute } from "ui/routes/locations";

export const LocationEditSettingsPage: React.FC<{}> = props => {
  //const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(LocationViewRoute);

  return <>working</>;
};
