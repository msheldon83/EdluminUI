import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, InputLabel, makeStyles } from "@material-ui/core";
import { OptionType, Select } from "ui/components/form/select";
import { usePermissionSets } from "reference-data/permission-sets";
import { useCallback, useMemo } from "react";
import { OrgUserRole } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  rolesFilter: string[];
  setRolesFilter: React.Dispatch<React.SetStateAction<string[]>>;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  //Select Options
  const roleOptions: OptionType[] = useMemo(
    () => [
      { id: OrgUserRole.Administrator, label: "Administrator" },
      { id: OrgUserRole.Employee, label: "Employee" },
      { id: OrgUserRole.ReplacementEmployee, label: "Substitute" },
    ],
    []
  );
  const onChangeRoles = useCallback(
    value => {
      const roleValues: string[] = value
        ? value.map((v: OptionType) => String(v.value))
        : [];
      props.setRolesFilter(roleValues);
    },
    [props.setRolesFilter]
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
          <InputLabel className={classes.label}>{t("Roles")}</InputLabel>
          <Select
            onChange={onChangeRoles}
            options={roleOptions}
            value={roleOptions.filter(
              e => e.value && props.rolesFilter.includes(e.value.toString())
            )}
            multi
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
  textField: {
    marginTop: theme.spacing(2),
  },
}));
