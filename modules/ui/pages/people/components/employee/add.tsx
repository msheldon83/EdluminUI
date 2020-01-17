import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { useEffect } from "react";
import { PageTitle } from "ui/components/page-title";
import {
  PeopleRoute,
  EmployeeAddRoute,
  PersonViewRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { AddBasicInfo } from "../add-basic-info";
import { useHistory } from "react-router";
import { Information, editableSections, OrgUser } from "../information";
import { EmployeeInput, OrgUserRole } from "graphql/server-types.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { Typography, makeStyles } from "@material-ui/core";
import { SaveEmployee } from "../../graphql/employee/save-employee.gen";
import { GetOrgUserById } from "../../graphql/get-orguser-by-id.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";

export const EmployeeAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(EmployeeAddRoute);
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const [createEmployee] = useMutationBundle(SaveEmployee, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [name, setName] = React.useState<string | null>(null);

  // Save a new employee in state
  const [employee, setEmployee] = React.useState<EmployeeInput>({
    id: null,
    orgId: Number(params.organizationId),
    firstName: "",
    middleName: null,
    lastName: "",
    externalId: null,
    email: "",
  });

  const getOrgUser = useQueryBundle(GetOrgUserById, {
    variables: { id: params.orgUserId },
    skip: params.orgUserId === "new",
  });

  const orgUser =
    getOrgUser.state === "LOADING"
      ? undefined
      : getOrgUser?.data?.orgUser?.byId;

  useEffect(() => {
    if (orgUser) {
      setEmployee({
        ...employee,
        id: Number(orgUser.id),
        orgId: Number(params.organizationId),
        firstName: orgUser.firstName,
        middleName: orgUser.middleName,
        lastName: orgUser.lastName,
        externalId: orgUser.externalId,
        email: orgUser.email,
      });
      setInitialStepNumber(1);
    }
  }, [employee, orgUser, params.organizationId]);

  const handleCancel = () => {
    const url =
      params.orgUserId === "new"
        ? PeopleRoute.generate(params)
        : PersonViewRoute.generate(params);
    history.push(url);
  };

  const renderBasicInfoStep = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <AddBasicInfo
        orgUser={employee}
        onSubmit={(firstName, lastName, email, middleName, externalId) => {
          setEmployee({
            ...employee,
            firstName: firstName,
            middleName: middleName,
            email: email,
            lastName: lastName,
            externalId: externalId,
          });
          setStep(steps[1].stepNumber);
        }}
        onCancel={handleCancel}
        onNameChange={(firstName, lastName) => {
          firstName && lastName && setName(`${firstName} ${lastName}`);
        }}
      />
    );
  };

  const renderInformation = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <Information
        orgUser={employee}
        editing={editableSections.information}
        isSuperUser={false}
        selectedRole={OrgUserRole.Employee}
        isCreate={true}
        onSubmit={async (orgUser: any) => {
          const newEmployee = {
            ...employee,
            email: orgUser.email,
            address1: orgUser.address1,
            city: orgUser.city,
            state: orgUser.state,
            country: orgUser.country,
            postalCode: orgUser.postalCode,
            phoneNumber: orgUser.phoneNumber,
            dateOfBirth: orgUser.dateOfBirth,
            permissionSet: { id: orgUser.permissionSet.id },
          };
          setEmployee(newEmployee);
          const id = await create(newEmployee);
          if (id) {
            const viewParams = { ...params, orgUserId: id };
            history.push(PersonViewRoute.generate(viewParams));
          }
        }}
        onCancel={handleCancel}
      />
    );
  };

  const create = async (employee: EmployeeInput) => {
    const result = await createEmployee({
      variables: {
        employee,
      },
    });
    return result?.data?.orgUser?.saveEmployee?.id;
  };

  const steps: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Basic Info"),
      content: renderBasicInfoStep,
    },
    {
      stepNumber: 1,
      name: t("General Settings"),
      content: renderInformation,
    },
  ];
  const [initialStepNumber, setInitialStepNumber] = React.useState(
    steps[0].stepNumber
  );

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("Create new Employee")} />
        <Typography variant="h1">{name || ""}</Typography>
      </div>
      <Tabs
        steps={steps}
        isWizard={true}
        showStepNumber={true}
        initialStepNumber={initialStepNumber}
      ></Tabs>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  placeholder: {
    opacity: "0.2",
    filter: "alpha(opacity = 20)",
  },
}));
