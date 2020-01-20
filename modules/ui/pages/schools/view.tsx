import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { LocationsInformation } from "ui/components/locations/information";
import { LocationsSubPref } from "ui/components/locations/subpref";
import { GetLocationById } from "./graphql/get-location-by-id.gen";
import { useRouteParams } from "ui/routes/definition";
import { LocationsViewRoute } from "ui/routes/locations";

export const LocationsViewPage: React.FC<{}> = props => {
  const params = useRouteParams(LocationsViewRoute);

  const getLocation = useQueryBundle(GetLocationById, {
    variables: {
      locationId: params.locationId,
    },
  });

  if (getLocation.state === "LOADING") {
    return <></>;
  }
  const location: any = getLocation?.data?.location?.byId ?? undefined;
  console.log("location:", location);
  return (
    <div>
      <LocationsInformation location={location}></LocationsInformation>
      <LocationsSubPref locationId={location.id}></LocationsSubPref>
    </div>
  );
};
