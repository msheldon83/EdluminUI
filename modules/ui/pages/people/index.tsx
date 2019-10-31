import { AccountCircleOutlined } from "@material-ui/icons";
import { makeStyles, useTheme } from "@material-ui/styles";
import { usePagedQueryBundle } from "graphql/hooks";
import { OrgUserRole } from "graphql/server-types.gen";
import { useScreenSize } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
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
import { PeopleFilters } from "./people-filters";
import { FilterQueryParams } from "./people-filters/filter-params";

type Props = {};

export const PeoplePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PeopleRoute);
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";

  const [filters] = useQueryParamIso(FilterQueryParams);
  const role: OrgUserRole[] = compact([filters.roleFilter]);

  const [allPeopleQuery, pagination] = usePagedQueryBundle(
    GetAllPeopleForOrg,
    r => r.orgUser?.paged?.totalCount,
    {
      variables: { orgId: params.organizationId, role, active: filters.active, name: filters.name },
    }
  );

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
      cellStyle: {
        width: isMobile
          ? theme.typography.pxToRem(40)
          : theme.typography.pxToRem(70),
      },
      render: () => <AccountCircleOutlined />, // eslint-disable-line
    },
    {
      title: t("First Name"),
      field: "firstName",
    },
    {
      title: t("Last Name"),
      field: "lastName",
    },
  ];

  return (
    <>
      <PageTitle title={t("People")} />

      <PeopleFilters className={classes.filters} />
      <Table
        title={`${peopleCount} ${
          peopleCount === 1 ? t("Person") : t("People")
        }`}
        columns={columns}
        data={people}
        selection={true}
      />
      <PaginationControls pagination={pagination} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
