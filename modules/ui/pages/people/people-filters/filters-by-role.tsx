import * as React from "react";
import { FilterQueryParams } from ".";
import { useQueryParamIso } from "hooks/query-params";
import { OrgUserRole } from "graphql/server-types.gen";
import { Grid, TextField, InputLabel, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {};
export const FiltersByRole: React.FC<Props> = props => {
  const [filters] = useQueryParamIso(FilterQueryParams);
  console.log("made it with role: ", filters.roleFilter);
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
      <Grid item container md={3}>
        {/* position type */}
        <InputLabel className={classes.label}>{t("Position type")}</InputLabel>
        <TextField
          className={classes.textField}
          variant="outlined"
          name={"position-type"}
          select
          fullWidth
        >
          {[]}
        </TextField>
      </Grid>
      <Grid item container md={3}>
        {/* locations */}
        <InputLabel className={classes.label}>{t("Locations")}</InputLabel>
        <TextField
          className={classes.textField}
          variant="outlined"
          name={"location"}
          select
          fullWidth
        >
          {[]}
        </TextField>
      </Grid>
    </>
  );
};

export const ReplacementEmployeeFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <>
      <Grid item container md={3}>
        <InputLabel className={classes.label}>{t("Endorsements")}</InputLabel>
        <TextField
          className={classes.textField}
          variant="outlined"
          name={"endorsements"}
          select
          fullWidth
        >
          {[]}
        </TextField>
      </Grid>
    </>
  );
};

export const AdministratorFilters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <>
      <Grid item container md={3}>
        <InputLabel className={classes.label}>
          {t("Manages position type")}
        </InputLabel>
        <TextField
          className={classes.textField}
          variant="outlined"
          name={"manages -position-type"}
          select
          fullWidth
        >
          {[]}
        </TextField>
      </Grid>
      <Grid item container md={3}>
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
        >
          {[]}
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
  textField: {
    marginTop: theme.spacing(2),
  },
}));
