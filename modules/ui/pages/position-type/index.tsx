import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { GetAllPositionTypesWithinOrg } from "ui/pages/position-type/PositionTypes.gen";
import * as React from "react";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";

type Props = {};
export const PositionTypePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const getPositionTypes = useQueryBundle(GetAllPositionTypesWithinOrg);

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
