import * as React from "react";
import { Tab, Tabs, makeStyles, Paper } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { PermittedTab } from "ui/components/permitted-tab";
import {
  PersonViewRoute,
  AdminAddRoute,
  EmployeeAddRoute,
  SubstituteAddRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { useHistory } from "react-router";

type Props = {
  orgUser: {
    isAdmin: boolean;
    isEmployee: boolean;
    isReplacementEmployee: boolean;
    isShadowRecord: boolean;
  };
  selectedRole: OrgUserRole;
  setSelectedRole: React.Dispatch<React.SetStateAction<OrgUserRole | null>>;
};

export const RoleTabs: React.FC<Props> = props => {
  const orgUser = props.orgUser;
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(PersonViewRoute);
  const history = useHistory();

  const updateRoleTab = (
    event: React.ChangeEvent<{}>,
    newSelectedRole: OrgUserRole
  ) => {
    switch (newSelectedRole) {
      case OrgUserRole.Employee:
        if (!orgUser.isEmployee) {
          history.push(EmployeeAddRoute.generate(params));
        }
        break;
      case OrgUserRole.Administrator:
        if (!orgUser.isAdmin) {
          history.push(AdminAddRoute.generate(params));
        }
        break;
      case OrgUserRole.ReplacementEmployee:
        if (!orgUser.isReplacementEmployee) {
          history.push(SubstituteAddRoute.generate(params));
        }
        break;
    }
    props.setSelectedRole(newSelectedRole);
  };

  return (
    <>
      <Paper square elevation={0} className={classes.tabs}>
        <Tabs
          value={props.selectedRole}
          indicatorColor="primary"
          textColor="primary"
          onChange={updateRoleTab}
          aria-label="person-role-selector"
        >
          {orgUser.isAdmin && (
            <PermittedTab
              label={t("Administrator")}
              value={OrgUserRole.Administrator}
              className={classes.selectableTab}
              permissions={[PermissionEnum.AdminView]}
            />
          )}
          {orgUser.isEmployee && (
            <PermittedTab
              label={t("Employee")}
              value={OrgUserRole.Employee}
              className={classes.selectableTab}
              permissions={[PermissionEnum.EmployeeView]}
            />
          )}
          {orgUser.isReplacementEmployee && (
            <PermittedTab
              label={t("Substitute")}
              value={OrgUserRole.ReplacementEmployee}
              className={classes.selectableTab}
              permissions={[PermissionEnum.SubstituteView]}
            />
          )}
          <Tab
            label={""}
            value={""}
            className={classes.hiddenTab}
            disabled={true}
          />
          {!orgUser.isAdmin && !orgUser.isShadowRecord && (
            <PermittedTab
              label={t("Administrator")}
              value={OrgUserRole.Administrator}
              className={classes.selectableTab}
              permissions={[PermissionEnum.AdminSave]}
            />
          )}
          {!orgUser.isEmployee && !orgUser.isShadowRecord && (
            <PermittedTab
              label={t("Employee")}
              value={OrgUserRole.Employee}
              className={classes.selectableTab}
              permissions={[PermissionEnum.EmployeeSave]}
            />
          )}
          {!orgUser.isReplacementEmployee && !orgUser.isShadowRecord && (
            <PermittedTab
              label={t("Substitute")}
              value={OrgUserRole.ReplacementEmployee}
              className={classes.selectableTab}
              permissions={[PermissionEnum.SubstituteSave]}
            />
          )}
        </Tabs>
      </Paper>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  selectableTab: {
    textTransform: "uppercase",
  },
  hiddenTab: {
    marginLeft: "auto",
    marginRight: -12,
  },
  valueMissing: {
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
  tabs: {
    backgroundColor: theme.customColors.white,
    border: `1px solid ${theme.customColors.sectionBorder}`,
    borderBottomWidth: 0,
    borderRadius: `${theme.typography.pxToRem(4)} ${theme.typography.pxToRem(
      4
    )} 0 0`,
  },
}));
