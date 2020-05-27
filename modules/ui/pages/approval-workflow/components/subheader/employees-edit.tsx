import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import { useOrgUsers } from "ui/components/domain-selects/org-user-select/org-users";
import { OrgUserSelect } from "ui/components/domain-selects/org-user-select/org-user-select";
import { OrgUserRole } from "graphql/server-types.gen";
import { Check, Clear, Edit } from "@material-ui/icons";

type Props = {
  orgId: string;
  employeeIds: string[];
  isAllOthers: boolean;
  onSave?: (employeeIds: string[], isAllOthers: boolean) => void;
  editing: string | null;
  setEditing?: React.Dispatch<React.SetStateAction<string | null>>;
  editable: boolean;
};

export const editableSections = {
  employees: "edit-employees",
};

export const EmployeesEdit: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const allEmployees = useOrgUsers(props.orgId, OrgUserRole.Employee);

  const employeesText = props.isAllOthers
    ? t("All non-specified")
    : props.employeeIds.length === 0
    ? t("None")
    : allEmployees
        .filter(x => props.employeeIds.includes(x.id))
        .map(x => `${x.firstName} ${x.lastName}`)
        .join(", ");

  return (
    <Formik
      initialValues={{
        employeeIds: props.employeeIds,
        isAllOthers: props.isAllOthers,
      }}
      onSubmit={(data, e) => {
        if (props.onSave) {
          props.onSave(data.employeeIds, data.isAllOthers);
        }
      }}
    >
      {({ values, handleSubmit, submitForm, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          {props.editing !== editableSections.employees ? (
            <div className={classes.container}>
              <div className={classes.text}>{`${t(
                "For employees"
              )}: ${employeesText}`}</div>
              {props.editable && (
                <Edit
                  className={classes.editIcon}
                  onClick={() => {
                    props.setEditing!(editableSections.employees);
                  }}
                />
              )}
            </div>
          ) : (
            <div className={classes.container}>
              <div className={classes.text}>{`${t("For employees")}:  `}</div>
              <OrgUserSelect
                orgId={props.orgId}
                role={OrgUserRole.Employee}
                selectedOrgUserIds={values.employeeIds}
                includeAllOption={false}
                setSelectedOrgUserIds={(ids?: string[]) =>
                  setFieldValue("employeeIds", ids)
                }
                disabled={values.isAllOthers}
              />
              <Clear
                className={classes.icon}
                onClick={() => {
                  props.setEditing!(null);
                }}
              />
              <Check className={classes.icon} onClick={submitForm} />
            </div>
          )}
        </form>
      )}
    </Formik>
  );
};

const useStyles = makeStyles(theme => ({
  text: {
    fontSize: theme.typography.pxToRem(24),
  },
  container: {
    display: "flex",
    alignItems: "center",
  },
  icon: {
    cursor: "pointer",
    marginLeft: theme.spacing(1),
  },
  editIcon: {
    cursor: "pointer",
    color: theme.customColors.edluminSubText,
    height: theme.typography.pxToRem(15),
    width: theme.typography.pxToRem(15),
    marginLeft: theme.spacing(1),
  },
}));
