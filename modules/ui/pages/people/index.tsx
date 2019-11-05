import { AccountCircleOutlined } from "@material-ui/icons";
import { makeStyles, useTheme } from "@material-ui/styles";
import { usePagedQueryBundle } from "graphql/hooks";
import { OrgUserRole } from "graphql/server-types.gen";
import { useScreenSize, usePrevious } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import { compact, isEqual } from "lodash-es";
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
import { useEffect, useMemo } from "react";
import MailIcon from "@material-ui/icons/Mail";
import { IconButton, Link } from "@material-ui/core";

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
      variables: {
        ...filters,
        orgId: params.organizationId,
        role,
      },
    }
  );
  const oldFilters = usePrevious(filters);
  useEffect(
    () => {
      /* When filters are changed, go to page 1 */
      if (!isEqual(oldFilters, filters)) pagination.goToPage(1);
    },
    /* eslint-disable-next-line */
    [filters, oldFilters]
  );

  let people: GetAllPeopleForOrg.Results[] = [];
  if (allPeopleQuery.state === "DONE" || allPeopleQuery.state === "UPDATING") {
    const qResults = compact(allPeopleQuery.data?.orgUser?.paged?.results);
    if (qResults) people = qResults;
  }
  const tableData = useMemo(() => {
    return people.map(person => ({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      employeeId: person.employee?.externalId,
      position: person.employee?.primaryPosition?.name,
      phone: person.employee?.phoneNumbers?.[0]?.number,
      location: "",
    }));
  }, [people]);

  if (
    allPeopleQuery.state === "LOADING" ||
    !allPeopleQuery.data.orgUser?.paged?.results
  ) {
    return <></>;
  }

  const peopleCount = pagination.totalCount;

  const columns: Column<typeof tableData[0]>[] = [
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
    { title: t("Primary Phone"), field: "phone" },
    { title: t("Employee ID"), field: "externalId" },
    { title: t("Position"), field: "position" },
    { title: t("Location"), field: "location" },
    {
      title: "",
      field: "email",
      sorting: false,
      render: o => (
        <Link href={`mailto:${o.email}`} color="secondary">
          <MailIcon />
        </Link>
      ),
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
        data={tableData}
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
