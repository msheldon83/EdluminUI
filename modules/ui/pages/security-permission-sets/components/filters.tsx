import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, InputLabel, makeStyles } from "@material-ui/core";
import { Select } from "ui/components/form/select";
import { useCallback, useMemo } from "react";
import { OrgUserRole } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  rolesFilter: OrgUserRole[];
  setRolesFilter: React.Dispatch<React.SetStateAction<OrgUserRole[]>>;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const roleOptions = useMemo(
    () => [
      { id: OrgUserRole.Invalid, label: "(All)" },
      { id: OrgUserRole.Administrator, label: "Admin" },
      { id: OrgUserRole.Employee, label: "Employee" },
      { id: OrgUserRole.ReplacementEmployee, label: "Substitute" },
    ],
    []
  );

  const selectedValue = roleOptions.find(
    e => e.label && props.rolesFilter.includes(e.id)
  ) ?? roleOptions.find(e => e.id === OrgUserRole.Invalid);

  const onChangeRoles = useCallback(
    value => {
      if (value.id === OrgUserRole.Invalid) {
        props.setRolesFilter([]);
      } else {
        props.setRolesFilter(value.id);
      }
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
            isClearable={false}
            onChange={onChangeRoles}
            options={roleOptions}
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
