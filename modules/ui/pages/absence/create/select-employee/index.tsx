import { makeStyles } from "@material-ui/core";
import { usePagedQueryBundle } from "graphql/hooks";
import { useDeferredState, useIsMobile } from "hooks";
import { useQueryParams } from "hooks/query-params";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import Typography from "@material-ui/core/Typography";
import { PageTitle } from "ui/components/page-title";
import { Input } from "ui/components/form/input";
import { Section } from "ui/components/section";
import { Table } from "ui/components/table";
import { useRouteParams } from "ui/routes/definition";
import { GetEmployeesForOrg } from "../../graphql/get-employees.gen";
import clsx from "clsx";
import {
  AdminCreateAbsenceRoute,
  AdminSelectEmployeeForCreateAbsenceRoute,
} from "ui/routes/absence";

type Props = {};

type Row = {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  position?: string;
  externalId?: string | null;
};

export const SelectEmployee: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const { organizationId } = useRouteParams(
    AdminSelectEmployeeForCreateAbsenceRoute
  );
  const [filters, updateFilters] = useQueryParams({ name: "" });
  const [name, pendingName, setPendingName] = useDeferredState(
    filters.name,
    200
  );
  useEffect(() => {
    if (name !== filters.name) {
      setPendingName(name);
    }
  }, [filters.name]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (name !== filters.name) {
      updateFilters({ name });
    }
  }, [name]); // eslint-disable-line react-hooks/exhaustive-deps

  const history = useHistory();
  const [employees, pagination] = usePagedQueryBundle(
    GetEmployeesForOrg,
    r => r.orgUser?.paged?.totalCount,
    {
      variables: {
        orgId: organizationId,
        name,
        sortBy: [{ sortByPropertyName: "lastName", sortAscending: true }],
        active: true,
      },
    }
  );

  let results: GetEmployeesForOrg.Results[] | null = null;
  if (employees.state === "DONE" || employees.state === "UPDATING") {
    results = compact(employees.data.orgUser?.paged?.results ?? []);
  }
  const isLoading = employees.state === "LOADING";

  const tableData: Row[] = React.useMemo(() => {
    return (results || []).map(orgUser => ({
      id: orgUser.id,
      externalId: orgUser.externalId,
      firstName: orgUser.firstName,
      lastName: orgUser.lastName,
      locations: orgUser.employee?.locations,
      position: orgUser.employee?.primaryPosition?.title,
    }));
  }, [results]);

  const columns: Column<typeof tableData[0]>[] = useMemo(
    () =>
      [
        {
          title: t("Name"),
          render: (o: any) => `${o.lastName}, ${o.firstName}`,
        },

        {
          title: t("Location"),

          hideOnMobile: true,
          render: (o: any) =>
            !o.locations || o.locations?.length < 1 ? (
              t("None")
            ) : o.locations.length === 1 ? (
              o.locations[0]?.name
            ) : (
              <>{`${o.locations?.length} ${t("Locations")}`}</>
            ),
        },
        { title: t("Employee ID"), field: "employeeId", hideOnMobile: true },
        { title: t("Position"), field: "position" },
      ].filter(c => !isMobile || !c.hideOnMobile),
    [isMobile, t]
  );

  const selectEmployee = useCallback(
    (_: unknown, row?: Row) => {
      if (row) {
        history.push(
          AdminCreateAbsenceRoute.generate({
            organizationId,
            employeeId: row.id,
          })
        );
      }
    },
    [history, organizationId]
  );

  return (
    <>
      <Typography variant="h5">{t("Select an employee")}</Typography>
      <PageTitle title={t("Create absence")} />
      <Section>
        <div className={classes.nameFieldRow}>
          <div className={classes.nameFieldContainer}>
            <Input
              label={t("Name")}
              value={pendingName}
              onChange={e => {
                pagination.resetPage();
                setPendingName(e.target.value);
              }}
            />
          </div>
        </div>
        {isLoading && (
          <Typography variant="h5" className={classes.loading}>
            {t("Loading employees...")}
          </Typography>
        )}
        <div
          className={clsx({
            [classes.hidden]: isLoading,
          })}
        >
          <Table
            title={`${pagination.totalCount} ${
              pagination.totalCount === 1 ? t("Person") : t("People")
            }`}
            columns={columns}
            data={tableData}
            onRowClick={selectEmployee}
            pagination={pagination}
          />
        </div>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  nameFieldContainer: {
    width: theme.typography.pxToRem(262),
  },
  nameFieldRow: {
    borderBottom: `1px solid ${theme.customColors.sectionBorder}`,
    paddingBottom: theme.spacing(3),
  },
  loading: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(),
  },
  hidden: {
    visibility: "hidden",
  },
}));
