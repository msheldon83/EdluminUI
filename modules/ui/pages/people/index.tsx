import { AccountCircleOutlined } from "@material-ui/icons";
import { useTheme } from "@material-ui/styles";
import { useQueryBundle, usePagedQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Table } from "ui/components/table";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import { GetAllPeopleForOrg } from "./graphql/get-all-people-for-org.gen";
import { Column } from "material-table";
import { useScreenSize } from "hooks";
import { useQueryParams, PaginationParams, useQueryIso } from "hooks/query-params";

type Props = {};

export const PeoplePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PeopleRoute);
  const theme = useTheme();
  const isMobile = useScreenSize() === "mobile"
  const [pagination, updatePagination] = useQueryIso(["page", "limit"], PaginationParams);
  console.log("pagination?", pagination);
  if (pagination.page < 1) {
    updatePagination({page: 1})
  }
  const allPeopleQuery = usePagedQueryBundle(GetAllPeopleForOrg, {
    variables: { orgId: params.organizationId },
  });
  if (
    allPeopleQuery.state === "LOADING" ||
    !allPeopleQuery.data.orgUser?.paged?.results
  ) {
    return <></>;
  }
  const people = compact(allPeopleQuery.data.orgUser?.paged?.results);
  const peopleCount = allPeopleQuery.data.orgUser?.paged?.totalCount ?? 0;

  const columns: Column<GetAllPeopleForOrg.Results>[] = [
    {
      cellStyle: { width: isMobile ? theme.typography.pxToRem(40)
        : theme.typography.pxToRem(70) },
      render: () => <AccountCircleOutlined  />, // eslint-disable-line
    },
    {
      title: t("First Name"),
      field: "firstName",
    },
    {
      title: t("Last Name"),
      defaultSort: "asc",
      field: "lastName"
    },
  ];

  return (
    <>
      <PageTitle title={t("People")} />
      <Table
        title={`${peopleCount} ${peopleCount > 1 ? t("People") : t("Person")}`}
        columns={columns}
        data={people}
        selection={true}
        options={{ sorting: true }}
      />
    </>
  );
};

type PaginationInputs = {
  perPage?: number;

}

type PaginationState = {
  perPage: number;
  offset: number;
  total: number;
  sortingBy: any[];
}



const usePagination = () => {
  const [offset, setOffset] = React.useState(0);
  const []
}