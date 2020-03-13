import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { makeStyles, Select, MenuItem } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { PageTitle } from "ui/components/page-title";
import { useTranslation } from "react-i18next";
import { useGetEmployee } from "reference-data/employee";
import { RemainingBalances } from "./components/remaining-balances";
import { useAllSchoolYears } from "reference-data/school-years";
import { SectionHeader } from "ui/components/section-header";
import { parseISO, format } from "date-fns";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { SelectNew } from "ui/components/form/select-new";

type Props = {};

export const EmployeePtoBalances: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const employee = useGetEmployee();
  const orgId = employee?.orgId ?? "";
  const schoolYears = useAllSchoolYears(orgId);
  const currentSchoolYear = useCurrentSchoolYear(orgId);

  const [schoolYearId, setSchoolYearId] = useState<string | undefined>(
    currentSchoolYear?.id
  );

  useEffect(() => setSchoolYearId(currentSchoolYear?.id), [currentSchoolYear]);

  const schoolYearOptions = useMemo(
    () =>
      schoolYears.map(sy => ({
        label: `${format(parseISO(sy.startDate), "yyyy")}-${format(
          parseISO(sy.endDate),
          "yyyy"
        )}`,
        value: sy.id,
      })),
    [schoolYears]
  );

  const selectedSchoolYear = schoolYearOptions.find(
    (sy: any) => sy.value === schoolYearId
  ) ?? { value: "", label: "" };

  return (
    <>
      <SectionHeader title={t("Time off balances")} />
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
      {employee?.id && (
        <RemainingBalances
          employeeId={employee?.id}
          title={t("Remaining balances")}
          showEdit={false}
          schoolYearId={schoolYearId}
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
