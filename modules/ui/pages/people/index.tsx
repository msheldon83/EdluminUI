import { Link } from "@material-ui/core";
import { AccountCircleOutlined } from "@material-ui/icons";
import MailIcon from "@material-ui/icons/Mail";
import { makeStyles, useTheme } from "@material-ui/styles";
import { usePagedQueryBundle } from "graphql/hooks";
import { OrgUserRole } from "graphql/server-types.gen";
import { usePrevious, useScreenSize } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import { compact, isEqual } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { PaginationControls } from "ui/components/pagination-controls";
import { Table } from "ui/components/table";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute, PersonViewRoute } from "ui/routes/people";
import { GetAllPeopleForOrg } from "./graphql/get-all-people-for-org.gen";
import { PeopleFilters } from "./people-filters";
import { FilterQueryParams, FilterRole } from "./people-filters/filter-params";
import Maybe from "graphql/tsutils/Maybe";

type Props = {};

export const PeoplePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
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

  const listRoles = (isAdmin: boolean, isEmployee: boolean, isSub: boolean) => {
    const roles = [];
    if (isAdmin) {
      roles.push(t("Administrator"));
    }
    if (isEmployee) {
      roles.push(t("Employee"));
    }
    if (isSub) {
      roles.push(t("Substitute"));
    }

    return roles.join(",");
  };

  const determineLocationsManaged = (
    allLocationIdsInScope: boolean,
    adminLocations: Maybe<Array<Maybe<{ name: string }>>>
  ) => {
    if (allLocationIdsInScope) {
      return "All";
    }
    if (adminLocations) {
      if (adminLocations.length > 1) {
        return "Multiple";
      } else {
        return adminLocations[0]?.name;
      }
    } else {
      return "None";
    }
  };

  const determinePositionTypesManaged = (
    allPositionTypeIdsInScope: boolean,
    adminPositionTypes: Maybe<Array<Maybe<{ name: string }>>>
  ) => {
    if (allPositionTypeIdsInScope) {
      return "All";
    }
    if (adminPositionTypes) {
      if (adminPositionTypes.length > 1) {
        return "Multiple";
      } else {
        return adminPositionTypes[0]?.name;
      }
    } else {
      return "None";
    }
  };

  const determineEndorsements = (
    endorsements: Maybe<Array<Maybe<{ endorsement: Maybe<{ name: string }> }>>>
  ) => {
    if (endorsements) {
      if (endorsements.length > 1) {
        return "Multiple";
      } else {
        return endorsements[0]?.endorsement?.name;
      }
    } else {
      return "None";
    }
  };

  const determineLocations = (
    locations: Maybe<Array<Maybe<{ location: Maybe<{ name: string }> }>>>
  ) => {
    if (locations) {
      if (locations.length > 1) {
        return "Multiple";
      } else {
        return locations[0]?.location?.name;
      }
    } else {
      return "None";
    }
  };

  let people: GetAllPeopleForOrg.Results[] = [];
  if (allPeopleQuery.state === "DONE" || allPeopleQuery.state === "UPDATING") {
    const qResults = compact(allPeopleQuery.data?.orgUser?.paged?.results);
    if (qResults) people = qResults;
  }
  const tableData = useMemo(() => {
    return people.map(person => ({
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      employeeId: person.externalId,
      roles: listRoles(
        person.isAdmin,
        person.isEmployee,
        person.isReplacementEmployee
      ),
      positionType: person.employee?.primaryPosition?.name,
      phone: person.phoneNumber,
      location: determineLocations(person.employee?.location ?? []),
      endorsements: determineEndorsements(person.employee?.endorsements ?? []),
      managesLocations: determineLocationsManaged(
        person.allLocationIdsInScope,
        person.adminLocations
      ),
      managesPositionTypes: determinePositionTypesManaged(
        person.allPositionTypeIdsInScope,
        person.adminPositionTypes
      ),
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
    { title: t("External ID"), field: "externalId" },
    {
      title: t("Role"),
      field: "roles",
      hidden: filters.roleFilter != null,
    },
    {
      title: t("Position type"), // Show popper for multiple
      field: "positionType",
      hidden: filters.roleFilter != OrgUserRole.Employee,
    },
    {
      title: t("Location"), // Show popper for multiple
      field: "location",
      hidden: filters.roleFilter != OrgUserRole.Employee,
    },
    {
      title: t("Manages position type"), // Show popper for multiple
      field: "managesPositionTypes",
      hidden: filters.roleFilter != OrgUserRole.Administrator,
    },
    {
      title: t("Manages location"), // Show popper for multiple
      field: "managesLocations",
      hidden: filters.roleFilter != OrgUserRole.Administrator,
    },
    {
      title: t("Endorsements"), // Show popper for multiple
      field: "endorsements",
      hidden: filters.roleFilter != OrgUserRole.ReplacementEmployee,
    },
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
        onRowClick={(event, orgUser) => {
          if (!orgUser) return;
          const newParams = {
            ...params,
            orgUserId: orgUser.id,
          };
          history.push(PersonViewRoute.generate(newParams));
        }}
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
