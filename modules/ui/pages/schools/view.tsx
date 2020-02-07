import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { LocationsInformation } from "./components/information";
import { SubstitutePrefCard } from "ui/components/sub-pools/subpref-card";
import { GetLocationById } from "./graphql/get-location-by-id.gen";
import { useRouteParams } from "ui/routes/definition";
import { useState } from "react";
import { LocationViewRoute } from "ui/routes/locations";
import { Redirect, useHistory } from "react-router";
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

export const LocationViewPage: React.FC<{}> = props => {
  const params = useRouteParams(LocationViewRoute);
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

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

  if (getLocation.state === "LOADING") {
    return <></>;
  }
  const location: any | undefined =
    getLocation?.data?.location?.byId ?? undefined;

  return (
    <div>
      <PageHeader
        text={location.name}
        label={"name"}
        showLabel={false}
        isSubHeader={false}
        editable={true}
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
        showLabel={true}
        isSubHeader={true}
        editable={true}
      ></PageHeader>
      <div className={classes.content}>
        {location && (
          <LocationsInformation location={location}></LocationsInformation>
        )}
        {location && (
          <SubstitutePrefCard
            favoriteHeading={t("Favorites")}
            blockedHeading={t("Blocked")}
            heading={t("Substitute Preferences")}
            favoriteSubstitutes={
              location.substitutePreferences.favoriteSubstitutes
            }
            blockedSubstitutes={
              location.substitutePreferences.blockedSubstitutes
            }
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
