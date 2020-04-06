import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useGetEmployee } from "reference-data/employee";
import { RemainingBalances } from "./components/remaining-balances";
import { SectionHeader } from "ui/components/section-header";
import { SchoolYearSelect } from "ui/components/reference-selects/school-year-select";

type Props = {};

export const EmployeePtoBalances: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const employee = useGetEmployee();
  const orgId = employee?.orgId;

  const [schoolYearId, setSchoolYearId] = useState<string | undefined>(
    undefined
  );

  return (
    <>
      <SectionHeader title={t("Time off balances")} />
      <div className={classes.schoolYearSelect}>
        <SchoolYearSelect
          orgId={orgId ?? ""}
          selectedSchoolYearId={schoolYearId}
          setSelectedSchoolYearId={setSchoolYearId}
          showLabel={false}
        />
      </div>
      {employee?.id && (
        <RemainingBalances
          employeeId={employee?.id}
          title={t("Remaining balances")}
          showEdit={false}
          schoolYearId={schoolYearId}
          orgId={orgId ?? ""}
        />
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  schoolYearSelect: {
    width: 200,
    paddingBottom: theme.spacing(2),
  },
}));
