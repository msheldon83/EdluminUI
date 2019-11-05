import {
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  TextField,
} from "@material-ui/core";
import { OrgUserRole } from "graphql/server-types.gen";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useEndorsements } from "reference-data/endorsements";
import { OptionType, Select } from "ui/components/form/select";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import { FilterQueryParams } from "./filter-params";
import OptionsType from "@storybook/addon-knobs/dist/components/types/Options";

type Props = {};
export const FiltersByRole: React.FC<Props> = props => {
  const [filters] = useQueryParamIso(FilterQueryParams);

  switch (filters.roleFilter) {
    case OrgUserRole.Employee:
      return <EmployeeFilters />;
    case OrgUserRole.ReplacementEmployee:
      return <ReplacementEmployeeFilters />;
    case OrgUserRole.Administrator:
      return <AdministratorFilters />;
    case null:
    default:
      return <></>;
  }
};

export const EmployeeFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <>
      <Grid item md={3}>
        {/* position type */}
        <InputLabel className={classes.label}>{t("Position type")}</InputLabel>
        <TextField
          className={classes.textField}
          variant="outlined"
          name={"position-type"}
          select
          fullWidth
          value=""
        >
          <MenuItem value={""}>{}</MenuItem>
        </TextField>
      </Grid>
      <Grid item md={3}>
        {/* locations */}
        <InputLabel className={classes.label}>{t("Locations")}</InputLabel>
        <TextField
          className={classes.textField}
          variant="outlined"
          name={"location"}
          select
          fullWidth
          value=""
        >
          <MenuItem value={""}>{}</MenuItem>
        </TextField>
      </Grid>
    </>
  );
};

export const ReplacementEmployeeFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(PeopleRoute);
  const endorsements = useEndorsements(params.organizationId);
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);

  const endorsementOptions: OptionType[] = useMemo(
    () => endorsements.map(e => ({ label: e.name, value: e.id })),
    [endorsements]
  );
  const endorsementParams =
    filters.roleFilter === OrgUserRole.ReplacementEmployee
      ? filters.endorsements
      : [];

  const onChange = useCallback(
    (value /* OptionType[] */) => {
      const ids: number[] = value
        ? value.map((v: OptionType) => Number(v.value))
        : [];
      updateFilters({ endorsements: ids });
    },
    [updateFilters]
  );

  return (
    <Grid item md={3}>
      <InputLabel className={classes.selectLabel}>
        {t("Endorsements")}
      </InputLabel>
      <Select
        onChange={onChange}
        options={endorsementOptions}
        value={endorsementOptions.filter(
          e => e.value && endorsementParams.includes(Number(e.value))
        )}
        multi
      />
    </Grid>
  );
};

export const AdministratorFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <>
      <Grid item md={3}>
        <InputLabel className={classes.label}>
          {t("Manages position type")}
        </InputLabel>
        <TextField
          className={classes.textField}
          variant="outlined"
          name={"manages -position-type"}
          select
          fullWidth
          value=""
        >
          <MenuItem value={""}>{}</MenuItem>
        </TextField>
      </Grid>
      <Grid item md={3}>
        {/* locations */}
        <InputLabel className={classes.label}>
          {t("Manages locations")}
        </InputLabel>
        <TextField
          className={classes.textField}
          variant="outlined"
          name={"manages-location"}
          select
          fullWidth
          value=""
        >
          <MenuItem value={""}>{}</MenuItem>
        </TextField>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  label: {
    // color: theme.customColors.black,
    fontWeight: 500,
  },
  selectLabel: {
    fontWeight: 500,
    marginBottom: theme.typography.pxToRem(16),
  },
  textField: {
    marginTop: theme.spacing(2),
  },
}));
