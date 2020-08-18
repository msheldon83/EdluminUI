import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { SchoolYearSelect } from "ui/components/reference-selects/school-year-select";
import { ContractSelectCalendarChanges } from "./filters/contract-select";
import { LocationSelectCalendarChanges } from "./filters/location-select";

type Props = {
  orgId: string;
  schoolYearId?: string;
  setSchoolYearId: React.Dispatch<React.SetStateAction<string | undefined>>;
  contractId?: string;
  setContractId: React.Dispatch<React.SetStateAction<string | undefined>>;
  locationIds?: string[];
  setLocationIds: React.Dispatch<React.SetStateAction<string[] | undefined>>;
};

export const ContractScheduleHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    setSchoolYearId,
    schoolYearId,
    contractId,
    locationIds,
    setContractId,
    setLocationIds,
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
      <div className={[classes.select, classes.fromSelect].join(" ")}>
        <ContractSelectCalendarChanges
          orgId={orgId}
          selectedContractId={contractId}
          setSelectedContractId={setContractId}
        />
      </div>
      <div
        className={[classes.select, classes.fromSelect, classes.width].join(
          " "
        )}
      >
        <LocationSelectCalendarChanges
          label={t("School")}
          orgId={orgId}
          selectedLocationIds={locationIds}
          setSelectedLocationIds={setLocationIds}
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
  },
  fromSelect: {
    marginLeft: theme.spacing(4),
  },
  width: {
    minWidth: theme.typography.pxToRem(250),
  },
}));
