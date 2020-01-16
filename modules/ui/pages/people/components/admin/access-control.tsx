import * as React from "react";
import { Typography, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { Chip } from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";

const editableSections = {
  accessControl: "edit-access-control",
};

type Props = {
  editing: string | null;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  locations: Array<{ name: string } | null>;
  locationGroups: Array<{ name: string } | null>;
  positionTypes: Array<{ name: string } | null>;
  allLocationIdsInScope: boolean;
  allPositionTypeIdsInScope: boolean;
  isSuperUser: boolean;
};

export const AccessControl: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Access Control")}
          action={{
            text: t("Edit"),
            visible: !props.editing,
            execute: () => {
              props.setEditing(editableSections.accessControl);
            },
            permissions: [PermissionEnum.AdminSave],
          }}
          cancel={{
            text: t("Cancel"),
            visible: props.editing === editableSections.accessControl,
            execute: () => {
              props.setEditing(null);
            },
          }}
          submit={{
            text: t("Save"),
            visible: props.editing === editableSections.accessControl,
            execute: () => {
              props.setEditing(null);
            },
          }}
        />
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={8}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Manages Locations")}</Typography>
              <div>
                {props.allLocationIdsInScope || props.isSuperUser
                  ? t("All")
                  : props.locations.length === 0 &&
                    props.locationGroups.length === 0 &&
                    t("None")}
                {!props.allLocationIdsInScope &&
                  !props.isSuperUser &&
                  props.locations.length > 0 &&
                  props.locations.map(
                    (location: { name: string } | null) =>
                      location && (
                        <Chip
                          key={location.name}
                          label={location.name}
                          className={classes.locationChip}
                        />
                      )
                  )}
                {!props.allLocationIdsInScope &&
                  !props.isSuperUser &&
                  props.locationGroups.length > 0 &&
                  props.locationGroups.map(
                    (locationGroup: { name: string } | null) =>
                      locationGroup && (
                        <Chip
                          key={locationGroup.name}
                          label={locationGroup.name}
                          className={classes.locationGroupChip}
                        />
                      )
                  )}
              </div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Position type scope")}</Typography>
              <div>
                {props.allPositionTypeIdsInScope || props.isSuperUser
                  ? t("All")
                  : props.positionTypes.length === 0 && t("None")}
                {!props.allPositionTypeIdsInScope &&
                  !props.isSuperUser &&
                  props.positionTypes.length > 0 &&
                  props.positionTypes.map(
                    (positionType: { name: string } | null) =>
                      positionType && (
                        <Chip
                          key={positionType.name}
                          label={positionType.name}
                          className={classes.positionTypeChip}
                        />
                      )
                  )}
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  locationChip: {
    background: theme.customColors.mediumBlue,
    color: theme.customColors.white,
  },
  locationGroupChip: {
    background: theme.customColors.blue,
    color: theme.customColors.white,
  },
  positionTypeChip: {
    background: theme.customColors.blue,
    color: theme.customColors.white,
  },
}));
