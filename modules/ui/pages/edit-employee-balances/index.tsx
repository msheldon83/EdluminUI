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
import { SectionHeader } from "ui/components/section-header";
import { PageTitle } from "ui/components/page-title";
import { GetOrgUserById } from "ui/pages/people/graphql/get-orguser-by-id.gen";
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
} from "graphql/server-types.gen";
import { SchoolYearSelect } from "ui/components/reference-selects/school-year-select";
import { compact } from "lodash-es";

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

  const getEmployee = useQueryBundle(GetOrgUserById, {
    variables: {
      id: params.orgUserId,
    },
  });
  const employee =
    getEmployee.state === "DONE" ? getEmployee.data.orgUser?.byId : null;

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
    params.organizationId
  );
  const absenceReasonOptions = useMemo(() => {
    const usedReasonIds = balances.map(x => x?.absenceReasonId);
    return allAbsenceReasonOptions.filter(
      x => !usedReasonIds.includes(x.value)
    );
  }, [balances, allAbsenceReasonOptions]);
  const allAbsenceReasons = useAbsenceReasons(params.organizationId);

  // Clear the creating new if switching school years
  useEffect(() => {
    setCreatingNew(false);
  }, [schoolYearId]);

  return (
    <>
      <SectionHeader title={`${employee?.firstName} ${employee?.lastName}`} />
      <PageTitle title={t("Time off balances")} />
      <Section>
        <div className={classes.schoolYearSelect}>
          <SchoolYearSelect
            orgId={params.organizationId}
            selectedSchoolYearId={schoolYearId}
            setSelectedSchoolYearId={setSchoolYearId}
          />
        </div>
        <div className={classes.tableContainer}>
          <BalanceHeaderRow />
          {balances.map((balance, i) => {
            return (
              <BalanceRow
                key={i}
                absenceReasonBalance={balance}
                orgId={params.organizationId}
                shadeRow={i % 2 == 1}
                onRemove={onDeleteBalance}
                onUpdate={onUpdateBalance}
                onCreate={onCreateBalance}
                reasonOptions={absenceReasonOptions}
                absenceReasons={allAbsenceReasons}
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
              orgId={params.organizationId}
              shadeRow={balances.length % 2 == 1}
              onRemove={onDeleteBalance}
              onUpdate={onUpdateBalance}
              onCreate={onCreateBalance}
              reasonOptions={absenceReasonOptions}
              absenceReasons={allAbsenceReasons}
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
