import * as React from "react";
import { Section } from "ui/components/section";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { PageTitle } from "ui/components/page-title";
import { SectionHeader } from "ui/components/section-header";
import { makeStyles, Grid, Typography } from "@material-ui/core";
import { PermissionEnum } from "graphql/server-types.gen";
import { OptionType } from "ui/components/form/select-new";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { GetAllLocationGroupsWithinOrg } from "ui/pages/school-groups/graphql/get-all-location-groups.gen";
import { useRouteParams } from "ui/routes/definition";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { UpdateLocation } from "./graphql/update-location.gen";
import { GetLocationById } from "./graphql/get-location-by-id.gen";
import { Location } from "graphql/server-types.gen";
import { AddSettingsInfo } from "./components/add-settings-info";
import {
  LocationUpdateInput,
  CountryCode,
  StateCode,
} from "graphql/server-types.gen";
import { LocationViewRoute } from "ui/routes/locations";

export const LocationEditSettingsPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const history = useHistory();
  const params = useRouteParams(LocationViewRoute);

  const [updateLocation] = useMutationBundle(UpdateLocation, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  //Mutations for Create Only
  const update = async (location: LocationUpdateInput) => {
    const result = await updateLocation({
      variables: {
        location: {
          ...location,
          rowVersion: location.rowVersion,
        },
      },
    });
  };

  //Query Location
  const getLocation = useQueryBundle(GetLocationById, {
    variables: {
      locationId: params.locationId,
    },
    fetchPolicy: "cache-first",
  });

  const locationGroups = useQueryBundle(GetAllLocationGroupsWithinOrg, {
    variables: { orgId: params.organizationId },
  });

  if (locationGroups.state === "LOADING" || getLocation.state === "LOADING") {
    return <></>;
  }

  const locationGroupOptions: OptionType[] =
    locationGroups?.data?.locationGroup?.all?.map(c => ({
      label: c?.name ?? "",
      value: c?.id ?? "",
    })) ?? [];

  const location = getLocation?.data?.location?.byId;

  //console.log(location);

  const locationObject = {
    location: {
      address: {
        address1: location?.address1,
        city: location?.city,
        state: location?.stateName,
        postalCode: location?.postalCode,
      },
      //locationGroupId: location?.locationGroup?[0]?.id,
      phoneNumber: location?.phoneNumber,
    },
  };

  //return Add-Settings Component
  return (
    <>
      <div className={classes.header}>
        <PageTitle title={location?.name} />
      </div>
      <AddSettingsInfo
        location={locationObject}
        locationGroupOptions={locationGroupOptions}
        submitText={t("Save")}
        onSubmit={async (
          locationGroupId: string,
          address1?: string | null,
          city?: string | null,
          state?: StateCode | null,
          postalCode?: string | null,
          phoneNumber?: string | null,
          replacementStartOffsetMinutes?: number | null,
          replacementEndOffsetMinutes?: number | null
        ) => {
          const updateLocation: LocationUpdateInput = {
            ...location,
            id: location.id,
            rowVersion: location.rowVerion,
            address1: address1,
            city: city,
            state: state,
            postalCode: postalCode,
            country: CountryCode.Us,
            phoneNumber: phoneNumber,
            locationGroupId: locationGroupId,
          };
          // Update the Location
          await update(updateLocation);
          const viewParams = {
            ...params,
            locationId: params.locationId!,
          };
          // Go to the Location View page
          history.push(LocationViewRoute.generate(viewParams));
        }}
        onCancel={() => {
          const url = LocationViewRoute.generate(params);
          history.push(url);
        }}
      />
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
