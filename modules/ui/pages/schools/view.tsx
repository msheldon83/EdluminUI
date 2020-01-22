import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { LocationsInformation } from "./components/information";
import { SubstitutePrefCard } from "ui/components/sub-pools/subpref-card";
import { GetLocationById } from "./graphql/get-location-by-id.gen";
import { useRouteParams } from "ui/routes/definition";
import { LocationViewRoute } from "ui/routes/locations";
import { useTranslation } from "react-i18next";
import { Location as Loc, PermissionEnum } from "graphql/server-types.gen";
import { PageHeader } from "ui/components/page-header";
import { makeStyles } from "@material-ui/core";
import { OrgUserPermissions } from "ui/components/auth/types";
import { can } from "helpers/permissions";
import { LocationSubPrefRoute } from "ui/routes/locations";

export const LocationViewPage: React.FC<{}> = props => {
  const params = useRouteParams(LocationViewRoute);
  const { t } = useTranslation();
  const classes = useStyles();

  const getLocation = useQueryBundle(GetLocationById, {
    variables: {
      locationId: params.locationId,
    },
    fetchPolicy: "cache-first",
  });

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
            preferredLists={location.substitutePreferences}
            editRoute={LocationSubPrefRoute.generate(params)}
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
