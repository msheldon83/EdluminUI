import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { SchoolYearSelect } from "ui/components/reference-selects/school-year-select";
import { ContractSelectCalendarChanges } from "./filters/contract-select";
import { LocationSelectCalendarChanges } from "./filters/location-select";
import { FilterQueryParams } from "ui/pages/calendars/filter-params";
import { useQueryParamIso } from "hooks/query-params";

type Props = {
  orgId: string;
  paginationReset: () => void;
};

export const ContractScheduleHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [filters, updateFilters] = useQueryParamIso(FilterQueryParams);

  const { orgId, paginationReset } = props;

  return (
    <>
      <div className={classes.select}>
        <SchoolYearSelect
          orgId={orgId}
          selectedSchoolYearId={filters.schoolYearId}
          defaultToCurrentSchoolYear={
            filters.schoolYearId === "" ? true : false
          }
          setSelectedSchoolYearId={(schoolYearId: string | undefined) => {
            updateFilters({ schoolYearId: schoolYearId });
            paginationReset();
          }}
        />
      </div>
      <div className={[classes.select, classes.fromSelect].join(" ")}>
        <ContractSelectCalendarChanges
          orgId={orgId}
          selectedContractId={
            filters.contractId === "" ? undefined : filters.contractId
          }
          setSelectedContractId={(contractId: string | undefined) => {
            updateFilters({ contractId: contractId });
            paginationReset();
          }}
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
          selectedLocationId={
            filters.locationId === "" ? undefined : filters.locationId
          }
          setSelectedLocationId={(locationId: string | undefined) => {
            updateFilters({ locationId: locationId });
            paginationReset();
          }}
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
