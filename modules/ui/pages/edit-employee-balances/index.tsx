import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { makeStyles, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import {
  useAllSchoolYearOptions,
  useAllSchoolYears,
} from "reference-data/school-years";
import {
  useAbsenceReasonOptions,
  useAbsenceReasons,
} from "reference-data/absence-reasons";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { PageTitle } from "ui/components/page-title";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { SelectNew } from "ui/components/form/select-new";
import { GetOrgUserById } from "ui/pages/people/graphql/get-orguser-by-id.gen";
import { PeopleEmployeeBalancesEditRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { GetAbsenceReasonBalances } from "ui/pages/employee-pto-balances/graphql/get-absencereasonbalances.gen";
import { BalanceHeaderRow } from "./components/header-row";
import { BalanceRow } from "./components/balance-row";
import { UpdateEmployeeBalances } from "./graphql/update-employee-balances.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { EmployeeInput } from "graphql/server-types.gen";

export const EditEmployeePtoBalances: React.FC<{}> = () => {
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(PeopleEmployeeBalancesEditRoute);

  const [creatingNew, setCreatingNew] = useState(false);

  const [updateEmployeeBalances] = useMutationBundle(UpdateEmployeeBalances, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const getEmployee = useQueryBundle(GetOrgUserById, {
    variables: {
      id: params.orgUserId,
    },
  });
  const employee =
    getEmployee.state === "DONE" ? getEmployee.data.orgUser?.byId : null;

  const schoolYearOptions = useAllSchoolYearOptions(params.organizationId);
  const currentSchoolYear = useCurrentSchoolYear(params.organizationId);
  const [schoolYearId, setSchoolYearId] = useState<string | undefined>(
    currentSchoolYear?.id
  );
  useEffect(() => setSchoolYearId(currentSchoolYear?.id), [currentSchoolYear]);
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
    getAbsenceReasonBalances.state === "LOADING"
      ? []
      : getAbsenceReasonBalances.data?.absenceReasonBalance?.byEmployeeId ?? [];

  const balancesInput = useMemo(
    () =>
      balances.map(x => ({
        absenceReason: { id: x?.absenceReasonId },
        asOf: x?.balanceAsOf,
        balance: x?.initialBalance,
        schoolYear: { id: schoolYearId },
      })),
    [balances, schoolYearId]
  );

  const allAbsenceReasonOptions = useAbsenceReasonOptions(
    params.organizationId
  );
  const absenceReasonOptions = useMemo(() => {
    const usedReasonIds = balances.map(x => x?.absenceReasonId);
    return allAbsenceReasonOptions.filter(
      x => !usedReasonIds.includes(x.value)
    );
  }, [balances, allAbsenceReasonOptions]);
  const allAbsenceReasons = useAbsenceReasons(params.organizationId);

  const selectedSchoolYear = schoolYearOptions.find(
    (sy: any) => sy.value === schoolYearId
  ) ?? { value: "", label: "" };

  const onUpdateEmployeeBalances = async (employeeInput: EmployeeInput) => {
    const result = await updateEmployeeBalances({
      variables: {
        employee: {
          ...employeeInput,
          id: params.orgUserId,
        },
      },
    });
    if (result.data && creatingNew) {
      setCreatingNew(false);
    }
    await getAbsenceReasonBalances.refetch();
  };

  const removeBalance = async (absenceReasonId: string) => {
    const timeOffBalances = balancesInput.filter(
      x => x?.absenceReason.id !== absenceReasonId
    );
    await onUpdateEmployeeBalances({ timeOffBalances });
  };

  const updateBalance = async (
    absenceReasonId: string,
    initialBalance: number,
    asOf: Date
  ) => {
    const balanceIndex = balancesInput.findIndex(
      x => x.absenceReason.id === absenceReasonId
    );
    if (balanceIndex >= 0) {
      balancesInput[balanceIndex].asOf = asOf;
      balancesInput[balanceIndex].balance = initialBalance;
    } else {
      balancesInput.push({
        absenceReason: { id: absenceReasonId },
        asOf: asOf,
        balance: initialBalance,
        schoolYear: { id: schoolYearId },
      });
    }
    await onUpdateEmployeeBalances({ timeOffBalances: balancesInput });
  };

  return (
    <>
      <SectionHeader title={`${employee?.firstName} ${employee?.lastName}`} />
      <PageTitle title={t("Time off balances")} />
      <Section>
        <div className={classes.schoolYearSelect}>
          <SelectNew
            label={t("School year")}
            value={selectedSchoolYear}
            multiple={false}
            options={schoolYearOptions}
            withResetValue={false}
            onChange={e => {
              setSchoolYearId(e.value.toString());
            }}
          />
        </div>
        <div className={classes.tableContainer}>
          <BalanceHeaderRow />
          {balances.map((balance, i) => {
            return (
              <BalanceRow
                key={i}
                absenceReason={balance?.absenceReason}
                absenceReasons={allAbsenceReasons}
                initialBalance={balance?.initialBalance}
                usedBalance={balance?.usedBalance}
                plannedBalance={balance?.plannedBalance}
                remainingBalance={balance?.unusedBalance}
                balanceAsOf={balance?.balanceAsOf}
                shadeRow={i % 2 == 1}
                reasonOptions={absenceReasonOptions}
                onRemove={removeBalance}
                onUpdate={updateBalance}
                creatingNew={false}
                setCreatingNew={setCreatingNew}
                startOfSchoolYear={firstDayOfSelectedSchoolYear}
                endOfSchoolYear={lastDayOfSelectedSchoolYear}
              />
            );
          })}
          {creatingNew && (
            <BalanceRow
              reasonOptions={absenceReasonOptions}
              onRemove={removeBalance}
              onUpdate={updateBalance}
              shadeRow={balances.length % 2 == 1}
              creatingNew={creatingNew}
              setCreatingNew={setCreatingNew}
              startOfSchoolYear={firstDayOfSelectedSchoolYear}
              endOfSchoolYear={lastDayOfSelectedSchoolYear}
              absenceReasons={allAbsenceReasons}
            />
          )}
        </div>
        <Button
          variant="outlined"
          onClick={() => setCreatingNew(true)}
          disabled={creatingNew || absenceReasonOptions.length === 0}
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
    paddingBottom: theme.spacing(2),
  },
  tableContainer: {
    border: "1px solid #F5F5F5",
    marginBottom: theme.spacing(2),
  },
}));
