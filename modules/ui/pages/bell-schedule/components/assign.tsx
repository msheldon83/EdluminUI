import { Grid, makeStyles } from "@material-ui/core";
import { Location, LocationGroup } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useLocationGroups } from "reference-data/location-groups";
import { useLocations } from "reference-data/locations";
import { ActionButtons } from "ui/components/action-buttons";
import { ChipInputAutoSuggest } from "ui/components/chip-input-autosuggest";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  locationIds: Array<number>;
  locationGroupIds: Array<number>;
  organizationId: string;
  submitLabel?: string;
  onSubmit: (
    locationIds: Array<number>,
    locationGroupIds: Array<number>
  ) => void;
  onCancel: () => void;
};

export const Assign: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const [locationIds, setLocationIds] = React.useState<Array<number>>(
    props.locationIds
  );
  const [locationGroupIds, setLocationGroupIds] = React.useState<Array<number>>(
    props.locationGroupIds
  );
  const locations = useLocations(props.organizationId);
  const locationGroups = useLocationGroups(props.organizationId);

  if (
    !locations ||
    !locations.length ||
    !locationGroups ||
    !locationGroups.length
  ) {
    return <></>;
  }

  const defaultLocationSelections = locations
    .filter((l: Pick<Location, "id">) =>
      props.locationIds.includes(Number(l.id))
    )
    .map((l: Pick<Location, "id" | "name">) => {
      return { text: l.name, value: l.id };
    });
  const defaultLocationGroupSelections = locationGroups
    .filter((l: Pick<LocationGroup, "id">) =>
      props.locationGroupIds.includes(Number(l.id))
    )
    .map((l: Pick<LocationGroup, "id" | "name">) => {
      return { text: l.name, value: l.id };
    });

  return (
    <Section>
      <SectionHeader title={t("Assigned to")} />
      <Grid container spacing={2} className={classes.assignSection}>
        <Grid item xs={5}>
          <ChipInputAutoSuggest
            label={t("Schools")}
            defaultSelections={defaultLocationSelections}
            dataSource={locations.map((l: Pick<Location, "id" | "name">) => {
              return { text: l.name, value: l.id };
            })}
            onChange={selections => {
              setLocationIds(selections.map(s => Number(s.value)));
            }}
            fullWidth
          />
        </Grid>
        <Grid item xs={5}>
          <ChipInputAutoSuggest
            label={t("Groups")}
            defaultSelections={defaultLocationGroupSelections}
            dataSource={locationGroups.map(
              (l: Pick<LocationGroup, "id" | "name">) => {
                return { text: l.name, value: l.id };
              }
            )}
            onChange={selections => {
              setLocationGroupIds(selections.map(s => Number(s.value)));
            }}
            fullWidth
          />
        </Grid>
      </Grid>
      <ActionButtons
        submit={{
          text: props.submitLabel || t("Save"),
          execute: () => {
            props.onSubmit(locationIds, locationGroupIds);
          },
        }}
        cancel={{ text: t("Cancel"), execute: props.onCancel }}
      />
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  assignSection: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(8),
  },
}));
