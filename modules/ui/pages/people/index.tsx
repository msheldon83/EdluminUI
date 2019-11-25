import {
  Link,
  Popper,
  Fade,
  Button,
  List,
  ListItemText,
} from "@material-ui/core";
import { AccountCircleOutlined } from "@material-ui/icons";
import MailIcon from "@material-ui/icons/Mail";
import { makeStyles, useTheme } from "@material-ui/styles";
import { usePagedQueryBundle } from "graphql/hooks";
import { OrgUserRole } from "graphql/server-types.gen";
import Maybe from "graphql/tsutils/Maybe";
import { useIsMobile, usePrevious } from "hooks";
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
import { FilterQueryParams } from "./people-filters/filter-params";

type Props = {};

export const PeoplePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PeopleRoute);
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();

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

  const [
    locationsManagedAnchor,
    setLocationsManagedAnchor,
  ] = React.useState<null | HTMLElement>(null);
  const handleShowLocationsManaged = (event: React.MouseEvent<HTMLElement>) => {
    setLocationsManagedAnchor(
      locationsManagedAnchor ? null : event.currentTarget
    );
  };
  const locationsManagedOpen = Boolean(locationsManagedAnchor);
  const locationsManagedId = locationsManagedOpen
    ? "locationsManaged-popper"
    : undefined;

  const [
    posTypesManagedAnchor,
    setPosTypesManagedAnchor,
  ] = React.useState<null | HTMLElement>(null);
  const handleShowPosTypesManaged = (event: React.MouseEvent<HTMLElement>) => {
    setPosTypesManagedAnchor(
      posTypesManagedAnchor ? null : event.currentTarget
    );
  };
  const posTypesManagedOpen = Boolean(posTypesManagedAnchor);
  const posTypesManagedId = posTypesManagedOpen
    ? "posTypesManaged-popper"
    : undefined;

  const [
    endorsementsAnchor,
    setEndorsementsAnchor,
  ] = React.useState<null | HTMLElement>(null);
  const handleShowEndorsements = (event: React.MouseEvent<HTMLElement>) => {
    setEndorsementsAnchor(endorsementsAnchor ? null : event.currentTarget);
  };
  const endorsementsOpen = Boolean(endorsementsAnchor);
  const endorsementsId = endorsementsOpen ? "endorsements-popper" : undefined;

  const [
    locationsAnchor,
    setLocationsAnchor,
  ] = React.useState<null | HTMLElement>(null);
  const handleShowLocations = (event: React.MouseEvent<HTMLElement>) => {
    setLocationsAnchor(locationsAnchor ? null : event.currentTarget);
  };
  const locationsOpen = Boolean(locationsAnchor);
  const locationsId = locationsOpen ? "locations-popper" : undefined;

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
      externalId: person.externalId,
      roles: listRoles(
        person.isAdmin,
        person.isEmployee,
        person.isReplacementEmployee
      ),
      primaryPosition: person.employee?.primaryPosition?.name,
      phone: person.phoneNumber,
      locations: person.employee?.locations,
      endorsements: person.employee?.endorsements,
      adminLocations: person.adminLocations,
      allLocationIdsInScope: person.allLocationIdsInScope,
      adminPositionTypes: person.adminPositionTypes,
      allPositionTypeIdsInScope: person.allPositionTypeIdsInScope,
    }));
  }, [people]);

console.log(tableData);

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
      title: t("Position"),
      field: "primaryPosition",
      hidden: filters.roleFilter != OrgUserRole.Employee,
    },
    {
      title: t("Location"),
      field: "locations",
      hidden: filters.roleFilter != OrgUserRole.Employee,
      render: o =>
        !o.locations || o.locations?.length < 1 ? (
          t("None")
        ) : o.locations.length === 1 ? (
          o.locations[0]?.name
        ) : (
          <>
            <Button id={locationsId} onClick={handleShowLocations}>
              {`${o.locations?.length} ${t("Locations")}`}
            </Button>
            <Popper
              transition
              open={locationsOpen}
              anchorEl={locationsAnchor}
              placement="bottom-end"
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={150}>
                  <List className={classes.paper}>
                    {o.locations?.map((l, index) => (
                      <ListItemText key={index}>{l?.name}</ListItemText>
                    ))}
                  </List>
                </Fade>
              )}
            </Popper>
          </>
        ),
    },
    {
      title: t("Manages position type"),
      field: "managesPositionTypes",
      hidden: filters.roleFilter != OrgUserRole.Administrator,
      render: o =>
        o.allPositionTypeIdsInScope ? (
          t("All")
        ) : !o.adminPositionTypes || o.adminPositionTypes?.length < 1 ? (
          t("None")
        ) : o.adminPositionTypes?.length === 1 ? (
          o.adminPositionTypes[0]?.name
        ) : (
          <>
            <Button id={posTypesManagedId} onClick={handleShowPosTypesManaged}>
              {`${o.adminPositionTypes?.length} ${t("Position Types Managed")}`}
            </Button>
            <Popper
              transition
              open={posTypesManagedOpen}
              anchorEl={posTypesManagedAnchor}
              placement="bottom-end"
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={150}>
                  <List className={classes.paper}>
                    {o.adminPositionTypes!.map((l, index) => (
                      <ListItemText key={index}>{l?.name}</ListItemText>
                    ))}
                  </List>
                </Fade>
              )}
            </Popper>
          </>
        ),
    },
    {
      title: t("Manages location"),
      field: "managesLocations",
      hidden: filters.roleFilter != OrgUserRole.Administrator,
      render: o =>
        o.allLocationIdsInScope ? (
          t("All")
        ) : !o.adminLocations || o.adminLocations?.length < 1 ? (
          t("None")
        ) : o.adminLocations?.length === 1 ? (
          o.adminLocations[0]?.name
        ) : (
          <>
            <Button
              id={locationsManagedId}
              onClick={handleShowLocationsManaged}
            >
              {`${o.adminLocations?.length} ${t("Locations Managed")}`}
            </Button>
            <Popper
              transition
              open={locationsManagedOpen}
              anchorEl={locationsManagedAnchor}
              placement="bottom-end"
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={150}>
                  <List className={classes.paper}>
                    {o.adminLocations?.map((l, index) => (
                      <ListItemText key={index}>{l?.name}</ListItemText>
                    ))}
                  </List>
                </Fade>
              )}
            </Popper>
          </>
        ),
    },
    {
      title: t("Endorsements"),
      field: "endorsements",
      hidden: filters.roleFilter != OrgUserRole.ReplacementEmployee,
      render: o =>
        !o.endorsements || o.endorsements?.length < 1 ? (
          t("None")
        ) : o.endorsements.length === 1 ? (
          o.endorsements[0]?.endorsement?.name
        ) : (
          <>
            <Button id={endorsementsId} onClick={handleShowEndorsements}>
              {`${o.endorsements?.length} ${t("Endorsements")}`}
            </Button>
            <Popper
              transition
              open={endorsementsOpen}
              anchorEl={endorsementsAnchor}
              placement="bottom-end"
            >
              {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={150}>
                  <List className={classes.paper}>
                    {o.endorsements!.map((e, index) => (
                      <ListItemText key={index}>
                        {e?.endorsement?.name}
                      </ListItemText>
                    ))}
                  </List>
                </Fade>
              )}
            </Popper>
          </>
        ),
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
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
}));
