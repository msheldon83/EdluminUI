import { useTranslation } from "react-i18next";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { compact } from "lodash-es";
import { LocationsRoute, LocationViewRoute } from "ui/routes/locations";
import { useRouteParams } from "ui/routes/definition";
import { GetAllLocationsWithinOrg } from "./graphql/get-all-locations.gen";
import { useIsMobile } from "hooks";
import { PaginationControls } from "ui/components/pagination-controls";

type Props = {
  locationGroupFilter: number[];
  searchText?: string;
  olderAction?: () => void;
};

export const LocationsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const isMobile = useIsMobile();
  const params = useRouteParams(LocationsRoute);

  const getLocations = useQueryBundle(GetAllLocationsWithinOrg, {
    variables: {
      orgId: params.organizationId,
      locationGroups: props.locationGroupFilter,
      searchText: props.searchText,
    },
  });

  const columns: Column<GetAllLocationsWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    {
      title: t("Group"),
      field: "locationGroup.name",
      searchable: false,
      hidden: isMobile,
    },
    {
      title: t("External Id"),
      field: "externalId",
      searchable: false,
      hidden: isMobile,
    },
  ];

  if (getLocations.state === "LOADING") {
    return <></>;
  }

  const locations = compact(getLocations?.data?.location?.all ?? []);
  const locationsCount = locations.length;

  return (
    <>
      <Section>
        <Table
          title={`${locationsCount} ${t("Schools")}`}
          columns={columns}
          data={locations}
          selection={false}
          onRowClick={(event, location) => {
            if (!location) return;
            const newParams = {
              ...params,
              locationId: location.id,
            };
            history.push(LocationViewRoute.generate(newParams));
          }}
        />
      </Section>
    </>
  );
};
