import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { useEffect } from "react";
import { PageTitle } from "ui/components/page-title";
import { PeopleRoute, AdminAddRoute, PersonViewRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { AddBasicInfo } from "../add-basic-info";
import { useHistory } from "react-router";
import { Information, editableSections } from "../information";
import { AccessControl } from "./access-control";
import { FinishWizard } from "../finish-create-wizard";
import { AdministratorInput, OrgUserRole } from "graphql/server-types.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { Typography, makeStyles } from "@material-ui/core";
import { SaveAdmin } from "../../graphql/admin/save-administrator.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { GetAdminById } from "../../graphql/admin/get-admin-by-id-foradd.gen";

export const AdminAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(AdminAddRoute);
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const [createAdmin] = useMutationBundle(SaveAdmin, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [name, setName] = React.useState<string | null>(null);

  const defaultAdmin = {
    id: null,
    orgId: params.organizationId,
    firstName: "",
    middleName: null,
    lastName: "",
    externalId: null,
    email: "",
    inviteImmediately: null,
    accessControl: {
      allLocationIdsInScope: true,
      allPositionTypeIdsInScope: true,
    }, // TODO: this is temporary until we build the component to set access control
  };

  // Save a new admin in state
  const [admin, setAdmin] = React.useState<AdministratorInput>(defaultAdmin);

  const getOrgUser = useQueryBundle(GetAdminById, {
    variables: { id: params.orgUserId },
    skip: params.orgUserId === "new",
  });

  const orgUser =
    getOrgUser.state === "LOADING"
      ? undefined
      : getOrgUser?.data?.orgUser?.byId;

  // Cannot include "admin" in the list of dependencies because we are
  // also setting it here which results in an infinite render loop
  useEffect(
    () => {
      if (orgUser) {
        setAdmin({
          ...admin,
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
        });
        setInitialStepNumber(2);
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
        orgUser={admin}
        onSubmit={(firstName, lastName, email, middleName, externalId) => {
          setAdmin({
            ...admin,
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
        orgUser={admin}
        editing={editableSections.information}
        editable={true}
        isSuperUser={false}
        selectedRole={OrgUserRole.Administrator}
        isCreate={true}
        onSubmit={async (orgUser: any) => {
          const newAdmin = {
            ...admin,
            email: orgUser.email,
            address1: orgUser.address1,
            city: orgUser.city,
            state: orgUser.state,
            country: orgUser.country,
            postalCode: orgUser.postalCode,
            phoneNumber: orgUser.phoneNumber,
            dateOfBirth: orgUser.dateOfBirth,
          };
          setAdmin(newAdmin);
          setStep(steps[2].stepNumber);
        }}
        onCancel={handleCancel}
      />
    );
  };

  const renderAccessControl = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <AccessControl
        editing={"edit-access-control"}
        editable={true}
        label={t("Next")}
        orgId={params.organizationId}
        locations={[]}
        locationGroups={[]}
        positionTypes={[]}
        allLocationIdsInScope={
          orgUser?.originalAdministrator?.accessControl
            ?.allLocationIdsInScope ?? false
        }
        allPositionTypeIdsInScope={
          orgUser?.originalAdministrator?.accessControl
            ?.allPositionTypeIdsInScope ?? false
        }
        locationIds={orgUser?.originalAdministrator?.accessControl?.locationIds}
        locationGroupIds={
          orgUser?.originalAdministrator?.accessControl?.locationGroupIds
        }
        positionTypeIds={
          orgUser?.originalAdministrator?.accessControl?.positionTypeIds
        }
        isSuperUser={false}
        isCreate={true}
        onSubmit={async (orgUser: any) => {
          const newAdmin = {
            ...admin,
            ...orgUser,
          };
          setAdmin(newAdmin);
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
        orgUserFullName={`${admin.firstName} ${admin.lastName}`}
        orgUserType={t("admin")}
        orgId={params.organizationId}
        orgUserId={orgUser?.id}
        onSubmit={async (orgUser: any) => {
          const newAdmin = {
            ...admin,
            inviteImmediately: orgUser.inviteImmediately,
          };
          setAdmin(newAdmin);
          const id = await create(newAdmin);
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
                      `${admin.firstName} ${admin.lastName} successfully saved. Click to view.`
                    )}
                  </div>
                ),
              });

              setName(null);
              setAdmin(defaultAdmin);
              setStep(steps[0].stepNumber);
            } else history.push(PersonViewRoute.generate(viewParams));
          }
        }}
        onCancel={handleCancel}
      />
    );
  };

  const create = async (administrator: AdministratorInput) => {
    const result = await createAdmin({
      variables: {
        administrator,
      },
    });
    return result?.data?.orgUser?.saveAdministrator?.id;
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
      name: t("Access Control"),
      content: renderAccessControl,
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
        <PageTitle title={t("Create new Administrator")} />
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
