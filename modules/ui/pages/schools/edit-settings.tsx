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
import { useLocationGroupOptions } from "reference-data/location-groups";
import { GetLocationsDocument } from "reference-data/get-locations.gen";

export const LocationEditSettingsPage: React.FC<{}> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const history = useHistory();
  const params = useRouteParams(LocationViewRoute);

  const locationsReferenceDataQuery = {
    query: GetLocationsDocument,
    varaibles: { orgId: params.organizationId },
  };

  const [updateLocation] = useMutationBundle(UpdateLocation, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: [locationsReferenceDataQuery],
  });

  const update = async (location: LocationUpdateInput) => {
    await updateLocation({
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
  });

  const locationGroupOptions = useLocationGroupOptions(params.organizationId);

  if (getLocation.state === "LOADING") {
    return <></>;
  }

  const location = getLocation?.data?.location?.byId;

  const locationObject = {
    address: {
      address1: location?.address1,
      address2: location?.address2,
      city: location?.city,
      state: location?.state,
      postalCode: location?.postalCode,
    },
    notes: location?.notes,
    locationGroupId: location?.locationGroup?.id,
    phoneNumber: location?.phoneNumber,
  };

  return (
    <>
      <div className={classes.header}>
        <PageTitle title={location?.name ?? ""} />
      </div>
      <AddSettingsInfo
        location={locationObject}
        locationGroupOptions={locationGroupOptions}
        submitText={t("Save")}
        onSubmit={async (
          locationGroupId: string,
          address1?: string | null,
          address2?: string | null,
          city?: string | null,
          state?: StateCode | null,
          postalCode?: string | null,
          phoneNumber?: string | null,
          notes?: string | null
        ) => {
          const updateLocation: LocationUpdateInput = {
            id: location?.id ?? "",
            rowVersion: location?.rowVersion ?? "",
            address: {
              address1: address1,
              address2: address2,
              city: city,
              state: state,
              postalCode: postalCode,
              country: CountryCode.Us,
            },
            notes: notes,
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
