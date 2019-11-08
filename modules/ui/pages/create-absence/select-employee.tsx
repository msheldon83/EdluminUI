import * as React from "react";
import { CreateAbsenceActions, CreateAbsenceState } from "./state";
import { usePagedQueryBundle } from "graphql/hooks";
import { GetEmployeesForOrg } from "./graphql/get-employees.gen";
import { Table } from "ui/components/table";
import { PaginationControls } from "ui/components/pagination-controls";
import { useTranslation } from "react-i18next";
import { compact } from "lodash-es";
import { Column } from "material-table";
import { useCallback } from "react";

type Props = {
  state: CreateAbsenceState;
  dispatch: React.Dispatch<CreateAbsenceActions>;
  organizationId: string;
};

type Row = {
  id: string;
  externalId?: string | null;
};

export const SelectEmployee: React.FC<Props> = ({
  state,
  dispatch,
  organizationId,
}) => {
  const { t } = useTranslation();
  const [employees, pagination] = usePagedQueryBundle(
    GetEmployeesForOrg,
    r => r.employee?.paged?.totalCount,
    {
      skip: state.preselectedEmployee,
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
      externalId: employee.externalId,
    }));
  }, [results]);

  const columns: Column<typeof tableData[0]>[] = [
    { title: t("Employee ID"), field: "employeeId" },
    { title: "id", field: "id" },
  ];

  const selectEmployee = useCallback(
    (_: unknown, row?: Row) => {
      if (row) {
        dispatch({ action: "selectEmployee", employeeId: row.id });
      }
    },
    [dispatch]
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
