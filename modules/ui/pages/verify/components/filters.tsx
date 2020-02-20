import * as React from "react";
import { useTranslation } from "react-i18next";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  makeStyles,
} from "@material-ui/core";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { useLocations } from "reference-data/locations";
import { useCallback, useMemo } from "react";
import { OrganizationRelationshipType } from "graphql/server-types.gen";
import { GetOrganizationRelationships } from "../graphql/get-organization-relationships.gen";

type Props = {
  showVerified: boolean;
  orgId: string;
  setShowVerified: React.Dispatch<React.SetStateAction<boolean>>;
  locationsFilter: string[];
  subSourceFilter: string;
  setLocationsFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setSubSourceFilter: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const locations = useLocations(props.orgId);
  const locationOptions: OptionType[] = useMemo(
    () => locations.map(l => ({ label: l.name, value: l.id })),
    [locations]
  );

  //Get Option Types for Sub Source
  const getSubSources = useQueryBundle(GetOrganizationRelationships, {
    fetchPolicy: "cache-first",
    variables: { orgId: props.orgId },
  });

  const subSources = useMemo(() => {
    if (
      getSubSources.state === "DONE" &&
      getSubSources.data.organizationRelationship
    ) {
      return compact(getSubSources.data.organizationRelationship.all) ?? [];
    }
    return [];
  }, [getSubSources]);

  const subSourceOptions: OptionType[] = useMemo(() => {
    const delgateTo = subSources.filter(
      l => l.relationshipType === OrganizationRelationshipType.DelegatesTo
    );
    const options =
      delgateTo?.map(x => ({
        label: x.relatesToOrganization!.name,
        value: x.id,
      })) ?? [];
    options.unshift({ label: "My Organization", value: props.orgId });
    options.unshift({ label: "All", value: "0" });
    return options;
  }, [subSources]);

  const onChangeLocations = useCallback(
    (value /* OptionType[] */) => {
      const ids: string[] = value ? value.map((v: OptionType) => v.value) : [];
      props.setLocationsFilter(ids);
    },
    [props.setLocationsFilter]
  );

  const onChangeSubSource = useCallback(
    value => {
      let ids = value ?? value.map((v: OptionType) => v.value);
      if (ids === "0") ids = undefined;
      props.setSubSourceFilter(ids);
    },
    [props.setSubSourceFilter]
  );

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
          <InputLabel className={classes.label}>{t("Schools")}</InputLabel>
          <SelectNew
            onChange={onChangeLocations}
            options={locationOptions}
            value={locationOptions.filter(
              e => e.value && props.locationsFilter.includes(e.value.toString())
            )}
            multiple
          />
        </Grid>
        {subSourceOptions.length > 2 && (
          <Grid item xs={12} sm={6} md={3} lg={3}>
            <InputLabel className={classes.label}>
              {t("Substitute source")}
            </InputLabel>
            <SelectNew
              onChange={onChangeSubSource}
              options={subSourceOptions}
              value={subSourceOptions.find(
                e =>
                  e.value && props.subSourceFilter.includes(e.value.toString())
              )}
              multiple={false}
              withResetValue={false}
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
