import * as React from "react";
import { useState, useMemo } from "react";
import { makeStyles, Select, MenuItem } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { PageTitle } from "ui/components/page-title";
import { useTranslation } from "react-i18next";
import { useGetEmployee } from "reference-data/employee";
import { RemainingBalances } from "./components/remaining-balances";
import { useAllSchoolYears } from "reference-data/school-years";
import { SectionHeader } from "ui/components/section-header";
import { parseISO, format } from "date-fns";

type Props = {};

export const EmployeePtoBalances: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const employee = useGetEmployee();
  const schoolYears = useAllSchoolYears(employee?.orgId.toString());
  const currentSchoolYear = useMemo(
    () => schoolYears.find(sy => sy.isCurrentSchoolYear),
    [schoolYears]
  );

  const [schoolYearId, setSchoolYearId] = useState<string | undefined>(
    currentSchoolYear?.id
  );

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

  const onChangeSchoolYear = React.useCallback(
    e => {
      setSchoolYearId(e.target.value);
    },
    [setSchoolYearId]
  );

  return (
    <>
      <SectionHeader title={t("Time off balances")} />
      <Select
        disableUnderline={true}
        IconComponent={ExpandMoreIcon}
        className={[classes.header].join(" ")}
        value={schoolYearId}
        onChange={onChangeSchoolYear}
        inputProps={{
          name: "",
          classes: {
            icon: classes.iconExpanded,
          },
        }}
      >
        {schoolYearOptions.map(syo => (
          <MenuItem
            key={syo.value}
            value={syo.value}
            className={[classes.header].join(" ")}
          >
            {syo.label}
          </MenuItem>
        ))}
      </Select>
      <RemainingBalances
        employeeId={employee?.id}
        title={t("Remaining balances")}
        showEdit={false}
        schoolYearId={schoolYearId}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    letterSpacing: theme.typography.pxToRem(-1.5),
    lineHeight: theme.typography.pxToRem(64),
    marginBottom: theme.spacing(1),
    fontSize: theme.typography.pxToRem(48),
    fontWeight: "bold",
    width: theme.typography.pxToRem(280),
  },
  iconExpanded: {
    marginRight: theme.typography.pxToRem(15),
  },
  iconNotExpanded: {
    marginLeft: theme.typography.pxToRem(24),
    marginBottom: theme.typography.pxToRem(8),
  },
  list: {
    padding: 0,
    "&selected": {
      color: theme.customColors.white,
    },
  },
}));
