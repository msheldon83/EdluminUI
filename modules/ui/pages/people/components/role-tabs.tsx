import * as React from "react";
import { Tab, Tabs, makeStyles, Paper } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { PermittedTab } from "ui/components/permitted-tab";

type Props = {
  orgUser: {
    isAdmin: boolean;
    isEmployee: boolean;
    isReplacementEmployee: boolean;
  };
  selectedRole: OrgUserRole;
  setSelectedRole: React.Dispatch<React.SetStateAction<OrgUserRole | null>>;
};

export const RoleTabs: React.FC<Props> = props => {
  const orgUser = props.orgUser;
  const { t } = useTranslation();
  const classes = useStyles();

  const updateRoleTab = (
    event: React.ChangeEvent<{}>,
    newSelectedRole: OrgUserRole
  ) => {
    switch (newSelectedRole) {
      case OrgUserRole.Employee:
        if (!orgUser.isEmployee) {
          // TODO Send user to a create screen
        }
        break;
      case OrgUserRole.Administrator:
        if (!orgUser.isAdmin) {
          // TODO Send user to a create screen
        }
        break;
      case OrgUserRole.ReplacementEmployee:
        if (!orgUser.isReplacementEmployee) {
          // TODO Send user to a create screen
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
          {!orgUser.isAdmin && (
            <PermittedTab
              label={t("Administrator")}
              value={OrgUserRole.Administrator}
              className={classes.selectableTab}
              permissions={[PermissionEnum.AdminSave]}
            />
          )}
          {!orgUser.isEmployee && (
            <PermittedTab
              label={t("Employee")}
              value={OrgUserRole.Employee}
              className={classes.selectableTab}
              permissions={[PermissionEnum.EmployeeSave]}
            />
          )}
          {!orgUser.isReplacementEmployee && (
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
