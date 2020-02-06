import * as React from "react";
import { useMutationBundle } from "graphql/hooks";
import { AddBasicInfo } from "./components/add-basic-info";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { OptionType } from "ui/components/form/select-new";
import { USStates } from "reference-data/states";
import { useQueryBundle } from "graphql/hooks";
import { AddressInput, TimeZone } from "graphql/server-types.gen";
import { Typography, makeStyles } from "@material-ui/core";
import { AddSettingsInfo } from "./components/add-settings-info";
import { LocationCreateInput, CountryCode } from "graphql/server-types.gen";
import { GetAllLocationGroupsWithinOrg } from "ui/pages/school-groups/graphql/get-all-location-groups.gen";
import { TabbedHeader as Tabs, Step } from "ui/components/tabbed-header";
import { CreateLocation } from "./graphql/create-location.gen";
import {
  LocationAddRoute,
  LocationsRoute,
  LocationViewRoute,
} from "ui/routes/locations";

type Props = {};

export const LocationAddPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(LocationAddRoute);
  const classes = useStyles();
  const [createLocation] = useMutationBundle(CreateLocation);
  const [name, setName] = React.useState<string | null>(null);
  const namePlaceholder = t("Glenbrook North High School");

  //Set State
  const [location, setLocation] = React.useState<LocationCreateInput>({
    orgId: params.organizationId,
    name: "",
    externalId: null,
    address: {
      address1: null,
      city: null,
      state: null,
      postalCode: null,
      country: null,
    },
    timeZoneId: null, //Pull from the ORg
    locationGroupId: null,
    phoneNumber: null, // Add clean up function for Regex
    replacementStartOffsetMinutes: null,
    replacementEndOffsetMinutes: null,
  });

  const stateOptions = USStates.map(s => ({
    label: s.name,
    value: s.enumValue,
  }));

  //Query Location Groups
  const locationGroups = useQueryBundle(GetAllLocationGroupsWithinOrg, {
    variables: { orgId: params.organizationId },
  });

  if (locationGroups.state === "LOADING") {
    return <></>;
  }

  const locationGroupOptions: OptionType[] =
    locationGroups?.data?.locationGroup?.all?.map(c => ({
      label: c?.name ?? "",
      value: c?.id ?? "",
    })) ?? [];

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
        stateOptions={stateOptions}
        locationGroupOptions={locationGroupOptions}
        submitText={t("Save")}
        onSubmit={async (
          country: CountryCode | null,
          locationGroupId: string | null,
          address1?: string | null,
          city?: string | null,
          state?: string | null,
          postalCode?: string | null,
          timeZoneId?: string | null,
          phoneNumber?: string | null,
          replacementStartOffsetMinutes?: number | null,
          replacementEndOffsetMinutes?: number | null
        ) => {
          const newLocation = {
            ...location,
            address: {
              address1: address1,
              city: city,
              state: state,
              postalCode: postalCode,
              country: CountryCode.Us,
            },
            phoneNumber: phoneNumber,
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

  const phoneRegExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  const cleanPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, "");
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
          phoneNumber:
            location.phoneNumber === null || location.phoneNumber === undefined
              ? null
              : cleanPhoneNumber(location.phoneNumber),
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
