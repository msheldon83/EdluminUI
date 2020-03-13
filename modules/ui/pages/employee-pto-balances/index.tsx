import * as React from "react";
import { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useGetEmployee } from "reference-data/employee";
import { RemainingBalances } from "./components/remaining-balances";
import { useAllSchoolYearOptions } from "reference-data/school-years";
import { SectionHeader } from "ui/components/section-header";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { SelectNew } from "ui/components/form/select-new";

type Props = {};

export const EmployeePtoBalances: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const employee = useGetEmployee();
  const orgId = employee?.orgId;
  const schoolYearOptions = useAllSchoolYearOptions(orgId);
  const currentSchoolYear = useCurrentSchoolYear(orgId);

  const [schoolYearId, setSchoolYearId] = useState<string | undefined>(
    currentSchoolYear?.id
  );

  useEffect(() => setSchoolYearId(currentSchoolYear?.id), [currentSchoolYear]);

  const selectedSchoolYear = schoolYearOptions.find(
    (sy: any) => sy.value === schoolYearId
  ) ?? { value: "", label: "" };

  return (
    <>
      <SectionHeader title={t("Time off balances")} />
      <div className={classes.schoolYearSelect}>
        <SelectNew
          value={selectedSchoolYear}
          multiple={false}
          options={schoolYearOptions}
          withResetValue={false}
          onChange={e => {
            setSchoolYearId(e.value.toString());
          }}
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
