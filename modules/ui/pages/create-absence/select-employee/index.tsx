import { makeStyles } from "@material-ui/core";
import { usePagedQueryBundle } from "graphql/hooks";
import { useDeferredState } from "hooks";
import { useQueryParams } from "hooks/query-params";
import { compact } from "lodash-es";
import { Column } from "material-table";
import * as React from "react";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Input } from "ui/components/form/input";
import { PaginationControls } from "ui/components/pagination-controls";
import { Section } from "ui/components/section";
import { Table } from "ui/components/table";
import {
  AdminCreateAbsenceRoute,
  AdminSelectEmployeeForCreateAbsenceRoute,
} from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";
import { GetEmployeesForOrg } from "../graphql/get-employees.gen";

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
      variables: { orgId: organizationId, name },
    }
  );

  let results: GetEmployeesForOrg.Results[] | null = null;
  if (employees.state === "DONE" || employees.state === "UPDATING") {
    results = compact(employees.data.orgUser?.paged?.results ?? []);
  }

  const tableData: Row[] = React.useMemo(() => {
    return (results || []).map(orgUser => ({
      id: orgUser.id,
      externalId: orgUser.externalId,
      firstName: orgUser.firstName,
      lastName: orgUser.lastName,
      phone: orgUser.phoneNumber,
      position: orgUser.employee?.primaryPosition?.name,
    }));
  }, [results]);

  const columns: Column<typeof tableData[0]>[] = [
    { title: t("First name"), field: "firstName" },
    { title: t("Last name"), field: "lastName" },
    { title: t("Primary phone"), field: "phone" },
    { title: t("Employee ID"), field: "employeeId" },
    { title: t("Position"), field: "position" },
  ];

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
      <Section>
        <div className={classes.nameFieldContainer}>
          <Input
            label={t("Name")}
            value={pendingName}
            onChange={e => setPendingName(e.target.value)}
          />
        </div>
      </Section>
      <Table
        title={`${pagination.totalCount} ${
          pagination.totalCount === 1 ? t("Person") : t("People")
        }`}
        columns={columns}
        data={tableData}
        onRowClick={selectEmployee}
      />
      <PaginationControls pagination={pagination} />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  nameFieldContainer: {
    width: theme.typography.pxToRem(262),
  },
}));
