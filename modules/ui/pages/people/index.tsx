import { Button } from "@material-ui/core";
import { AccountCircleOutlined } from "@material-ui/icons";
import { useTheme } from "@material-ui/styles";
import { usePagedQueryBundle } from "graphql/hooks";
import { useScreenSize } from "hooks";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { PaginationControls } from "ui/components/pagination-controls";
import { Table } from "ui/components/table";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import { GetAllPeopleForOrg } from "./graphql/get-all-people-for-org.gen";

type Props = {};

export const PeoplePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PeopleRoute);
  const theme = useTheme();
  const isMobile = useScreenSize() === "mobile"
  const [allPeopleQuery, pagination] = usePagedQueryBundle(GetAllPeopleForOrg,
    r => r.orgUser?.paged?.totalCount,
    {
    variables: { orgId: params.organizationId },
  });
  if (
    allPeopleQuery.state === "LOADING" ||
    !allPeopleQuery.data.orgUser?.paged?.results
  ) {
    return <></>;
  }
  
  const people = compact(allPeopleQuery.data.orgUser?.paged?.results);
  const peopleCount = pagination.totalCount;

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
      <PaginationControls pagination={pagination} />
    </>
  );
};
