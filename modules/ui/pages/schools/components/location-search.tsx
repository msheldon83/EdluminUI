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
  searchValue?: number[];
};

export const LocationSearch: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(LocationsRoute);

  const onChangeGroup = useCallback(value => {}, [props.searchValue]);

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
          <InputLabel className={classes.label}>{t("Search")}</InputLabel>
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
