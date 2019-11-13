import * as React from "react";
import { usePagedQueryBundle } from "graphql/hooks";
import { GetEmployeesForOrg } from "../graphql/get-employees.gen";
import { Table } from "ui/components/table";
import { PaginationControls } from "ui/components/pagination-controls";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { Column } from "material-table";
import { useCallback } from "react";
import { useHistory } from "react-router";
import {
  AdminCreateAbsenceRoute,
  AdminSelectEmployeeForCreateAbsenceRoute,
} from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";

type Props = {};

type Row = {
  id: string;
  externalId?: string | null;
};

export const SelectEmployee: React.FC<Props> = props => {
  const { t } = useTranslation();

  const { organizationId } = useRouteParams(
    AdminSelectEmployeeForCreateAbsenceRoute
  );
  const history = useHistory();
  const [employees, pagination] = usePagedQueryBundle(
    GetEmployeesForOrg,
    r => r.employee?.paged?.totalCount,
    {
      variables: { orgId: organizationId },
    }
  );

  let results: GetEmployeesForOrg.Results[] | null = null;
  if (employees.state === "DONE" || employees.state === "UPDATING") {
    results = compact(employees.data.employee?.paged?.results ?? []);
  }

  const tableData: Row[] = React.useMemo(() => {
    return (results || []).map(employee => ({
      id: employee.id,
      externalId: "TODO", // this was broken by changes to the schema
    }));
  }, [results]);

  const columns: Column<typeof tableData[0]>[] = [
    { title: t("Employee ID"), field: "employeeId" },
    { title: "id", field: "id" },
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
    [history]
  );

  return (
    <>
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
