import * as React from "react";
import { useTranslation } from "react-i18next";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { OptionTypeBase } from "react-select/src/types";
import { makeStyles } from "@material-ui/core";
import { useAllSchoolYears } from "reference-data/school-years";
import { parseISO } from "date-fns";
import { useContracts } from "reference-data/contracts";

type Props = {
  view: "list" | "calendar";
  orgId: string;
  schoolYearValue: number;
  setSchoolYear: React.Dispatch<React.SetStateAction<any>>;
  contractValue: number;
  setContract: React.Dispatch<React.SetStateAction<any>>;
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
    const cy = schoolYears.find(sy => sy.isCurrentSchoolYear);
    if (cy) {
      props.setSchoolYear(cy);
    }
  }

  const contracts = useContracts(props.orgId);
  const contractOptions = contracts.map(c => {
    return { label: c.name, value: parseInt(c.id) };
  });
  contractOptions.unshift({ label: "All Contracts", value: 0 });

  const contractValue = () => {
    //const value = props.contractValue === undefined ? 0 : props.contractValue;
    const value = contractOptions.find(
      (c: any) => c.value === props.contractValue
    );
    return value;
  };

  const schoolValue = () => {
    const value = schoolOptions.find(
      (s: any) => s.value === props.schoolYearValue
    );
    return value;
  };

  return (
    <>
      <div className={classes.select}>
        <SelectNew
          options={schoolOptions}
          value={schoolValue()}
          onChange={(e: OptionType) => {
            let selectedValue: any = null;
            if (e) {
              selectedValue = (e as OptionTypeBase).value;
            }
            props.setSchoolYear(
              schoolYears.find(sy => sy.id === selectedValue.toString())
            );
          }}
          multiple={false}
        />
      </div>
      <div className={[classes.select, classes.fromSelect].join(" ")}>
        <SelectNew
          options={contractOptions}
          value={contractValue()}
          onChange={(e: OptionType) => {
            let selectedValue: any = null;
            if (e) {
              selectedValue =
                (e as OptionTypeBase).value === 0
                  ? null
                  : (e as OptionTypeBase).value;
            }

            if (selectedValue === null || undefined) {
              props.setContract(undefined);
            } else {
              props.setContract(
                contracts.find(c => c.id === selectedValue.toString())
              );
            }
          }}
          multiple={false}
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
