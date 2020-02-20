import * as React from "react";
import { useTranslation } from "react-i18next";
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

type Props = {
  showVerified: boolean;
  orgId: string;
  setShowVerified: React.Dispatch<React.SetStateAction<boolean>>;
  locationsFilter: string[];
  subSourceFilter: string[];
  setLocationsFilter: React.Dispatch<React.SetStateAction<string[]>>;
  setSubSourceFilter: React.Dispatch<React.SetStateAction<string[]>>;
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
  //const subSources = NEW QUERY

  const onChangeLocations = useCallback(
    (value /* OptionType[] */) => {
      const ids: string[] = value ? value.map((v: OptionType) => v.value) : [];
      props.setLocationsFilter(ids);
    },
    [props.setLocationsFilter]
  );

  const onChangeSubSource = useCallback(
    (value /* OptionType[] */) => {
      const ids: string[] = value ? value.map((v: OptionType) => v.value) : [];
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
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <InputLabel className={classes.label}>{t("Sub source")}</InputLabel>
          <SelectNew
            onChange={onChangeSubSource}
            options={locationOptions} // TODO
            value={locationOptions.filter(
              e => e.value && props.subSourceFilter.includes(e.value.toString())
            )}
            multiple={false}
          />
        </Grid>
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
