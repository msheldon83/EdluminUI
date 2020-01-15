import { useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { PeopleRoute, AdminAddRoute, PersonViewRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { AddBasicInfo } from "../add-basic-info";
import { useHistory } from "react-router";
import { Information, editableSections, OrgUser } from "../information";
import { AdministratorInput, OrgUserRole } from "graphql/server-types.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { Typography, makeStyles } from "@material-ui/core";
import { SaveAdmin } from "../../graphql/admin/save-administrator.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";

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
  const namePlaceholder = t("Mary Smith");

  const [admin, setAdmin] = React.useState<AdministratorInput>({
    orgId: Number(params.organizationId),
    firstName: "",
    middleName: null,
    lastName: "",
    externalId: null,
    email: "",
    accessControl: {
      allLocationIdsInScope: true,
      allPositionTypeIdsInScope: true,
    }, // TODO: this is temporary until we build the component to set access control
  });

  const renderBasicInfoStep = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <AddBasicInfo
        orgUser={admin}
        onSubmit={(firstName, lastName, email, middleName, externalId) => {
          setAdmin({
            ...admin,
            firstName: firstName,
            middleName: middleName,
            email: email,
            lastName: lastName,
            externalId: externalId,
          });
          setStep(steps[1].stepNumber);
        }}
        onCancel={() => {
          const url = PeopleRoute.generate(params);
          history.push(url);
        }}
        onNameChange={(firstName, lastName) => {
          firstName && lastName && setName(`${firstName} ${lastName}`);
        }}
        namePlaceholder={namePlaceholder}
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
        isSuperUser={false}
        selectedRole={OrgUserRole.Administrator}
        isCreate={true}
        onSubmit={async (orgUser: OrgUser, permissionSetId: number) => {
          const newAdmin = {
            ...admin,
            email: orgUser.email,
            address1: orgUser.address1,
            city: orgUser.city,
            stateId: orgUser.state,
            countryId: orgUser.country,
            postalCode: orgUser.postalCode,
            phoneNumber: orgUser.phoneNumber,
            dateOfBirth: orgUser.dateOfBirth,
            permissionSet: { id: permissionSetId },
          };
          setAdmin(newAdmin);
          const id = await create(newAdmin);
          const viewParams = { ...params, orgUserId: id! };
          history.push(PersonViewRoute.generate(viewParams));
        }}
        onCancel={() => {
          const url = PeopleRoute.generate(params);
          history.push(url);
        }}
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
  ];
  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("Create new Administrator")} />
        <Typography variant="h1">{name || ""}</Typography>
      </div>
      <Tabs steps={steps} isWizard={true} showStepNumber={true}></Tabs>
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
