import * as React from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { makeStyles, Grid, Typography } from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { LocationGroup } from "graphql/server-types.gen";

type Props = {
  locationGroup: LocationGroup;
};

export const LocationGroupInformation: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [editing, setEditing] = React.useState<boolean>(false);

  if (props.locationGroup === undefined) {
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
          permissions: [PermissionEnum.LocationGroupSave],
        }}
        submit={{
          text: t("Save"),
          visible: editing,
          execute: () => {
            setEditing(false);
          },
          permissions: [PermissionEnum.LocationGroupSave],
        }}
        cancel={{
          text: t("Cancel"),
          visible: editing,
          execute: () => {
            setEditing(false);
          },
          permissions: [PermissionEnum.LocationGroupSave],
        }}
      />
      <Grid container></Grid>
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
