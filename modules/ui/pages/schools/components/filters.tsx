import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, InputLabel, makeStyles } from "@material-ui/core";
import { Input } from "ui/components/form/input";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { useCallback, useMemo, useEffect } from "react";
import { useLocationGroups } from "reference-data/location-groups";
import { useDeferredState } from "hooks";
import { useRouteParams } from "ui/routes/definition";
import { LocationsRoute } from "ui/routes/locations";

type Props = {
  orgId: string;
  locationGroupFilter: number[];
  setSearchText: React.Dispatch<React.SetStateAction<string | undefined>>;
  setLocationGroupsFilter: React.Dispatch<React.SetStateAction<number[]>>;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(LocationsRoute);

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);
  useEffect(() => {
    props.setSearchText(searchText);
  }, [searchText]);

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
  );

  const locationGroups = useLocationGroups(params.organizationId);
  const locationGroupOptions = useMemo(() => {
    const options = locationGroups.map(l => ({ label: l.name, value: l.id }));
    options.sort((a, b) => (a.label > b.label ? 1 : -1));
    options.unshift({ label: t("(All)"), value: "0" });
    return options;
  }, [locationGroups]);

  console.log(props.locationGroupFilter);

  const selectedValue = locationGroupOptions.find(e =>
    props.locationGroupFilter.length === 0
      ? locationGroupOptions.find(e => e.value === "0")
      : e.label && props.locationGroupFilter.includes(Number(e.value))
  );

  const onChangeGroup = useCallback(
    value => {
      if (value.value === "0") {
        props.setLocationGroupsFilter([]);
      } else {
        props.setLocationGroupsFilter([Number(value.value)]);
      }
    },
    [props.setLocationGroupsFilter]
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
          <Input
            label={t("Name or ID")}
            value={pendingSearchText}
            onChange={updateSearchText}
            placeholder={t("Filter by name or ID")}
            className={classes.label}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <InputLabel className={classes.label}>{t("Group")}</InputLabel>
          <SelectNew
            onChange={onChangeGroup}
            options={locationGroupOptions}
            value={selectedValue}
            multiple={false}
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
