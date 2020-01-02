import * as React from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectValueType } from "ui/components/form/select";
import { OptionTypeBase, ValueType, OptionsType } from "react-select/src/types";
import { Grid, InputLabel, makeStyles } from "@material-ui/core";
import { useAllSchoolYears } from "reference-data/school-years";
import { parseISO } from "date-fns";
import { useContracts } from "reference-data/contracts";

type Props = {
  view: "list" | "calendar";
  orgId: string;
  schoolYearValue: number;
  setSchoolYear: React.Dispatch<React.SetStateAction<number>>;
  contractValue: number;
  setContract: React.Dispatch<React.SetStateAction<number>>;
};

export const ContractScheduleHeader: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const schoolYears = useAllSchoolYears(props.orgId);
  const schoolOptions = schoolYears.map(sy => {
    const startYear = parseISO(sy.startDate).getFullYear();
    const endYear = parseISO(sy.endDate).getFullYear();
    return { label: `${startYear} - ${endYear}`, value: parseInt(sy.id) };
  });

  //initialize drop down
  if (schoolYears.length > 0 && props.schoolYearValue === undefined) {
    const cy = schoolYears.find(sy => sy.isCurrentSchoolYear)?.id;
    if (cy) {
      props.setSchoolYear(parseInt(cy));
    }
  }

  const contracts = useContracts(props.orgId);
  const contractOptions = contracts.map(c => {
    return { label: c.name, value: parseInt(c.id) };
  });
  contractOptions.unshift({ label: "All Contracts", value: 0 });

  const contractValue = () => {
    const value = props.contractValue == null ? 0 : props.contractValue;
    return contractOptions.find((c: any) => c.value === value);
  };

  return (
    <>
      <div className={classes.select}>
        <Select
          withDropdownIndicator
          options={schoolOptions}
          value={schoolOptions.find(
            (s: any) => s.value === props.schoolYearValue
          )}
          onChange={(e: SelectValueType) => {
            let selectedValue = null;
            if (e) {
              selectedValue = (e as OptionTypeBase).value;
            }
            props.setSchoolYear(selectedValue);
          }}
          isClearable={false}
        />
      </div>

      <div className={[classes.select, classes.fromSelect].join(" ")}>
        <Select
          withDropdownIndicator
          options={contractOptions}
          value={contractValue()}
          onChange={(e: SelectValueType) => {
            let selectedValue = null;
            if (e) {
              selectedValue =
                (e as OptionTypeBase).value === 0
                  ? null
                  : (e as OptionTypeBase).value;
            }
            props.setContract(selectedValue);
          }}
          isClearable={false}
        />
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  select: {
    display: "flex",
    flexDirection: "column",
    minWidth: theme.typography.pxToRem(250),
  },
  fromSelect: {
    marginLeft: theme.spacing(6),
  },
}));
