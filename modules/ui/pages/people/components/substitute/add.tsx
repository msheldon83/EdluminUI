import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { useEffect } from "react";
import { PageTitle } from "ui/components/page-title";
import {
  PeopleRoute,
  SubstituteAddRoute,
  PersonViewRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { AddBasicInfo } from "../add-basic-info";
import { useHistory } from "react-router";
import { Information, editableSections, OrgUser } from "../information";
import { SubstituteInput, OrgUserRole } from "graphql/server-types.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { Typography, makeStyles } from "@material-ui/core";
import { SaveSubstitute } from "../../graphql/substitute/save-substitute.gen";
import { FinishWizard } from "../finish-create-wizard";
import { GetSubstituteById } from "../../graphql/substitute/get-substitute-by-id-foradd.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { Attribute } from "ui/pages/sub-positions-attributes/types";
import { SubPositionTypesAndAttributesEdit } from "ui/pages/sub-positions-attributes/components/position-types-attributes";
import { ActionButtons } from "ui/components/action-buttons";
import { Section } from "ui/components/section";

export const SubstituteAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(SubstituteAddRoute);
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const [createSubstitute] = useMutationBundle(SaveSubstitute, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [name, setName] = React.useState<string | null>(null);
  const [initialStepNumber, setInitialStepNumber] = React.useState(0);

  const defaultSubstitute = {
    orgId: params.organizationId,
    firstName: "",
    middleName: null,
    lastName: "",
    externalId: null,
    email: "",
    inviteImmediately: null,
  };

  // Save a new substitute in state
  const [substitute, setSubstitute] = React.useState<SubstituteInput>(
    defaultSubstitute
  );
  const [subAttributes, setSubAttributes] = React.useState<Attribute[]>([]);

  const getOrgUser = useQueryBundle(GetSubstituteById, {
    variables: { id: params.orgUserId },
    skip: params.orgUserId === "new",
  });

  const orgUser =
    getOrgUser.state === "LOADING"
      ? undefined
      : getOrgUser?.data?.orgUser?.byId;

  // Cannot include "substitute" in the list of dependencies because we are
  // also setting it here which results in an infinite render loop
  useEffect(() => {
    if (orgUser) {
      setSubstitute({
        ...substitute,
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
      setInitialStepNumber(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgUser, params.organizationId]);

  useEffect(() => {
    if (orgUser) {
      setSubAttributes(
        orgUser.originalSubstitute?.attributes.map(o => ({
          endorsementId: o.endorsement.id,
          name: o.endorsement.name,
          expirationDate: o.expirationDate,
          expires: o.endorsement.expires,
        })) ?? []
      );
    }
  }, [orgUser]);

  const handleCancel = () => {
    const url =
      params.orgUserId === "new"
        ? PeopleRoute.generate(params)
        : PersonViewRoute.generate(params);
    history.push(url);
  };

  const renderBasicInfoStep = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    goToNextStep: () => void
  ) => {
    return (
      <AddBasicInfo
        orgId={params.organizationId}
        orgUser={substitute}
        onSubmit={(firstName, lastName, email, middleName, externalId) => {
          setSubstitute({
            ...substitute,
            firstName: firstName,
            middleName: middleName,
            email: email,
            lastName: lastName,
            externalId: externalId,
            skipMailGunValidation: true,
          });
          goToNextStep();
        }}
        onCancel={handleCancel}
        onNameChange={(firstName, lastName) => {
          firstName && lastName && setName(`${firstName} ${lastName}`);
        }}
      />
    );
  };

  const renderInformation = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    goToNextStep: () => void
  ) => {
    return (
      <Information
        orgUser={substitute}
        editing={editableSections.information}
        editable={true}
        isSuperUser={false}
        selectedRole={OrgUserRole.ReplacementEmployee}
        isCreate={true}
        onSubmit={async (orgUser: any) => {
          const newSubstitute = {
            ...substitute,
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
          setSubstitute(newSubstitute);
          goToNextStep();
        }}
        onCancel={handleCancel}
      />
    );
  };

  const renderPositionTypesAndAttributes = (
    setStep: React.Dispatch<React.SetStateAction<number>>,
    goToNextStep: () => void
  ) => {
    return (
      <Section>
        <SubPositionTypesAndAttributesEdit
          organizationId={params.organizationId}
          orgUserId={params.orgUserId}
          currentAttributes={subAttributes}
          addAttribute={async (attribute: Attribute) => {
            setSubAttributes([...subAttributes, attribute]);
            return true;
          }}
          updateAttribute={async (
            endorsementId: string,
            expirationDate?: Date | undefined
          ) => {
            const updatedSubAttributes = [...subAttributes];
            const attributeToUpdate = updatedSubAttributes.find(
              u => u.endorsementId === endorsementId
            );
            if (attributeToUpdate) {
              attributeToUpdate.expirationDate = expirationDate;
              setSubAttributes(updatedSubAttributes);
            }
            return true;
          }}
          removeAttribute={async (endorsementId: string) => {
            setSubAttributes([
              ...subAttributes.filter(a => a.endorsementId !== endorsementId),
            ]);
            return true;
          }}
        />
        <ActionButtons
          submit={{
            text: t("Next"),
            execute: async () => {
              setStep(steps[3].stepNumber);
            },
          }}
          cancel={{
            text: t("Cancel"),
            execute: handleCancel,
          }}
        />
      </Section>
    );
  };

  const renderFinish = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <FinishWizard
        orgUserFullName={`${substitute.firstName} ${substitute.lastName}`}
        orgUserType={t("substitute")}
        orgId={params.organizationId}
        orgUserId={orgUser?.id}
        onSubmit={async (orgUser: any) => {
          const newSubstitute = {
            ...substitute,
            inviteImmediately: orgUser.inviteImmediately,
          };
          setSubstitute(newSubstitute);
          const id = await create(substitute, subAttributes);
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
                      `${substitute.firstName} ${substitute.lastName} successfully saved. Click to view.`
                    )}
                  </div>
                ),
              });

              setName(null);
              setSubAttributes([]);
              setSubstitute(defaultSubstitute);
              setStep(steps[0].stepNumber);
            } else history.push(PersonViewRoute.generate(viewParams));
          }
        }}
        onCancel={handleCancel}
      />
    );
  };

  const create = async (
    substitute: SubstituteInput,
    attributes: Attribute[]
  ) => {
    const result = await createSubstitute({
      variables: {
        substitute: {
          ...substitute,
          attributes: attributes.map(a => {
            return {
              attribute: {
                id: a.endorsementId,
              },
              expires: a.expirationDate ?? undefined,
            };
          }),
        },
      },
    });
    return result?.data?.orgUser?.saveSubstitute?.id;
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
      name: t("Position Types & Attributes"),
      content: renderPositionTypesAndAttributes,
    },
    {
      stepNumber: 3,
      name: t("Finish"),
      content: renderFinish,
    },
  ];

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("Create new Substitute")} />
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
