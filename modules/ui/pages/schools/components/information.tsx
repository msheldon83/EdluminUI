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
        actions={[
          {
            text: t("Edit"),
            visible: !editing,
            execute: () => {
              const editSettingsUrl = LocationEditSettingsRoute.generate(
                params
              );
              history.push(editSettingsUrl);
            },
            permissions: [PermissionEnum.LocationSave],
          },
        ]}
      />
      <Grid container spacing={2}>
        <Grid container item xs={5} spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">{t("Address")}</Typography>
            <div>
              {`${props.location.address1 ?? ""}`}
            </div>
            <div>
              {`${props.location.address2 ?? ""}`}
            </div>
            <div>
              {`${props.location.city ?? ""}, ${props.location.state ??
                ""} ${props.location.postalCode ?? ""}`}
            </div>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">{t("Notes")}</Typography>
            <div className={classes.wordBreak}>{`${props.location.notes ??
              ""}`}</div>
          </Grid>
        </Grid>
        <Grid container item xs={5} spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">{t("Phone")}</Typography>
            <div>{`${props.location.formattedPhone ?? ""}`}</div>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">{t("School Group")}</Typography>
            <div>{`${props.location.locationGroup?.name ?? ""}`}</div>
          </Grid>
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
  wordBreak: {
    wordBreak: "break-word",
  },
}));
