import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { SubstitutePrefCard } from "ui/components/sub-pools/subpref-card";
import { GetLocationGroupById } from "./graphql/get-location-groups-by-id.gen";
import { useRouteParams } from "ui/routes/definition";
import {
  LocationGroupViewRoute,
  LocationGroupsRoute,
} from "ui/routes/location-groups";
import { useTranslation } from "react-i18next";
import { Location as Loc, PermissionEnum } from "graphql/server-types.gen";
import { PageHeader } from "ui/components/page-header";
import { makeStyles } from "@material-ui/core";
import { useHistory } from "react-router";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { can } from "helpers/permissions";
import { LocationGroupSubPrefRoute } from "ui/routes/location-groups";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { LocationGroupLocations } from "./components/location-group-locations";
import { DeleteLocationGroup } from "./graphql/delete-location-group.gen";

export const LocationGroupViewPage: React.FC<{}> = props => {
  const params = useRouteParams(LocationGroupViewRoute);
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { openSnackbar } = useSnackbar();

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

  if (getLocationGroup.state === "LOADING") {
    return <></>;
  }
  const locationGroup: any | undefined =
    getLocationGroup?.data?.locationGroup?.byId ?? undefined;

  return (
    <div>
      <PageHeader
        text={locationGroup.name}
        label={"name"}
        showLabel={false}
        isSubHeader={false}
        editable={true}
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
        label={t("External ID")}
        showLabel={true}
        isSubHeader={true}
        editable={true}
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
}));
