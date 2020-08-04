import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles } from "@material-ui/core";
import { VerifyQueryFilters } from "./filter-params";
import { DateRangeFilter } from "./date-range-filter";
import { SharedFilters } from "./shared-filters";

type Props = {
  orgId: string;
  filters: VerifyQueryFilters;
  setFilters: (filters: VerifyQueryFilters) => void;
};

export const OverviewFilters: React.FC<Props> = ({
  orgId,
  filters,
  setFilters,
}) => {
  const classes = useStyles();

  return (
    <>
      <Grid
        container
        alignItems="center"
        justify="flex-start"
        spacing={2}
        className={classes.filters}
      >
        <DateRangeFilter
          {...filters}
          setDateRange={(dateRangeStart, dateRangeEnd) =>
            setFilters({
              ...filters,
              dateRangeStart,
              dateRangeEnd,
              confettiOnFinished: false,
            })
          }
        />
        <SharedFilters
          {...filters}
          orgId={orgId}
          setLocationIds={ids =>
            setFilters({
              ...filters,
              locationIds: ids ?? [],
            })
          }
          setSubSource={source =>
            setFilters({
              ...filters,
              subSource: source ?? "",
            })
          }
        />
      </Grid>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  label: {
    // color: theme.customColors.black,
    fontWeight: 500,
    marginBottom: theme.typography.pxToRem(16),
  },
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
