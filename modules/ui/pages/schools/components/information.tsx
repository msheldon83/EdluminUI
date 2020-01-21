import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { makeStyles, Grid, Typography } from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Location } from "graphql/server-types.gen";

type Props = {
  location: Location;
};

export const LocationsInformation: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

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
            setEditing(!editing);
          },
          permissions: [PermissionEnum.LocationSave],
        }}
        submit={{
          text: t("Save"),
          visible: editing,
          execute: () => {
            setEditing(false);
          },
          permissions: [PermissionEnum.LocationSave],
        }}
        cancel={{
          text: t("Cancel"),
          visible: editing,
          execute: () => {
            setEditing(false);
          },
          permissions: [PermissionEnum.LocationSave],
        }}
      />
      <Grid container>
        <Grid container item xs={12} spacing={2}>
          <Typography variant="h6">{t("Address")}</Typography>
        </Grid>
        <Grid container item xs={12} spacing={2} className={classes.label}>
          {`${props.location.address1 ?? ""} ${props.location.address2 ?? ""}`}
        </Grid>
        <Grid container item xs={12} spacing={2} className={classes.label}>
          {`${props.location.city ?? ""}, ${props.location.stateName ?? ""} $
            ${props.location.postalCode ?? ""}`}
        </Grid>

        <Grid container item xs={12} spacing={2} className={classes.label}>
          <Typography variant="h6">{t("Phone")}</Typography>
        </Grid>
        <Grid container item xs={12} spacing={2} className={classes.label}>
          {`${props.location.formattedPhone ?? ""}`}
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
    padding: theme.spacing(1),
  },
}));
