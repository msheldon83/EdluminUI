import {
  Link,
  Popper,
  Fade,
  List,
  ListItemText,
  Grid,
  Button,
} from "@material-ui/core";
import { AccountCircleOutlined } from "@material-ui/icons";
import MailIcon from "@material-ui/icons/Mail";
import { makeStyles, useTheme } from "@material-ui/styles";
import { usePagedQueryBundle, useMutationBundle } from "graphql/hooks";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { useIsMobile, usePrevious } from "hooks";
import {
  useQueryParamIso,
  makeQueryIso,
  PaginationParams,
} from "hooks/query-params";
import { compact, isEqual, flatMap } from "lodash-es";
import * as React from "react";
import { useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { PaginationControls } from "ui/components/pagination-controls";
import { Table, TableColumn } from "ui/components/table";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute, PersonViewRoute } from "ui/routes/people";
import { GetAllPeopleForOrg } from "./graphql/get-all-people-for-org.gen";
import { PeopleFilters } from "./people-filters";
import { FilterQueryParams } from "./people-filters/filter-params";
import { InviteUsers } from "./graphql/invite-users.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { AccessIcon } from "./components/access-icon";
import { CreateButton } from "./components/create-button";
import { Can } from "ui/components/auth/can";

type Props = {};

export const PeoplePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PeopleRoute);
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { openSnackbar } = useSnackbar();

  const [filters] = useQueryParamIso(FilterQueryParams);
  const role: OrgUserRole[] = compact([filters.roleFilter]);

  // Default People list to 100 rows per page
  const peoplePaginationDefaults = makeQueryIso({
    defaults: {
      page: "1",
      limit: "100",
    },
    iso: PaginationParams,
  });
  const [allPeopleQuery, pagination] = usePagedQueryBundle(
    GetAllPeopleForOrg,
    r => r.orgUser?.paged?.totalCount,
    {
      variables: {
        ...filters,
        orgId: params.organizationId,
        role,
        sortBy: [
          {
            sortByPropertyName: "lastName",
            sortAscending: filters.lastNameSort === "asc",
          },
          {
            sortByPropertyName: "firstName",
            sortAscending: filters.firstNameSort === "asc",
          },
        ],
      },
    },
    peoplePaginationDefaults
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

  const truncateString = (str: string, num: number) => {
    return str.length <= num ? str : str.slice(0, num) + "...";
  };

  const listRoles = useCallback(
    (isAdmin: boolean, isEmployee: boolean, isSub: boolean) => {
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

      return roles.join(", ");
    },
    []
  );

  const [inviteUsers] = useMutationBundle(InviteUsers, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const invite = React.useCallback(
    async (userIds: string[], orgId: string) => {
      const response = await inviteUsers({
        variables: {
          userIds: userIds,
          orgId: orgId,
        },
      });
      const result = response?.data?.user?.invite;
      if (result) {
        openSnackbar({
          message: t("The invites are being processed"),
          dismissable: true,
          status: "success",
          autoHideDuration: 5000,
        });
      }
    },
    [inviteUsers, openSnackbar, t]
  );

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
      userId: person.userId,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      externalId: truncateString(person.externalId ?? "", 8),
      roles: listRoles(
        person.isAdmin,
        person.isEmployee,
        person.isReplacementEmployee
      ),
      positionType: person.employee?.primaryPosition?.positionType?.name,
      userName: person.email,
      phone: person.phoneNumber,
      locations: person.employee?.locations,
      endorsements: person.substitute?.attributes
        ? compact(
            flatMap(person.substitute?.attributes, a =>
              a?.endorsement ? a.endorsement : null
            )
          )
        : [],
      adminLocations:
        person.administrator?.accessControl?.derivedAdminLocations ?? [],
      allLocationIdsInScope:
        person.administrator?.accessControl?.allLocationIdsInScope ?? false,
      adminPositionTypes:
        person.administrator?.accessControl?.derivedAdminPositionTypes ?? [],
      allPositionTypeIdsInScope:
        person.administrator?.accessControl?.allPositionTypeIdsInScope ?? false,
      inviteSent: person.inviteSent,
      inviteSentAtUtc: person.inviteSentAtUtc,
      accountSetup: person.isAccountSetup,
    }));
  }, [people, listRoles]);

  if (
    allPeopleQuery.state === "LOADING" ||
    !allPeopleQuery.data.orgUser?.paged?.results
  ) {
    return <></>;
  }

  const peopleCount = pagination.totalCount;

  const columns: TableColumn<typeof tableData[0]>[] = [
    {
      cellStyle: {
        paddingRight: 0,
        width: isMobile
          ? theme.typography.pxToRem(40)
          : theme.typography.pxToRem(70),
      },
      sorting: false,
      render: o => (
        <div className={classes.accountCell}>
          <AccountCircleOutlined />
          <AccessIcon
            inviteSent={o.inviteSent}
            accountSetup={o.accountSetup}
            inviteSentAtUtc={o.inviteSentAtUtc}
          />
        </div>
      ),
    },
    {
      title: t("Name"),
      sorting: false,
      render: o => `${o.lastName}, ${o.firstName}`,
    },
    {
      title: t("Username"),
      field: "userName",
      sorting: false,
    },

    { title: t("Ext ID"), field: "externalId", sorting: false },
    {
      title: t("Role"),
      field: "roles",
      sorting: false,
      hidden: filters.roleFilter != null,
    },
    {
      title: t("Position Type"),
      field: "positionType",
      sorting: false,
      hidden: filters.roleFilter != OrgUserRole.Employee,
    },
    {
      title: t("Location"),
      field: "locations",
      sorting: false,
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
      sorting: false,
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
                    {o.adminPositionTypes.map((l, index) => (
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
      sorting: false,
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
      title: t("Attributes"),
      field: "endorsements",
      sorting: false,
      hidden: filters.roleFilter != OrgUserRole.ReplacementEmployee,
      render: o =>
        !o.endorsements || o.endorsements?.length < 1 ? (
          t("None")
        ) : o.endorsements.length === 1 ? (
          o.endorsements[0]?.name
        ) : (
          <>
            <Button id={endorsementsId} onClick={handleShowEndorsements}>
              {`${o.endorsements?.length} ${t("Attributes")}`}
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
                    {o.endorsements.map((e, index) => (
                      <ListItemText key={index}>{e?.name}</ListItemText>
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
        <Link
          href={`mailto:${o.email}`}
          onClick={(e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation();
          }}
          color="secondary"
        >
          <MailIcon />
        </Link>
      ),
    },
  ];

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item>
          <PageTitle title={t("People")} />
        </Grid>
        <Can
          do={[
            PermissionEnum.AdminSave,
            PermissionEnum.EmployeeSave,
            PermissionEnum.SubstituteSave,
          ]}
        >
          <Grid item>
            <CreateButton />
          </Grid>
        </Can>
      </Grid>
      <PeopleFilters />
      <div className={classes.tableContainer}>
        <Table
          title={`${peopleCount} ${
            peopleCount === 1 ? t("person") : t("people")
          }`}
          columns={columns}
          data={tableData}
          selection={true}
          selectionPermissions={[PermissionEnum.OrgUserInvite]}
          onRowClick={(event, orgUser) => {
            if (!orgUser) return;
            const newParams = {
              ...params,
              orgUserId: orgUser.id,
            };
            history.push(PersonViewRoute.generate(newParams));
          }}
          actions={[
            {
              tooltip: t("Invite selected people"),
              icon: () => <MailIcon />,
              onClick: async (evt, data) => {
                const userIds = [];
                if (Array.isArray(data)) {
                  userIds.push(...data.map(d => d.userId));
                } else {
                  userIds.push(data.userId);
                }

                await invite(compact(userIds), params.organizationId);
              },
              permissions: [PermissionEnum.OrgUserInvite],
            },
          ]}
        />
        <PaginationControls
          pagination={pagination}
          pageSizeOptions={[25, 50, 100, 250, 500]}
        />
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  tableContainer: {
    backgroundColor: theme.customColors.white,
    border: `1px solid ${theme.customColors.sectionBorder}`,
    borderTopWidth: 0,
    borderRadius: `0 0 ${theme.typography.pxToRem(
      5
    )} ${theme.typography.pxToRem(5)}`,
    padding: theme.spacing(3),
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },
  accountCell: {
    display: "flex",
    alignItems: "center",
  },
  header: {
    marginBottom: theme.spacing(),
  },
}));
