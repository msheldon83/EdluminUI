import * as React from "react";
import { Link } from "react-router-dom";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { LocationsInformation } from "./components/information";
import Maybe from "graphql/tsutils/Maybe";
import { SubstitutePrefCard } from "ui/components/sub-pools/subpref-card";
import { Can } from "ui/components/auth/can";
import { GetLocationById } from "./graphql/get-location-by-id.gen";
import { useRouteParams } from "ui/routes/definition";
import { useState, useEffect } from "react";
import { compact } from "lodash-es";
import { LocationViewRoute } from "ui/routes/locations";
import { useHistory } from "react-router";
import * as yup from "yup";
import { useTranslation } from "react-i18next";
import { PermissionEnum } from "graphql/server-types.gen";
import { PageHeader } from "ui/components/page-header";
import { makeStyles } from "@material-ui/core";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { can } from "helpers/permissions";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { LocationSubPrefRoute, LocationsRoute } from "ui/routes/locations";
import { ApproverGroupsUI } from "./components/approver-groups";
import { DeleteLocation } from "./graphql/delete-location.gen";
import { UpdateLocation } from "./graphql/update-location.gen";
import { GetLocationsDocument } from "reference-data/get-locations.gen";

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

  // If the school changes because we've searched for a school and selected them
  // set editing to false so that we close all editing sections and reset the forms
  useEffect(() => {
    setEditing(null);
  }, [params.locationId]);

  const locationsReferenceDataQuery = {
    query: GetLocationsDocument,
    varaibles: { orgId: params.organizationId },
  };

  const getLocation = useQueryBundle(GetLocationById, {
    variables: {
      locationId: params.locationId,
    },
  });

  const [deleteLocationMutation] = useMutationBundle(DeleteLocation, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: [locationsReferenceDataQuery],
  });

  const deleteLocation = React.useCallback(async () => {
    const result = await deleteLocationMutation({
      variables: {
        locationId: params.locationId,
      },
    });
    if (result.data?.location?.delete) {
      history.push(LocationsRoute.generate(params));
    }
  }, [deleteLocationMutation, history, params]);

  const [updateLocation] = useMutationBundle(UpdateLocation, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: [locationsReferenceDataQuery],
  });

  if (getLocation.state === "LOADING") {
    return <></>;
  }
  const location: any | undefined =
    getLocation?.data?.location?.byId ?? undefined;

  console.log(location);

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

  const approverGroups = compact(
    getLocation?.data?.location?.byId?.approverGroups
  );

  return (
    <div>
      <Link to={LocationsRoute.generate(params)} className={classes.link}>
        {t("Return to schools")}
      </Link>
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
          orgId?: string,
          forRole?: Role | null | undefined
        ) =>
          can(
            [PermissionEnum.LocationSave],
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
            onClick: deleteLocation,
            permissions: [PermissionEnum.LocationDelete],
          },
        ]}
      />
      <PageHeader
        text={location.externalId}
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
            [PermissionEnum.LocationSave],
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
        {location && <LocationsInformation location={location} />}
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
            editable={true}
            editPermission={[PermissionEnum.LocationSave]}
          />
        )}
        {location && Config.isDevFeatureOnly && (
          <Can do={[PermissionEnum.ApprovalSettingsView]}>
            <ApproverGroupsUI approverGroups={approverGroups} />
          </Can>
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
