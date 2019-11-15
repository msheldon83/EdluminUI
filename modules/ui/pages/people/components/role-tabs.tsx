import * as React from "react";
import { Tab, Tabs, makeStyles, Paper } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { OrgUserRole } from "graphql/server-types.gen";

type Props = {
  orgUser: {
    isAdmin: boolean;
    isSuperUser: boolean;
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
      <Paper square>
        <Tabs
          value={props.selectedRole}
          indicatorColor="primary"
          textColor="primary"
          onChange={updateRoleTab}
          aria-label="person-role-selector"
        >
          {orgUser.isAdmin && (
            <Tab
              label={t("Administrator")}
              value={OrgUserRole.Administrator}
              className={classes.selectableTab}
            />
          )}
          {orgUser.isEmployee && (
            <Tab
              label={t("Employee")}
              value={OrgUserRole.Employee}
              className={classes.selectableTab}
            />
          )}
          {orgUser.isReplacementEmployee && (
            <Tab
              label={t("Substitute")}
              value={OrgUserRole.ReplacementEmployee}
              className={classes.selectableTab}
            />
          )}
          <Tab
            label={""}
            value={""}
            className={classes.hiddenTab}
            disabled={true}
          />
          {!orgUser.isAdmin && (
            <Tab
              label={t("Administrator")}
              value={OrgUserRole.Administrator}
              className={classes.selectableTab}
            />
          )}
          {!orgUser.isEmployee && (
            <Tab
              label={t("Employee")}
              value={OrgUserRole.Employee}
              className={classes.selectableTab}
            />
          )}
          {!orgUser.isReplacementEmployee && (
            <Tab
              label={t("Substitute")}
              value={OrgUserRole.ReplacementEmployee}
              className={classes.selectableTab}
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
}));
