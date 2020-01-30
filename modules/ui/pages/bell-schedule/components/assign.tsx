import { Grid, makeStyles, Typography } from "@material-ui/core";
import {
  Location,
  LocationGroup,
  PermissionEnum,
} from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useLocationGroups } from "reference-data/location-groups";
import { useLocations } from "reference-data/locations";
import { ActionButtons } from "ui/components/action-buttons";
import { ChipInputAutoSuggest } from "ui/components/chip-input-autosuggest";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Can } from "ui/components/auth/can";
import { useMemo } from "react";

type Props = {
  locationsAssigned: Pick<Location, "id" | "name">[];
  locationGroupsAssigned: Pick<LocationGroup, "id" | "name">[];
  organizationId: string;
  submitLabel?: string;
  onSubmit: (
    locationIds: Array<string>,
    locationGroupIds: Array<string>
  ) => void;
  onCancel: () => void;
};

export const Assign: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [locationIds, setLocationIds] = React.useState<string[]>(
    props.locationsAssigned.map(l => l.id)
  );
  const [locationGroupIds, setLocationGroupIds] = React.useState<string[]>(
    props.locationGroupsAssigned.map(l => l.id)
  );
  const locations = useLocations(props.organizationId);
  const locationGroups = useLocationGroups(props.organizationId);

  const defaultLocationSelections = useMemo(() => {
    return props.locationsAssigned.map(l => {
      return { text: l.name, value: l.id };
    });
  }, [props.locationsAssigned]);
  const locationDataSource = useMemo(() => {
    const data = locations.map((l: Pick<Location, "id" | "name">) => {
      return { text: l.name, value: l.id };
    });

    defaultLocationSelections.forEach(l => {
      if (!data.includes(l)) {
        data.push(l);
      }
    });

    return data;
  }, [locations, defaultLocationSelections]);

  const defaultLocationGroupSelections = useMemo(() => {
    return props.locationGroupsAssigned.map(l => {
      return { text: l.name, value: l.id };
    });
  }, [props.locationGroupsAssigned]);
  const locationGroupDataSource = useMemo(() => {
    const data = locationGroups.map((l: Pick<LocationGroup, "id" | "name">) => {
      return { text: l.name, value: l.id };
    });

    defaultLocationGroupSelections.forEach(l => {
      if (!data.includes(l)) {
        data.push(l);
      }
    });

    return data;
  }, [locationGroups, defaultLocationGroupSelections]);

  if (
    !locations ||
    !locations.length ||
    !locationGroups ||
    !locationGroups.length
  ) {
    return <></>;
  }

  return (
    <Section>
      <SectionHeader title={t("Assigned to")} />
      <Grid container spacing={2} className={classes.assignSection}>
        <Can do={[PermissionEnum.ScheduleSettingsSave]}>
          <Grid item xs={5}>
            <ChipInputAutoSuggest
              label={t("Schools")}
              defaultSelections={defaultLocationSelections}
              dataSource={locationDataSource}
              onChange={selections => {
                setLocationIds(selections.map(s => s.value));
              }}
              fullWidth
            />
          </Grid>
        </Can>
        <Can not do={[PermissionEnum.ScheduleSettingsSave]}>
          <Grid item xs={5}>
            <Typography variant={"h6"}>{t("Schools")}</Typography>
            <Typography>
              {defaultLocationSelections.map(l => l.text).toString()}
            </Typography>
          </Grid>
        </Can>
        <Can do={[PermissionEnum.ScheduleSettingsSave]}>
          <Grid item xs={5}>
            <ChipInputAutoSuggest
              label={t("Groups")}
              defaultSelections={defaultLocationGroupSelections}
              dataSource={locationGroupDataSource}
              onChange={selections => {
                setLocationGroupIds(selections.map(s => s.value));
              }}
              fullWidth
            />
          </Grid>
        </Can>
        <Can not do={[PermissionEnum.ScheduleSettingsSave]}>
          <Grid item xs={5}>
            <Typography variant={"h6"}>{t("Groups")}</Typography>
            <Typography>
              {defaultLocationGroupSelections.map(l => l.text).toString()}
            </Typography>
          </Grid>
        </Can>
      </Grid>
      <Can do={[PermissionEnum.ScheduleSettingsSave]}>
        <ActionButtons
          submit={{
            text: props.submitLabel || t("Save"),
            execute: () => {
              props.onSubmit(
                locationIds.map(l => Number(l)),
                locationGroupIds.map(l => Number(l))
              );
            },
          }}
          cancel={{ text: t("Cancel"), execute: props.onCancel }}
        />
      </Can>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  assignSection: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(8),
  },
}));
