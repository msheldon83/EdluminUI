import { useTranslation } from "react-i18next";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { compact } from "lodash-es";
import {
  LocationGroupsRoute,
  LocationGroupViewRoute,
} from "ui/routes/location-groups";
import { useRouteParams } from "ui/routes/definition";
import { GetAllLocationGroupsWithinOrg } from "./graphql/get-all-location-groups.gen";
import { useIsMobile } from "hooks";

type Props = {};

export const LocationGroupsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const isMobile = useIsMobile();
  const params = useRouteParams(LocationGroupsRoute);

  const getLocationGroups = useQueryBundle(GetAllLocationGroupsWithinOrg, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const columns: Column<GetAllLocationGroupsWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    {
      title: t("Externl Id"),
      field: "externalId",
      searchable: false,
      hidden: isMobile,
    },
  ];

  if (getLocationGroups.state === "LOADING") {
    return <></>;
  }

  const locationGroups = compact(
    getLocationGroups?.data?.locationGroup?.all ?? []
  );
  const locationGroupsCount = locationGroups.length;

  return (
    <>
      <Section>
        <Table
          title={`${locationGroupsCount} ${t("School Groups")}`}
          columns={columns}
          data={locationGroups}
          selection={false}
          onRowClick={(event, locationGroup) => {
            if (!locationGroup) return;
            const newParams = {
              ...params,
              locationGroupId: locationGroup.id,
            };
            history.push(LocationGroupViewRoute.generate(newParams));
          }}
        />
      </Section>
    </>
  );
};
