import { useMutationBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useRouteParams } from "ui/routes/definition";
import { AddBasicInfo } from "./components/add-basic-info";
import { useHistory } from "react-router";
import {
  PermissionSetCreateInput,
  OrgUserRole,
  PermissionCategoryIdentifierInput,
} from "graphql/server-types.gen";
import { CreatePermissionSet } from "./graphql/create.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { Typography, makeStyles } from "@material-ui/core";
import {
  SecurityPermissionSetsRoute,
  SecurityPermissionSetsAddRoute,
  SecurityPermissionSetsViewRoute,
} from "ui/routes/security/permission-sets";
import { PermissionSettings } from "./components/add-edit-permission-settings";
import { usePermissionDefinitions } from "reference-data/permission-definitions";
import { useState, useEffect } from "react";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { ActionButtons } from "ui/components/action-buttons";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { GetPermissionSetsDocument } from "reference-data/get-permission-sets.gen";

type PermissionSetCreate = {
  orgId: string;
  name: string;
  externalId?: string | null | undefined;
  description?: string | null | undefined;
  orgUserRole: OrgUserRole;
  categories: PermissionCategoryIdentifierInput[];
};

export const PermissionSetAddPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(SecurityPermissionSetsAddRoute);
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const permissionSetsReferenceQuery = {
    query: GetPermissionSetsDocument,
    variables: { orgId: params.organizationId },
  };

  const [createPermissionSet] = useMutationBundle(CreatePermissionSet, {
    refetchQueries: [permissionSetsReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [name, setName] = useState<string | null>(null);
  const namePlaceholder = t("Building Admin");
  const [selectedRole, setSelectedRole] = useState<OrgUserRole | undefined>(
    undefined
  );
  const permissionDefinitions = usePermissionDefinitions(selectedRole);

  const [permissionSet, setPermissionSet] = React.useState<PermissionSetCreate>(
    {
      orgId: params.organizationId,
      name: "",
      externalId: null,
      description: null,
      orgUserRole: OrgUserRole.Invalid,
      categories: [],
    }
  );
  // If the selected Role changes, we need to clear out the current
  // categories details on the PermissionSet in state
  useEffect(() => {
    setPermissionSet({
      ...permissionSet,
      categories: [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole, setPermissionSet]);

  const renderBasicInfoStep = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <AddBasicInfo
        permissionSet={permissionSet}
        onSubmit={(name, orgUserRole, externalId, description) => {
          setPermissionSet({
            ...permissionSet,
            name: name,
            orgUserRole: orgUserRole,
            externalId: externalId,
            description: description,
          });
          setStep(steps[1].stepNumber);
        }}
        onCancel={() => {
          const url = SecurityPermissionSetsRoute.generate(params);
          history.push(url);
        }}
        onNameChange={name => setName(name)}
        onRoleChange={role => setSelectedRole(role)}
        namePlaceholder={namePlaceholder}
      />
    );
  };

  const renderSettings = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <Section>
        <SectionHeader title={t("Settings")} />
        <PermissionSettings
          orgId={params.organizationId}
          permissionDefinitions={permissionDefinitions}
          permissionSetCategories={permissionSet.categories}
          editable={true}
          onChange={async categories => {
            setPermissionSet({
              ...permissionSet,
              categories: categories,
            });
          }}
        />
        <ActionButtons
          submit={{
            text: t("Save"),
            execute: async () => {
              // Create the Permission Set
              const id = await create(permissionSet);
              if (id) {
                const viewParams = {
                  ...params,
                  permissionSetId: id,
                };
                // Go to the Permission Set View page
                history.push(
                  SecurityPermissionSetsViewRoute.generate(viewParams)
                );
              }
            },
          }}
          cancel={{
            text: t("Cancel"),
            execute: () => {
              const url = SecurityPermissionSetsRoute.generate(params);
              history.push(url);
            },
          }}
        />
      </Section>
    );
  };

  const create = async (permissionSet: PermissionSetCreateInput) => {
    const result = await createPermissionSet({
      variables: {
        permissionSet: {
          ...permissionSet,
          externalId:
            !permissionSet.externalId ||
            permissionSet.externalId.trim().length === 0
              ? null
              : permissionSet.externalId,
          description:
            !permissionSet.description ||
            permissionSet.description.trim().length === 0
              ? null
              : permissionSet.description,
        },
      },
    });
    return result?.data?.permissionSet?.create?.id;
  };

  const steps: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Basic Info"),
      content: renderBasicInfoStep,
    },
    {
      stepNumber: 1,
      name: t("Settings"),
      content: renderSettings,
    },
  ];
  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("Create new permission set")} />
        <Typography variant="h1">
          {name || (
            <span className={classes.placeholder}>{namePlaceholder}</span>
          )}
        </Typography>
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
