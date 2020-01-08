import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, InputLabel, makeStyles } from "@material-ui/core";
import { OptionType, Select } from "ui/components/form/select";
import { useCallback, useMemo } from "react";
import { useLocationGroups } from "reference-data/location-groups";
import { useRouteParams } from "ui/routes/definition";
import { LocationsRoute } from "ui/routes/locations";

type Props = {
  orgId: string;
  locationGroupFilter: number[];
  setLocationGroupFilter: React.Dispatch<React.SetStateAction<number[]>>;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(LocationsRoute);

  const locationGroups = useLocationGroups(params.organizationId);
  const locationGroupOptions: OptionType[] = useMemo(() => {
    const options = locationGroups.map(l => ({ label: l.name, value: l.id }));
    options.sort((a, b) => (a.label > b.label ? 1 : -1));
    options.unshift({ label: t("(All)"), value: "0" });
    return options;
  }, [locationGroups]);

  const selectedValue =
    locationGroupOptions.find(
      (e: any) => e.label && props.locationGroupFilter.includes(e.value)
    ) ?? locationGroupOptions.find((e: any) => e.value === "0");

  const onChangeGroup = useCallback(
    value => {
      if (value.value === "0") {
        props.setLocationGroupFilter([]);
      } else {
        props.setLocationGroupFilter(value.value);
      }
    },
    [props.setLocationGroupFilter]
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
          <InputLabel className={classes.label}>{t("Group")}</InputLabel>
          <Select
            isClearable={false}
            onChange={onChangeGroup}
            options={locationGroupOptions}
            value={selectedValue}
          />
        </Grid>
      </Grid>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  label: {
    fontWeight: 500,
    marginBottom: theme.typography.pxToRem(4),
  },
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
