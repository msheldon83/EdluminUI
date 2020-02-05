import * as React from "react";
import { useMutationBundle } from "graphql/hooks";
import { AddBasicInfo } from "./components/add-basic-info";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { Typography, makeStyles } from "@material-ui/core";
import { AddSettingsInfo } from "./components/add-settings-info";
import { LocationCreateInput } from "graphql/server-types.gen";
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
  });

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
        orgId={params.organizationId}
        location={location}
        submitText={t("Save")}
        onSubmit={async (forPermanentPositions: boolean) => {
          const newLocation = {
            ...location,
            //Settings Values here
          };
          setLocation(newLocation);

          // Create the Position Type
          const id = await create(newLocation);
          const viewParams = {
            ...params,
            locationId: id!,
          };
          // Go to the Position Type View page
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
