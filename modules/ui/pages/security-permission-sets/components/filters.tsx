import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, InputLabel, makeStyles } from "@material-ui/core";
import { Select, OptionType } from "ui/components/form/select";
import { useCallback, useMemo, useEffect } from "react";
import { OrgUserRole } from "graphql/server-types.gen";
import { useDeferredState } from "hooks";
import { Input } from "ui/components/form/input";

type Props = {
  orgId: string;
  rolesFilter: OrgUserRole[];
  setRolesFilter: React.Dispatch<React.SetStateAction<OrgUserRole[]>>;
  setSearchText: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const Filters: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { setSearchText, setRolesFilter } = props;
  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);
  useEffect(() => {
    setSearchText(searchText);
  }, [searchText, setSearchText]);

  const roleOptions: OptionType[] = [
    { value: OrgUserRole.Invalid, label: "(All)" },
    { value: OrgUserRole.Administrator, label: "Admin" },
    { value: OrgUserRole.Employee, label: "Employee" },
    { value: OrgUserRole.ReplacementEmployee, label: "Substitute" },
  ];

  const findRole = (value: any) => {
    switch (value) {
      case "ADMINISTRATOR":
        return OrgUserRole.Administrator;
      case "EMPLOYEE":
        return OrgUserRole.Employee;
      case "REPLACEMENT_EMPLOYEE":
        return OrgUserRole.ReplacementEmployee;
      default:
        return OrgUserRole.Any;
    }
  };

  const selectedValue = roleOptions.find(e =>
    props.rolesFilter.length === 0
      ? roleOptions.find(e => e.value === OrgUserRole.Invalid)
      : props.rolesFilter.includes(findRole(e.value))
  );

  const onChangeRoles = useCallback(
    value => {
      if (value.value === OrgUserRole.Invalid) {
        setRolesFilter([]);
      } else {
        setRolesFilter([value.value]);
      }
    },
    [setRolesFilter]
  );

  const updateSearchText = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPendingSearchText(event.target.value);
    },
    [setPendingSearchText]
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
          <InputLabel className={classes.label}>{t("Role")}</InputLabel>
          <Select
            onChange={onChangeRoles}
            options={roleOptions}
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
