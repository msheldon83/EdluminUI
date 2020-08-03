import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { makeStyles, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useAllSchoolYears } from "reference-data/school-years";
import {
  useAbsenceReasonOptions,
  useAbsenceReasons,
} from "reference-data/absence-reasons";
import { Section } from "ui/components/section";
import { GetEmployeeById } from "./graphql/get-employee-by-id.gen";
import { PeopleEmployeeBalancesEditRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { GetAbsenceReasonBalances } from "ui/pages/employee-pto-balances/graphql/get-absencereasonbalances.gen";
import { BalanceHeaderRow } from "./components/header-row";
import { BalanceRow } from "./components/balance-row";
import { CreateAbsenceReasonBalance } from "./graphql/create-balance.gen";
import { UpdateAbsenceReasonBalance } from "./graphql/update-balance.gen";
import { DeleteAbsenceReasonBalance } from "./graphql/delete-balance.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import {
  AbsenceReasonBalanceCreateInput,
  AbsenceReasonBalanceUpdateInput,
  DataImportType,
  AbsenceReasonTrackingTypeId,
} from "graphql/server-types.gen";
import { SchoolYearSelect } from "ui/components/reference-selects/school-year-select";
import { compact } from "lodash-es";
import {
  useAbsenceReasonCategoryOptions,
  useAbsenceReasonCategories,
} from "reference-data/absence-reason-categories";
import { PersonLinkHeader } from "ui/components/link-headers/person";
import { ImportDataButton } from "ui/components/data-import/import-data-button";
import { RecalculateEmployeeBalances } from "./graphql/recalculate-balances.gen";
import { Can } from "ui/components/auth/can";
import { canViewAsSysAdmin } from "helpers/permissions";

export const EditEmployeePtoBalances: React.FC<{}> = () => {
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(PeopleEmployeeBalancesEditRoute);

  const [creatingNew, setCreatingNew] = useState(false);

  const [createBalance] = useMutationBundle(CreateAbsenceReasonBalance, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onCreateBalance = async (
    absenceReasonBalance: AbsenceReasonBalanceCreateInput
  ) => {
    const result = await createBalance({ variables: { absenceReasonBalance } });
    if (result.data) {
      setCreatingNew(false);
      await getAbsenceReasonBalances.refetch();
      return true;
    } else {
      return false;
    }
  };

  const [updateBalance] = useMutationBundle(UpdateAbsenceReasonBalance, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onUpdateBalance = async (
    absenceReasonBalance: AbsenceReasonBalanceUpdateInput
  ) => {
    const result = await updateBalance({ variables: { absenceReasonBalance } });
    if (result.data) {
      await getAbsenceReasonBalances.refetch();
      return true;
    } else {
      return false;
    }
  };

  const [deleteBalance] = useMutationBundle(DeleteAbsenceReasonBalance, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onDeleteBalance = async (absenceReasonBalanceId: string) => {
    await deleteBalance({ variables: { absenceReasonBalanceId } });
    await getAbsenceReasonBalances.refetch();
  };

  const [recalculateBalances] = useMutationBundle(RecalculateEmployeeBalances, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onRecalculateBalances = async () => {
    const result = await recalculateBalances({
      variables: {
        recalculateEmployeeBalances: {
          employeeId: params.orgUserId,
          schoolYearId: schoolYearId,
        },
      },
    });
    if (result.data) {
      openSnackbar({
        message: (
          <div>{t("This employee's balances have been recalculated")}</div>
        ),
        dismissable: true,
        status: "info",
      });
      await getAbsenceReasonBalances.refetch();
    }
  };

  const getEmployee = useQueryBundle(GetEmployeeById, {
    variables: {
      id: params.orgUserId,
    },
  });
  const employee =
    getEmployee.state === "DONE" ? getEmployee.data.employee?.byId : null;

  const [schoolYearId, setSchoolYearId] = useState<string | undefined>();

  const allSchoolYears = useAllSchoolYears(params.organizationId);
  const firstDayOfSelectedSchoolYear = useMemo(
    () => allSchoolYears.find(x => x.id === schoolYearId)?.startDate,
    [allSchoolYears, schoolYearId]
  );
  const lastDayOfSelectedSchoolYear = useMemo(
    () => allSchoolYears.find(x => x.id === schoolYearId)?.endDate,
    [allSchoolYears, schoolYearId]
  );

  const getAbsenceReasonBalances = useQueryBundle(GetAbsenceReasonBalances, {
    variables: {
      employeeId: params.orgUserId,
      schoolYearId: schoolYearId,
    },
    skip: !schoolYearId,
  });

  const balances =
    getAbsenceReasonBalances.state === "DONE" &&
    getAbsenceReasonBalances.data?.absenceReasonBalance?.byEmployeeId
      ? compact(
          getAbsenceReasonBalances.data?.absenceReasonBalance?.byEmployeeId
        )
      : [];

  const allAbsenceReasonOptions = useAbsenceReasonOptions(
    params.organizationId,
    undefined,
    employee?.primaryPosition?.positionType?.id
  );

  const allAbsenceReasonCategoryOptions = useAbsenceReasonCategoryOptions(
    params.organizationId
  );

  const absenceReasonTrackingTypeId =
    employee?.primaryPosition?.positionType?.absenceReasonTrackingTypeId ??
    AbsenceReasonTrackingTypeId.Daily;

  const absenceReasonTrackingTypeOptions = [
    {
      label: "Daily",
      value: AbsenceReasonTrackingTypeId.Daily,
    },
    {
      label: "Hourly",
      value: AbsenceReasonTrackingTypeId.Hourly,
    },
  ];

  const reasonOptions = useMemo(() => {
    const usedAbsReasonIds = balances.map(x => x?.absenceReasonId);
    const usedAbsReasonCatIds = balances.map(x => x?.absenceReasonCategoryId);

    const absReasonCatOptions = allAbsenceReasonCategoryOptions
      .filter(x => !usedAbsReasonCatIds.includes(x.value))
      .map(o => {
        return { label: `Category: ${o.label}`, value: o.value };
      });

    return allAbsenceReasonOptions
      .filter(x => !usedAbsReasonIds.includes(x.value))
      .concat(absReasonCatOptions);
  }, [balances, allAbsenceReasonOptions, allAbsenceReasonCategoryOptions]);
  const allAbsenceReasons = useAbsenceReasons(params.organizationId);
  const allAbsenceReasonCategories = useAbsenceReasonCategories(
    params.organizationId
  );

  // Clear the creating new if switching school years
  useEffect(() => {
    setCreatingNew(false);
  }, [schoolYearId]);

  return (
    <>
      <PersonLinkHeader
        title={t("Time off balances")}
        person={employee ?? undefined}
        params={params}
      />
      <Section>
        <div className={classes.filterRow}>
          <div className={classes.schoolYearSelect}>
            <SchoolYearSelect
              orgId={params.organizationId}
              selectedSchoolYearId={schoolYearId}
              setSelectedSchoolYearId={setSchoolYearId}
            />
          </div>
          <div>
            <Can do={canViewAsSysAdmin}>
              <Button
                variant="outlined"
                onClick={onRecalculateBalances}
                className={classes.recalculateButton}
              >
                {t("Recalculate")}
              </Button>
            </Can>
            <ImportDataButton
              orgId={params.organizationId}
              importType={DataImportType.AbsenceReasonBalance}
              label={t("Import balances")}
            />
          </div>
        </div>
        <div className={classes.tableContainer}>
          <BalanceHeaderRow />
          {balances.map((balance, i) => {
            return (
              <BalanceRow
                key={i}
                absenceReasonBalance={balance}
                absenceReasonTrackingTypeId={absenceReasonTrackingTypeId}
                orgId={params.organizationId}
                absenceReasonTrackingTypeOptions={
                  absenceReasonTrackingTypeOptions
                }
                shadeRow={i % 2 == 1}
                onRemove={onDeleteBalance}
                onUpdate={onUpdateBalance}
                onCreate={onCreateBalance}
                reasonOptions={reasonOptions}
                absenceReasons={allAbsenceReasons}
                absenceReasonCategories={allAbsenceReasonCategories}
                creatingNew={false}
                setCreatingNew={setCreatingNew}
                startOfSchoolYear={firstDayOfSelectedSchoolYear}
                endOfSchoolYear={lastDayOfSelectedSchoolYear}
              />
            );
          })}
          {creatingNew && (
            <BalanceRow
              absenceReasonBalance={{
                employeeId: params.orgUserId,
                schoolYearId: schoolYearId ?? "",
              }}
              absenceReasonTrackingTypeId={absenceReasonTrackingTypeId}
              orgId={params.organizationId}
              shadeRow={balances.length % 2 == 1}
              absenceReasonTrackingTypeOptions={
                absenceReasonTrackingTypeOptions
              }
              onRemove={onDeleteBalance}
              onUpdate={onUpdateBalance}
              onCreate={onCreateBalance}
              reasonOptions={reasonOptions}
              absenceReasons={allAbsenceReasons}
              absenceReasonCategories={allAbsenceReasonCategories}
              creatingNew={creatingNew}
              setCreatingNew={setCreatingNew}
              startOfSchoolYear={firstDayOfSelectedSchoolYear}
              endOfSchoolYear={lastDayOfSelectedSchoolYear}
            />
          )}
        </div>
        <Button
          variant="outlined"
          onClick={() => setCreatingNew(true)}
          disabled={creatingNew || reasonOptions.length === 0}
        >
          {t("Add row")}
        </Button>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  schoolYearSelect: {
    width: 200,
  },
  tableContainer: {
    border: "1px solid #F5F5F5",
    marginBottom: theme.spacing(2),
  },
  filterRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    paddingBottom: theme.spacing(2),
  },
  recalculateButton: {
    marginRight: theme.spacing(1),
  },
}));
