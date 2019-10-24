import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { GetAllPositionTypesWithinOrg } from "ui/pages/position-type/position-types.gen";
import * as React from "react";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";
import { oc } from "ts-optchain";
import {
  PositionTypeViewRoute,
  PositionTypeRoute,
} from "ui/routes/position-type";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";

export const PositionTypePage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PositionTypeRoute);

  const getPositionTypes = useQueryBundle(GetAllPositionTypesWithinOrg, {
    variables: { orgId: params.organizationId },
  });

  const columns = [
    { title: t("Name"), field: "name", defaultSort: "asc" },
    { title: t("External Id"), field: "externalId" },
    {
      title: t("Use for Employees"),
      field: "forPermanentPositions",
      type: "boolean",
    },
    {
      title: t("Use for Vacancies"),
      field: "forStaffAugmentation",
      type: "boolean",
    },
    { title: t("Default Contract Name"), field: "defaultContract.name" },
  ];

  if (getPositionTypes.state === "LOADING") {
    return <></>;
  }

  const positionTypes = oc(getPositionTypes).data.positionType.all([]);
  const positionTypesCount = positionTypes.length;

  return (
    <>
      <PageTitle title={t("Position Types")} />
      <Table
        title={`${positionTypesCount} ${t("Position Types")}`}
        columns={columns}
        data={positionTypes}
        paging={false}
        selection={true}
        onEdit={(positionType: Exclude<(typeof positionTypes)[0], null>) => {
          const newParams = {
            ...params,
            positionTypeId: positionType.id,
          };
          history.push(PositionTypeViewRoute.generate(newParams));
        }}
      ></Table>
    </>
  );
};
