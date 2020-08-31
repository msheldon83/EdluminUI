import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
  usePagedQueryBundle,
  useMutationBundle,
  useQueryBundle,
} from "graphql/hooks";
import { OrgUserRole, PermissionEnum } from "graphql/server-types.gen";
import { usePrevious } from "hooks";
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
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute, PersonViewRoute } from "ui/routes/people";
import { GetAllPeopleForOrg } from "./graphql/get-all-people-for-org.gen";
import { PeopleFilters } from "./people-filters";
import { FilterQueryParams } from "./people-filters/filter-params";
import { InviteUsers } from "./graphql/invite-users.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { CreateButton } from "./components/create-button";
import { Can } from "ui/components/auth/can";
import { GetOrgConfigStatus } from "reference-data/get-org-config-status.gen";
import { OrganizationType, DataImportType } from "graphql/server-types.gen";
import { ImportDataMultiButton } from "ui/components/data-import/import-data-multi-button";
import { PeopleTable } from "./components/table";

type Props = {};

export const PeoplePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PeopleRoute);
  const classes = useStyles();
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

  const getOrgStatus = useQueryBundle(GetOrgConfigStatus, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const oldFilters = usePrevious(filters);
  useEffect(
    () => {
      /* When filters are changed, go to page 1 */
      if (!isEqual(oldFilters, filters)) pagination.resetPage();
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
    [t]
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
        await allPeopleQuery.refetch();
      }
    },
    [inviteUsers, openSnackbar, t, allPeopleQuery]
  );

  let people: GetAllPeopleForOrg.Results[] = [];
  if (allPeopleQuery.state === "DONE" || allPeopleQuery.state === "UPDATING") {
    const qResults = compact(allPeopleQuery.data?.orgUser?.paged?.results);
    if (qResults) people = qResults;
  }

  const tableData = useMemo(() => {
    return people.map(person => ({
      id: person.id,
      userId: person.userId ?? undefined,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email ?? undefined,
      externalId: truncateString(person.externalId ?? "", 8),
      roles: listRoles(
        person.isAdmin,
        person.isEmployee,
        person.isReplacementEmployee
      ),
      positionType: person.employee?.primaryPosition?.positionType?.name,
      userName: person.loginEmail ?? undefined,
      phone: person.phoneNumber ?? undefined,
      locations:
        (person.employee?.locations?.filter(l => l) as {
          id: string;
          name: string;
        }[]) ?? undefined,
      endorsements: person.substitute?.attributes
        ? compact(
            flatMap(person.substitute?.attributes, a =>
              a?.endorsement ? a.endorsement : null
            )
          )
        : [],
      adminLocations: (
        (person.administrator?.accessControl?.locations?.filter(l => l) as {
          id: string;
          name: string;
        }[]) ?? []
      ).concat(
        (person.administrator?.accessControl?.locationGroups?.filter(
          l => l
        ) as {
          id: string;
          name: string;
        }[]) ?? []
      ),
      allLocationIdsInScope:
        person.administrator?.accessControl?.allLocationIdsInScope ?? false,
      adminPositionTypes:
        (person.administrator?.accessControl?.positionTypes?.filter(l => l) as {
          id: string;
          name: string;
        }[]) ?? [],
      allPositionTypeIdsInScope:
        person.administrator?.accessControl?.allPositionTypeIdsInScope ?? false,
      inviteSent: person.inviteSent,
      inviteSentAtUtc: person.inviteSentAtUtc,
      invitationRequestedAtUtc: person.invitationRequestedAtUtc,
      accountSetup: person.isAccountSetup,
      isSuperUser: person.administrator?.isSuperUser ?? false,
      isShadowRecord: person.isShadowRecord,
      shadowFromOrgName: person.shadowFromOrgName ?? undefined,
    }));
  }, [people, listRoles]);

  if (
    allPeopleQuery.state === "LOADING" ||
    !allPeopleQuery.data.orgUser?.paged?.results
  ) {
    return <></>;
  }

  const orgStatus =
    getOrgStatus.state === "LOADING"
      ? undefined
      : getOrgStatus?.data?.organization?.byId?.config?.organizationTypeId;

  return (
    <>
      <Grid
        container
        alignItems="center"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item xs={8}>
          <PageTitle title={t("People")} />
        </Grid>
        <Can
          do={[
            PermissionEnum.AdminSave,
            PermissionEnum.EmployeeSave,
            PermissionEnum.SubstituteSave,
          ]}
        >
          <Grid item xs={2}>
            <ImportDataMultiButton
              orgId={params.organizationId}
              importTypes={[
                {
                  importType: DataImportType.Administrator,
                  label: t("Admins"),
                },
                {
                  importType: DataImportType.Employee,
                  label: t("Employees"),
                },
                {
                  importType: DataImportType.Substitute,
                  label: t("Substitutes"),
                },
              ]}
            />
          </Grid>
          <Grid item xs={2}>
            <CreateButton />
          </Grid>
        </Can>
      </Grid>
      <PeopleFilters />
      <div className={classes.tableContainer}>
        <PeopleTable
          pagination={pagination}
          data={tableData}
          inviteSelected={async userIds => {
            if (orgStatus === OrganizationType.Demo) {
              openSnackbar({
                message: t(
                  "This Organization is in Demo Mode. No invites have been sent"
                ),
                dismissable: true,
                status: "info",
                autoHideDuration: 5000,
              });
            } else {
              await invite(userIds, params.organizationId);
            }
          }}
          role={filters.roleFilter}
          toUserPage={id => {
            const newParams = {
              ...params,
              orgUserId: id,
            };
            history.push(PersonViewRoute.generate(newParams));
          }}
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
  header: {
    marginBottom: theme.spacing(),
  },
}));
