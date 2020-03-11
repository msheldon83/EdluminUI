import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { LocationsInformation } from "./components/information";
import Maybe from "graphql/tsutils/Maybe";
import { SubstitutePrefCard } from "ui/components/sub-pools/subpref-card";
import { GetLocationById } from "./graphql/get-location-by-id.gen";
import { useRouteParams } from "ui/routes/definition";
import { useState } from "react";
import { LocationViewRoute } from "ui/routes/locations";
import { Redirect, useHistory } from "react-router";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { Location as Loc, PermissionEnum } from "graphql/server-types.gen";
import { PageHeader } from "ui/components/page-header";
import { makeStyles } from "@material-ui/core";
import { OrgUserPermissions } from "ui/components/auth/types";
import { can } from "helpers/permissions";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { LocationSubPrefRoute, LocationsRoute } from "ui/routes/locations";
import { DeleteLocation } from "./graphql/delete-location.gen";
import { UpdateLocation } from "./graphql/update-location.gen";

const editableSections = {
  name: "edit-name",
  externalId: "edit-external-id",
};

export const LocationViewPage: React.FC<{}> = props => {
  const params = useRouteParams(LocationViewRoute);
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const [editing, setEditing] = useState<string | null>(null);

  const getLocation = useQueryBundle(GetLocationById, {
    variables: {
      locationId: params.locationId,
    },
    fetchPolicy: "cache-first",
  });

  const [deleteLocationMutation] = useMutationBundle(DeleteLocation, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const deleteLocation = React.useCallback(async () => {
    await deleteLocationMutation({
      variables: {
        locationId: params.locationId,
      },
      awaitRefetchQueries: true,
      refetchQueries: ["GetAllLocationsWithinOrg"],
    });
    history.push(LocationsRoute.generate(params));
  }, [deleteLocationMutation, history, params]);

  const [updateLocation] = useMutationBundle(UpdateLocation, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    awaitRefetchQueries: true,
    refetchQueries: ["GetLocationById"],
  });

  if (getLocation.state === "LOADING") {
    return <></>;
  }
  const location: any | undefined =
    getLocation?.data?.location?.byId ?? undefined;

  const updateName = async (name: string) => {
    await updateLocation({
      variables: {
        location: {
          id: location.id,
          rowVersion: location.rowVersion,
          name,
        },
      },
    });
  };

  const updateExternalId = async (externalId?: string | null) => {
    await updateLocation({
      variables: {
        location: {
          id: location.id,
          rowVersion: location.rowVersion,
          externalId,
        },
      },
    });
  };

  return (
    <div>
      <PageHeader
        text={location.name}
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
          orgId?: string
        ) => can([PermissionEnum.LocationSave], permissions, isSysAdmin, orgId)}
        actions={[
          {
            name: t("Change History"),
            onClick: () => {},
          },
          {
            name: t("Delete"),
            onClick: deleteLocation,
            permissions: [PermissionEnum.LocationDelete],
          },
        ]}
      ></PageHeader>
      <PageHeader
        text={location.externalId}
        label={t("External ID")}
        editable={editing === null}
        onEdit={() => setEditing(editableSections.externalId)}
        editPermissions={(
          permissions: OrgUserPermissions[],
          isSysAdmin: boolean,
          orgId?: string
        ) => can([PermissionEnum.LocationSave], permissions, isSysAdmin, orgId)}
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
      ></PageHeader>
      <div className={classes.content}>
        {location && (
          <LocationsInformation location={location}></LocationsInformation>
        )}
        {location && (
          <SubstitutePrefCard
            heading={t("Substitute Preferences")}
            favoriteSubstitutes={
              location.substitutePreferences.favoriteSubstitutes
            }
            blockedSubstitutes={
              location.substitutePreferences.blockedSubstitutes
            }
            autoAssignedSubstitutes={
              location.substitutePreferences?.autoAssignedSubstitutes
            }
            autoAssignedSubsOnly={true}
            editRoute={LocationSubPrefRoute.generate(params)}
            editing={false}
            editPermission={[PermissionEnum.LocationSave]}
          ></SubstitutePrefCard>
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
}));
