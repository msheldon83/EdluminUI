import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { GetAllPositionTypesWithinOrg } from "ui/pages/position-type/graphql/position-types.gen";
import * as React from "react";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";
import {
  PositionTypeViewRoute,
  PositionTypeRoute,
  PositionTypeAddRoute,
} from "ui/routes/position-type";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { Link } from "react-router-dom";
import { Grid, Button } from "@material-ui/core";
import { compact } from "lodash-es";
import { Column } from "material-table";

export const PositionTypePage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PositionTypeRoute);
  const getPositionTypes = useQueryBundle(GetAllPositionTypesWithinOrg, {
    variables: { orgId: params.organizationId },
  });

  const columns: Column<(typeof positionTypes)[0]>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    { title: t("External Id"), field: "externalId", searchable: true },
    {
      title: t("Use for Employees"),
      field: "forPermanentPositions",
      type: "boolean",
      searchable: false,
    },
    {
      title: t("Use for Vacancies"),
      field: "forStaffAugmentation",
      type: "boolean",
      searchable: false,
    },
    {
      title: t("Default Contract Name"),
      field: "defaultContract.name",
      searchable: false,
    },
  ];

  if (getPositionTypes.state === "LOADING") {
    return <></>;
  }

  const positionTypes = compact(getPositionTypes?.data?.positionType?.all ?? [])
  const positionTypesCount = positionTypes.length;
  console.log(positionTypes);
  console.log("first", positionTypes[0]);
  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
      >
        <Grid item>
          <PageTitle title={t("Position Types")} />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            component={Link}
            to={PositionTypeAddRoute.generate(params)}
          >
            {t("Add Position Type")}
          </Button>
        </Grid>
      </Grid>
      <Table
        title={`${positionTypesCount} ${t("Position Types")}`}
        columns={columns}
        data={positionTypes}
        selection={true}
        onRowClick={(event, positionType: (typeof positionTypes)[0]) => {
          const newParams = {
            ...params,
            positionTypeId: positionType.id,
          };
          history.push(PositionTypeViewRoute.generate(newParams));
        }}
        options={{
          search: true,
        }}
      />
    </>
  );
};
