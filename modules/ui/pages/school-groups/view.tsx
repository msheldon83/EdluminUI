import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { LocationGroupInformation } from "./components/information";
import { SubstitutePrefCard } from "ui/components/sub-pools/subpref-card";
import { GetLocationGroupById } from "./graphql/get-location-groups-by-id.gen";
import { useRouteParams } from "ui/routes/definition";
import { LocationGroupViewRoute } from "ui/routes/location-groups";
import { useTranslation } from "react-i18next";
import { Location as Loc, PermissionEnum } from "graphql/server-types.gen";
import { PageHeader } from "ui/components/page-header";
import { makeStyles } from "@material-ui/core";
import { OrgUserPermissions } from "ui/components/auth/types";
import { can } from "helpers/permissions";

export const LocationGroupViewPage: React.FC<{}> = props => {
  const params = useRouteParams(LocationGroupViewRoute);
  const { t } = useTranslation();
  const classes = useStyles();

  const getLocationGroup = useQueryBundle(GetLocationGroupById, {
    variables: {
      locationGroupId: params.locationGroupId,
    },
    fetchPolicy: "cache-first",
  });

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
          orgId?: string
        ) =>
          can(
            [PermissionEnum.LocationGroupSave],
            permissions,
            isSysAdmin,
            orgId
          )
        }
      ></PageHeader>
      <PageHeader
        text={locationGroup.externalId}
        label={t("External ID")}
        showLabel={true}
        isSubHeader={true}
        editable={true}
      ></PageHeader>
      <div className={classes.content}>
        {location && (
          <LocationGroupInformation
            locationGroup={locationGroup}
          ></LocationGroupInformation>
        )}
        {location && (
          <SubstitutePrefCard
            favoriteHeading={t("Favorites")}
            blockedHeading={t("Blocked")}
            heading={t("Substitute Preferences")}
            preferredLists={locationGroup.substitutePreferences}
            routeParams={params}
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
