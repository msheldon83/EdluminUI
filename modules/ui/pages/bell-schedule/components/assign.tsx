import { Grid, makeStyles, Typography } from "@material-ui/core";
import {
  Location,
  LocationGroup,
  PermissionEnum,
} from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useLocationGroups } from "reference-data/location-groups";
import { useLocations } from "reference-data/locations";
import { ActionButtons } from "ui/components/action-buttons";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Can } from "ui/components/auth/can";
import { useMemo } from "react";
import { Select, OptionType } from "ui/components/form/select";
import { LocationSelect } from "ui/components/reference-selects/location-select";

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

  const [locationIds, setLocationIds] = React.useState<string[]>(
    props.locationsAssigned.map(l => l.id)
  );
  const [locationGroupIds, setLocationGroupIds] = React.useState<string[]>(
    props.locationGroupsAssigned.map(l => l.id)
  );

  const locations = useLocations(props.organizationId) ?? [];
  const locationGroups = useLocationGroups(props.organizationId);

  const defaultLocationSelections = useMemo(() => {
    return props.locationsAssigned.map(l => {
      return { text: l.name, value: l.id };
    });
  }, [props.locationsAssigned]);

  const defaultLocationGroupSelections = useMemo(() => {
    return props.locationGroupsAssigned.map(l => {
      return { text: l.name, value: l.id };
    });
  }, [props.locationGroupsAssigned]);

  const groupsOptions: OptionType[] = React.useMemo(
    () =>
      locationGroups.map(l => ({
        label: l.name,
        value: l.id,
      })),
    [locationGroups]
  );

  const groupsValue = React.useMemo(
    () =>
      locationGroupIds.reduce((values: OptionType[], id: string | number) => {
        const value = groupsOptions.find(l => l.value === id);

        return value ? values.concat(value) : values;
      }, []),
    [groupsOptions, locationGroupIds]
  );

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
            <LocationSelect
              label={t("Schools")}
              orgId={props.organizationId}
              selectedLocationIds={locationIds}
              setSelectedLocationIds={ids =>
                ids ? setLocationIds(ids) : setLocationIds([])
              }
              includeAllOption={false}
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
            <Select
              label={t("Groups")}
              options={groupsOptions}
              multiple
              value={groupsValue}
              onChange={selections => {
                setLocationGroupIds(selections.map(s => s.value as string));
              }}
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
              props.onSubmit(locationIds, locationGroupIds);
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
