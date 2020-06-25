import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { OrgRelationshipSelect } from "ui/components/reference-selects/org-relationship-select";
import { useOrganizationRelationships } from "reference-data/organization-relationships";
import { LocationSelect } from "ui/components/reference-selects/location-select";

type Props = {
  showVerified: boolean;
  orgId: string;
  setShowVerified: React.Dispatch<React.SetStateAction<boolean>>;
  locationsFilter: string[];
  subSourceFilter: string;
  setLocationsFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setSubSourceFilter: React.Dispatch<React.SetStateAction<string>>;
};

export const DailyFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const subSources = useOrganizationRelationships(props.orgId);

  const onChangeSubSource = (orgId?: string | null) => {
    props.setSubSourceFilter(orgId ?? "");
  };

  const onChangeLocations = (locationIds?: string[]) => {
    props.setLocationsFilter(locationIds ?? []);
  };

  return (
    <>
      <Grid
        container
        alignItems="center"
        justify="flex-start"
        spacing={2}
        className={classes.filters}
      >
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <LocationSelect
            label={t("Schools")}
            orgId={props.orgId}
            selectedLocationIds={props.locationsFilter}
            setSelectedLocationIds={onChangeLocations}
          />
        </Grid>
        {subSources.length > 0 && (
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <OrgRelationshipSelect
              orgId={props.orgId}
              selectedOrgId={props.subSourceFilter}
              setSelectedOrgId={onChangeSubSource}
              label={t("Sub source")}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <FormControlLabel
            checked={props.showVerified}
            control={
              <Checkbox
                onChange={() => props.setShowVerified(!props.showVerified)}
              />
            }
            label={t("Show verified")}
          />
        </Grid>
      </Grid>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  label: {
    // color: theme.customColors.black,
    fontWeight: 500,
    marginBottom: theme.typography.pxToRem(16),
  },
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
