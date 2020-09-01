import { makeStyles, Typography } from "@material-ui/core";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import Maybe from "graphql/tsutils/Maybe";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Redirect, useHistory } from "react-router";
import { PageHeader } from "ui/components/page-header";
import { PageTitle } from "ui/components/page-title";
import { Link } from "react-router-dom";
import { useRouteParams } from "ui/routes/definition";
import * as yup from "yup";
import { GetPermissionSetById } from "./graphql/get-permission-set-byId.gen";
import { DeletePermissionSet } from "./graphql/delete-permission-set.gen";
import { UpdatePermissionSet } from "./graphql/update.gen";
import {
  PermissionCategoryIdentifierInput,
  OrgUserRole,
  PermissionEnum,
} from "graphql/server-types.gen";
import {
  SecurityPermissionSetsViewRoute,
  SecurityPermissionSetsRoute,
} from "ui/routes/security/permission-sets";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { PermissionSettings } from "./components/add-edit-permission-settings";
import { usePermissionDefinitions } from "reference-data/permission-definitions";
import { ShadowIndicator } from "ui/components/shadow-indicator";
import { canEditPermissionSet } from "helpers/permissions";
import { useCanDo } from "ui/components/auth/can";
import { GetPermissionSetsDocument } from "reference-data/get-permission-sets.gen";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
  description: "edit-description",
};

export const PermissionSetViewPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const params = useRouteParams(SecurityPermissionSetsViewRoute);
  const [editing, setEditing] = useState<string | null>(null);
  const [role, setRole] = useState<OrgUserRole | undefined>(undefined);
  const permissionDefinitions = usePermissionDefinitions(role);
  const canDoFn = useCanDo();

  const permissionSetsAdminReferenceQuery = {
    query: GetPermissionSetsDocument,
    variables: {
      orgId: params.organizationId,
      roles: [OrgUserRole.Administrator],
    },
  };

  const permissionSetsEmployeeReferenceQuery = {
    query: GetPermissionSetsDocument,
    variables: { orgId: params.organizationId, roles: [OrgUserRole.Employee] },
  };

  const permissionSetsSubReferenceQuery = {
    query: GetPermissionSetsDocument,
    variables: {
      orgId: params.organizationId,
      roles: [OrgUserRole.ReplacementEmployee],
    },
  };

  const [deletePermissionSetMutation] = useMutationBundle(DeletePermissionSet, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    onCompleted: data => {
      history.push(SecurityPermissionSetsRoute.generate(params));
    },
  });
  const deletePermissionSet = React.useCallback(async () => {
    await deletePermissionSetMutation({
      variables: {
        permissionSetId: params.permissionSetId,
      },
      awaitRefetchQueries: true,
      refetchQueries: [
        "GetAllPermissionSetsWithinOrg",
        permissionSetsAdminReferenceQuery,
        permissionSetsEmployeeReferenceQuery,
        permissionSetsSubReferenceQuery,
      ],
    });
  }, [
    deletePermissionSetMutation,
    params.permissionSetId,
    permissionSetsAdminReferenceQuery,
    permissionSetsEmployeeReferenceQuery,
    permissionSetsSubReferenceQuery,
  ]);

  const [updatePermissionSet] = useMutationBundle(UpdatePermissionSet, {
    refetchQueries: [
      permissionSetsAdminReferenceQuery,
      permissionSetsEmployeeReferenceQuery,
      permissionSetsSubReferenceQuery,
    ],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getPermissionSet = useQueryBundle(GetPermissionSetById, {
    variables: { id: params.permissionSetId },
  });

  if (getPermissionSet.state === "LOADING") {
    return <></>;
  }

  const permissionSet = getPermissionSet?.data?.permissionSet?.byId;
  if (!permissionSet) {
    // Redirect the User back to the List page
    const listUrl = SecurityPermissionSetsRoute.generate(params);
    return <Redirect to={listUrl} />;
  }
  // Set the role so we can get the appropriate permission definitions
  // to display the Permission Categories UI
  if (role === undefined) {
    setRole(permissionSet.orgUserRole ?? undefined);
  }

  const updateName = async (name: string) => {
    await updatePermissionSet({
      variables: {
        permissionSet: {
          id: permissionSet.id,
          rowVersion: permissionSet.rowVersion,
          name,
        },
      },
    });
  };

  const updateExternalId = async (externalId?: string | null) => {
    await updatePermissionSet({
      variables: {
        permissionSet: {
          id: permissionSet.id,
          rowVersion: permissionSet.rowVersion,
          externalId,
        },
      },
    });
  };

  const updateDescription = async (description?: string | null) => {
    await updatePermissionSet({
      variables: {
        permissionSet: {
          id: permissionSet.id,
          rowVersion: permissionSet.rowVersion,
          description,
        },
      },
    });
  };

  const updateCategories = async (
    categories: PermissionCategoryIdentifierInput[]
  ) => {
    // The server adds a "__typename" property to every object.
    // Since we're using the Categories defined on the PermissionSet
    // to seed the UI, we need to remove that extra property before
    // sending back to the server.
    const filteredCategoryObjects = categories.map(c => {
      return {
        categoryId: c.categoryId,
        settings: !c.settings
          ? []
          : c.settings.map(s => {
              const settingInfo = {
                settingId: s!.settingId,
                levelId: s!.levelId,
                options: !s?.options
                  ? []
                  : s.options
                      .filter(o => o !== null)
                      .map(o => {
                        return { optionId: o!.optionId, enabled: o!.enabled };
                      }),
              };
              return settingInfo;
            }),
      };
    });
    await updatePermissionSet({
      variables: {
        permissionSet: {
          id: permissionSet.id,
          rowVersion: permissionSet.rowVersion,
          categories: filteredCategoryObjects,
        },
      },
    });
  };

  const userCanEdit = canDoFn(canEditPermissionSet, undefined, permissionSet);

  return (
    <>
      <PageTitle title={t("Permission Set")} withoutHeading={!isMobile} />
      <div className={classes.headerLink}>
        <div>
          <Typography variant="h5">{t("Permissions for")}</Typography>
        </div>
        <div className={classes.linkPadding}>
          <Link
            to={SecurityPermissionSetsRoute.generate(params)}
            className={classes.link}
          >
            {t("Return to all permission sets")}
          </Link>
        </div>
      </div>
      <PageHeader
        text={permissionSet.name}
        label={t("Name")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.name)}
        editPermissions={canEditPermissionSet}
        permissionContext={permissionSet}
        validationSchema={yup.object().shape({
          value: yup.string().required(t("Name is required")),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await updateName(value!);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },
          {
            name: t("Delete"),
            onClick: deletePermissionSet,
            permissions: [PermissionEnum.PermissionSetDelete],
          },
        ]}
      />
      <PageHeader
        text={permissionSet.externalId}
        label={t("Identifier")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
        editPermissions={canEditPermissionSet}
        permissionContext={permissionSet}
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await updateExternalId(value);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        isSubHeader={true}
        showLabel={true}
      >
        <ShadowIndicator
          isShadow={permissionSet.isShadowRecord}
          orgName={permissionSet.shadowFromOrgName}
        />
      </PageHeader>
      <PageHeader
        text={permissionSet.description}
        label={t("Description")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.description)}
        editPermissions={canEditPermissionSet}
        permissionContext={permissionSet}
        validationSchema={yup.object().shape({
          value: yup.string().nullable(),
        })}
        onSubmit={async (value: Maybe<string>) => {
          await updateDescription(value);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
        isSubHeader={true}
        showLabel={true}
      />

      <PermissionSettings
        orgId={params.organizationId}
        permissionDefinitions={permissionDefinitions}
        permissionSetCategories={permissionSet.categories}
        editable={userCanEdit}
        onChange={async categories => {
          await updateCategories(categories);
        }}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  headerLink: {
    display: "flex",
    justifyContent: "space-between",
  },
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
  linkPadding: {
    paddingRight: theme.spacing(2),
  },
}));
