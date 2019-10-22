import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { GetAllPositionTypesWithinOrg } from "ui/pages/position-type/position-types.gen";
import * as React from "react";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";

type Props = {
  match: Match;
};
type Match = {
  params: MatchParams;
};
type MatchParams = {
  role: string;
  organizationId: number;
};

export const PositionTypePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const {
    match: {
      params: { organizationId: orgId },
    },
  } = props;

  const getPositionTypes = useQueryBundle(GetAllPositionTypesWithinOrg, {
    variables: { orgId },
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

  if (
    !getPositionTypes.data ||
    !getPositionTypes.data.positionType ||
    !getPositionTypes.data.positionType.all
  ) {
    return <div>oh no</div>;
  }

  const positionTypes = getPositionTypes.data.positionType.all;
  const positionTypesCount = positionTypes.length;

  return (
    <>
      <PageTitle title={t("Position Types")} />
      <Table
        title={`${positionTypesCount} ${t("Position Types")}`}
        columns={columns}
        data={positionTypes}
        selection={true}
      ></Table>
    </>
  );
};
