import * as React from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { SubstitutePrefCard } from "ui/components/sub-pools/subpref-card";
import { GetLocationGroupById } from "./graphql/get-location-group-by-id.gen";
import { useRouteParams } from "ui/routes/definition";
import Maybe from "graphql/tsutils/Maybe";
import {
  LocationGroupViewRoute,
  LocationGroupsRoute,
} from "ui/routes/location-groups";
import { useTranslation } from "react-i18next";
import { Location as Loc, PermissionEnum } from "graphql/server-types.gen";
import { PageHeader } from "ui/components/page-header";
import { makeStyles } from "@material-ui/core";
import * as yup from "yup";
import { useHistory } from "react-router";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { can } from "helpers/permissions";
import { LocationGroupSubPrefRoute } from "ui/routes/location-groups";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { LocationGroupLocations } from "./components/location-group-locations";
import { DeleteLocationGroup } from "./graphql/delete-location-group.gen";
import { UpdateLocationGroup } from "./graphql/update-location-group.gen";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

export const LocationGroupViewPage: React.FC<{}> = props => {
  const params = useRouteParams(LocationGroupViewRoute);
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const [editing, setEditing] = React.useState<string | null>(null);

  const getLocationGroup = useQueryBundle(GetLocationGroupById, {
    variables: {
      locationGroupId: params.locationGroupId,
    },
    fetchPolicy: "cache-first",
  });

  const [deleteLocationGroupMutation] = useMutationBundle(DeleteLocationGroup, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const deleteLocationGroup = React.useCallback(async () => {
    const result = await deleteLocationGroupMutation({
      variables: {
        locationGroupId: params.locationGroupId,
      },
      awaitRefetchQueries: true,
      refetchQueries: ["GetAllLocationGroupsWithinOrg"],
    });
    if (!result.errors) {
      history.push(LocationGroupsRoute.generate(params));
    }
  }, [deleteLocationGroupMutation, history, params]);

  const [updateLocation] = useMutationBundle(UpdateLocationGroup, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetLocationGroupById"],
  });

  if (getLocationGroup.state === "LOADING") {
    return <></>;
  }
  const locationGroup: any | undefined =
    getLocationGroup?.data?.locationGroup?.byId ?? undefined;

  const updateName = async (name: string) => {
    await updateLocation({
      variables: {
        locationGroup: {
          id: locationGroup.id,
          rowVersion: locationGroup.rowVersion,
          name,
        },
      },
    });
  };

  const updateExternalId = async (externalId?: string | null) => {
    await updateLocation({
      variables: {
        locationGroup: {
          id: locationGroup.id,
          rowVersion: locationGroup.rowVersion,
          externalId,
        },
      },
    });
  };

  return (
    <div>
      <Link to={LocationGroupsRoute.generate(params)} className={classes.link}>
        {t("Return to school groups")}
      </Link>
      <PageHeader
        text={locationGroup.name}
        label={t("Name")}
        showLabel={false}
        isSubHeader={false}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.name)}
        validationSchema={yup.object().shape({
          value: yup.string().required(t("Name is required")),
        })}
        onCancel={() => setEditing(null)}
        onSubmit={async (value: Maybe<string>) => {
          await updateName(value!);
          setEditing(null);
        }}
        editPermissions={(
          permissions: OrgUserPermissions[],
          isSysAdmin: boolean,
          orgId?: string,
          forRole?: Role | null | undefined
        ) =>
          can(
            [PermissionEnum.LocationGroupSave],
            permissions,
            isSysAdmin,
            orgId,
            forRole
          )
        }
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },
          {
            name: t("Delete"),
            onClick: () => {
              if (locationGroup.locations.length > 0) {
                openSnackbar({
                  message: t(
                    "The School Group cannot be deleted because it is still used by active Schools"
                  ),
                  dismissable: true,
                  status: "error",
                });
              } else {
                const result = deleteLocationGroup();
              }
            },
            permissions: [PermissionEnum.LocationGroupDelete],
          },
        ]}
      />
      <PageHeader
        text={locationGroup.externalId}
        label={t("Identifier")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
        editPermissions={(
          permissions: OrgUserPermissions[],
          isSysAdmin: boolean,
          orgId?: string,
          forRole?: Role | null | undefined
        ) =>
          can(
            [PermissionEnum.LocationGroupSave],
            permissions,
            isSysAdmin,
            orgId,
            forRole
          )
        }
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
      />
      <div className={classes.content}>
        <LocationGroupLocations locations={locationGroup.locations} />
      </div>
      <div className={classes.content}>
        {locationGroup && (
          <SubstitutePrefCard
            heading={t("Substitute Preferences")}
            favoriteSubstitutes={
              locationGroup.substitutePreferences.favoriteSubstitutes
            }
            blockedSubstitutes={
              locationGroup.substitutePreferences.blockedSubstitutes
            }
            editRoute={LocationGroupSubPrefRoute.generate(params)}
            editing={false}
            editable={true}
            editPermission={[PermissionEnum.LocationGroupSave]}
          />
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
  link: {
    padding: theme.spacing(1),
    color: theme.customColors.blue,
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
}));
