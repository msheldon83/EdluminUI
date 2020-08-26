import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { SchoolYearSelect } from "ui/components/reference-selects/school-year-select";
import { ContractSelect } from "ui/components/reference-selects/contract-select";
import clsx from "clsx";

type Props = {
  orgId: string;
  schoolYearId?: string;
  setSchoolYearId: React.Dispatch<React.SetStateAction<string | undefined>>;
  contractId?: string;
  setContractId: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export const ContractScheduleHeader: React.FC<Props> = props => {
  const classes = useStyles();

  const {
    setSchoolYearId,
    schoolYearId,
    contractId,
    setContractId,
    orgId,
  } = props;

  return (
    <>
      <div className={classes.select}>
        <SchoolYearSelect
          orgId={orgId}
          selectedSchoolYearId={schoolYearId}
          setSelectedSchoolYearId={setSchoolYearId}
        />
      </div>
      <div className={clsx(classes.select, classes.fromSelect)}>
        <ContractSelect
          orgId={orgId}
          selectedContractId={contractId}
          setSelectedContractId={setContractId}
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
