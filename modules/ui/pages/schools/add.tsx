import * as React from "react";
import { useMutationBundle } from "graphql/hooks";
import { AddBasicInfo } from "./components/add-basic-info";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { useQueryBundle } from "graphql/hooks";
import { Typography, makeStyles } from "@material-ui/core";
import { AddSettingsInfo } from "./components/add-settings-info";
import {
  LocationCreateInput,
  CountryCode,
  StateCode,
} from "graphql/server-types.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { GetOrgConfigTimeZoneId } from "reference-data/get-org-config-timezone.gen";
import { CreateLocation } from "./graphql/create-location.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import {
  LocationAddRoute,
  LocationsRoute,
  LocationViewRoute,
} from "ui/routes/locations";
import { GetLocationsDocument } from "reference-data/get-locations.gen";
import { useLocationGroupOptions } from "reference-data/location-groups";

type Props = {};

export const LocationAddPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(LocationAddRoute);
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const [name, setName] = React.useState<string | null>(null);
  const namePlaceholder = t("Glenbrook North High School");

  const locationsReferenceDataQuery = {
    query: GetLocationsDocument,
    varaibles: { orgId: params.organizationId },
  };

  const [createLocation] = useMutationBundle(CreateLocation, {
    refetchQueries: [locationsReferenceDataQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [location, setLocation] = React.useState<LocationCreateInput>({
    orgId: params.organizationId,
    name: "",
    externalId: null,
    address: {
      address1: null,
      city: null,
      state: null,
      postalCode: null,
    },
    notes: null,
    locationGroupId: null,
    phoneNumber: null,
    replacementStartOffsetMinutes: null,
    replacementEndOffsetMinutes: null,
  });

  const getTimeZoneId = useQueryBundle(GetOrgConfigTimeZoneId, {
    variables: { orgId: params.organizationId },
  });

  const locationGroupOptions = useLocationGroupOptions(params.organizationId);

  if (getTimeZoneId.state === "LOADING") {
    return <></>;
  }

  const timeZoneId = getTimeZoneId?.data?.organization?.byId?.timeZoneId;

  //Render Tabs
  const renderBasicInfoStep = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <AddBasicInfo
        location={location}
        onSubmit={(name, externalId) => {
          setLocation({
            ...location,
            name: name,
            externalId: externalId,
          });
          setStep(steps[1].stepNumber);
        }}
        onCancel={() => {
          const url = LocationsRoute.generate(params);
          history.push(url);
        }}
        onNameChange={name => setName(name)}
        namePlaceholder={namePlaceholder}
      />
    );
  };

  const renderSettings = (
    setStep: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <AddSettingsInfo
        location={location}
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
          notes?: string | null,
          replacementStartOffsetMinutes?: number | null,
          replacementEndOffsetMinutes?: number | null
        ) => {
          const newLocation = {
            ...location,
            address: {
              address1: address1,
              address2: address2,
              city: city,
              state: state,
              postalCode: postalCode,
              country: CountryCode.Us,
            },
            phoneNumber: phoneNumber,
            notes: notes,
            timeZoneId: timeZoneId,
            locationGroupId: locationGroupId,
            replacementStartOffsetMinutes: replacementStartOffsetMinutes,
            replacementEndOffsetMinutes: replacementEndOffsetMinutes,
          };
          setLocation(newLocation);
          // Create the Location
          const id = await create(newLocation);
          const viewParams = {
            ...params,
            locationId: id!,
          };
          // Go to the Location View page
          history.push(LocationViewRoute.generate(viewParams));
        }}
        onCancel={() => {
          const url = LocationsRoute.generate(params);
          history.push(url);
        }}
      />
    );
  };

  //Mutations for Create Only
  const create = async (location: LocationCreateInput) => {
    const result = await createLocation({
      variables: {
        location: {
          ...location,
          externalId:
            location.externalId && location.externalId.trim().length === 0
              ? null
              : location.externalId,
        },
      },
    });
    return result?.data?.location?.create?.id;
  };

  //Steps for Wizard
  const steps: Array<Step> = [
    {
      stepNumber: 0,
      name: t("Basic Info"),
      content: renderBasicInfoStep,
    },
    {
      stepNumber: 1,
      name: t("Settings"),
      content: renderSettings,
    },
  ];
  return (
    <>
      <div className={classes.header}>
        <PageTitle title={t("Create new school")} />
        <Typography variant="h1">
          {name || (
            <span className={classes.placeholder}>{namePlaceholder}</span>
          )}
        </Typography>
      </div>
      <Tabs steps={steps} isWizard={true} showStepNumber={true}></Tabs>
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
