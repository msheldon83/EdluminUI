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
import { Information, editableSections } from "../information";
import {
  EmployeeInput,
  OrgUserRole,
  PositionInput,
  NeedsReplacement,
} from "graphql/server-types.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { Typography, makeStyles } from "@material-ui/core";
import { SaveEmployee } from "../../graphql/employee/save-employee.gen";
import { GetEmployeeById } from "../../graphql/employee/get-employee-by-id-foradd.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { PositionEditUI } from "ui/pages/employee-position/ui";
import { FinishWizard } from "../finish-create-wizard";
import {
  buildDaysOfTheWeek,
  buildNewPeriod,
} from "ui/pages/employee-position/components/helpers";
import { secondsToFormattedHourMinuteString } from "helpers/time";
import { compact } from "lodash-es";

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

  const defaultEmployee = {
    id: null,
    orgId: params.organizationId,
    firstName: "",
    middleName: null,
    lastName: "",
    externalId: null,
    inviteImmediately: null,
    email: "",
    position: {
      positionType: {
        id: "",
      },
      title: "",
      needsReplacement: NeedsReplacement.Yes,
      contract: {
        id: "",
      },
      hoursPerFullWorkDay: undefined,
      accountingCodeAllocations: null,
    },
  };

  // Save a new employee in state
  const [employee, setEmployee] = React.useState<EmployeeInput>(
    defaultEmployee
  );

  const getOrgUser = useQueryBundle(GetEmployeeById, {
    variables: { id: params.orgUserId },
    skip: params.orgUserId === "new",
  });

  const orgUser =
    getOrgUser.state === "LOADING"
      ? undefined
      : getOrgUser?.data?.orgUser?.byId;

  // Cannot include "employee" in the list of dependencies because we are
  // also setting it here which results in an infinite render loop
  useEffect(
    () => {
      if (orgUser) {
        setEmployee({
          ...employee,
          id: orgUser.id,
          orgId: params.organizationId,
          firstName: orgUser.firstName,
          middleName: orgUser.middleName,
          lastName: orgUser.lastName,
          externalId: orgUser.externalId,
          email: orgUser.email,
          address1: orgUser.address1,
          city: orgUser.city,
          state: orgUser.state,
          country: orgUser.country,
          postalCode: orgUser.postalCode,
          phoneNumber: orgUser.phoneNumber,
          dateOfBirth: orgUser.dateOfBirth,
          position: {
            positionType: {
              id: orgUser.originalEmployee?.primaryPosition?.positionTypeId,
            },
            title: orgUser.originalEmployee?.primaryPosition?.title,
            needsReplacement:
              orgUser.originalEmployee?.primaryPosition?.needsReplacement,
            contract: {
              id: orgUser.originalEmployee?.primaryPosition?.contractId,
            },
            hoursPerFullWorkDay:
              orgUser.originalEmployee?.primaryPosition?.hoursPerFullWorkDay,
            accountingCodeAllocations:
              orgUser.originalEmployee?.primaryPosition
                ?.accountingCodeAllocations,
            schedules: orgUser.originalEmployee?.primaryPosition?.schedules,
          },
        });
        setInitialStepNumber(1);
      }
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [orgUser, params.organizationId]
  );

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
        orgId={params.organizationId}
        orgUser={employee}
        onSubmit={(firstName, lastName, email, middleName, externalId) => {
          setEmployee({
            ...employee,
            firstName: firstName,
            middleName: middleName,
            email: email,
            lastName: lastName,
            externalId: externalId,
            skipMailGunValidation: true,
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
        editable={true}
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
          setStep(steps[2].stepNumber);
        }}
        onCancel={handleCancel}
      />
    );
  };

  const renderPosition = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <PositionEditUI
        submitLabel={t("Next")} // TODO: Change this label to "Next" if we add another step
        position={{
          positionTypeId: employee.position?.positionType?.id,
          title: employee.position?.title,
          needsReplacement: employee.position?.needsReplacement,
          contractId: employee.position?.contract?.id,
          hoursPerFullWorkDay: employee.position?.hoursPerFullWorkDay,
        }}
        accountingCodeAllocations={
          employee.position?.accountingCodeAllocations
            ? compact(employee.position.accountingCodeAllocations)
            : []
        }
        positionSchedule={employee.position?.schedules?.map(s => ({
          daysOfTheWeek:
            s?.daysOfTheWeek && s?.daysOfTheWeek.length > 0
              ? s.daysOfTheWeek.map(d => d)
              : buildDaysOfTheWeek(true),
          periods: s?.items?.map(i => ({
            locationId: i?.location?.id ?? "",
            bellScheduleId: i?.bellSchedule?.id,
            startTime: i?.startTime
              ? secondsToFormattedHourMinuteString(i?.startTime)
              : "",
            endTime: i?.endTime
              ? secondsToFormattedHourMinuteString(i?.endTime)
              : "",
            startPeriodId: i?.startPeriod?.id,
            endPeriodId: i?.endPeriod?.id,
            overMidnightConfirmed: false,
          })) ?? [buildNewPeriod(true)],
        }))}
        onSave={async (position: PositionInput) => {
          const newEmployee = {
            ...employee,
            position: {
              ...position,
              orgId: params.organizationId,
            },
          };
          setEmployee(newEmployee);
          setStep(steps[3].stepNumber);
        }}
        onCancel={handleCancel}
      />
    );
  };

  const renderFinish = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <FinishWizard
        orgUserFullName={`${employee.firstName} ${employee.lastName}`}
        orgUserType={t("employee")}
        orgId={params.organizationId}
        orgUserId={orgUser?.id}
        onSubmit={async (orgUser: any) => {
          const newEmployee = {
            ...employee,
            inviteImmediately: orgUser.inviteImmediately,
          };
          setEmployee(newEmployee);
          const id = await create(newEmployee);
          if (id) {
            const viewParams = { ...params, orgUserId: id };
            if (orgUser.createAnother) {
              openSnackbar({
                dismissable: true,
                autoHideDuration: 5000,
                status: "success",
                message: (
                  <div
                    onClick={() =>
                      history.push(PersonViewRoute.generate(viewParams))
                    }
                    className={classes.pointer}
                  >
                    {t(
                      `${employee.firstName} ${employee.lastName} successfully saved. Click to view.`
                    )}
                  </div>
                ),
              });

              setEmployee(defaultEmployee);
              setName(null);
              setStep(steps[0].stepNumber);
            } else history.push(PersonViewRoute.generate(viewParams));
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
    {
      stepNumber: 2,
      name: t("Position"),
      content: renderPosition,
    },
    {
      stepNumber: 3,
      name: t("Finish"),
      content: renderFinish,
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
  pointer: { cursor: "pointer" },
}));
