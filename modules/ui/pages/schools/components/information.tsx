import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { makeStyles, Grid, Typography } from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { useHistory, Redirect } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { Location } from "graphql/server-types.gen";
import {
  LocationViewRoute,
  LocationEditSettingsRoute,
} from "ui/routes/locations";

type Props = {
  location: Location;
};

export const LocationsInformation: React.FC<Props> = props => {
  const classes = useStyles();
  const history = useHistory();
  const { t } = useTranslation();
  const params = useRouteParams(LocationViewRoute);

  const [editing, setEditing] = React.useState<boolean>(false);

  if (props.location === undefined) {
    return <></>;
  }

  return (
    <Section className={classes.customSection}>
      <SectionHeader
        title={t("Information")}
        action={{
          text: t("Edit"),
          visible: !editing,
          execute: () => {
            const editSettingsUrl = LocationEditSettingsRoute.generate(params);
            history.push(editSettingsUrl);
          },
          permissions: [PermissionEnum.LocationSave],
        }}
      />
      <Grid container spacing={2}>
        <Grid container item xs={12} spacing={2}>
          <Typography variant="h6">{t("Address")}</Typography>
        </Grid>
        <Grid container item xs={12} className={classes.label}>
          <Typography>
            {`${props.location.address1 ?? ""} ${props.location.address2 ??
              ""}`}
          </Typography>
        </Grid>
        <Grid container item xs={12} className={classes.label}>
          <Typography>
            {`${props.location.city ?? ""}, ${props.location.state ??
              ""} ${props.location.postalCode ?? ""}`}
          </Typography>
        </Grid>
        <Grid container item xs={12} spacing={2} className={classes.label}>
          <Typography variant="h6">{t("Phone")}</Typography>
        </Grid>
        <Grid container item xs={12} spacing={2} className={classes.label}>
          <Typography>{`${props.location.formattedPhone ?? ""}`}</Typography>
        </Grid>
      </Grid>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  customSection: {
    borderRadius: `0 0 ${theme.typography.pxToRem(
      4
    )} ${theme.typography.pxToRem(4)}`,
  },
  label: {
    padding: theme.spacing(2),
  },
}));
