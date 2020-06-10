import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  makeStyles,
} from "@material-ui/core";
import { DateFilter } from "./date-filter";
import { VerifyQueryFilters } from "./filter-params";
import { SharedFilters } from "./shared-filters";

type Props = {
  orgId: string;
  filters: VerifyQueryFilters;
  setFilters: (filters: VerifyQueryFilters) => void;
};

export const DailyFilters: React.FC<Props> = ({
  orgId,
  filters,
  setFilters,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Grid
      container
      justify="flex-start"
      spacing={2}
      className={classes.filters}
    >
      <DateFilter
        {...filters}
        setDate={date => {
          setFilters({
            ...filters,
            date,
          });
        }}
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
      <Grid
        item
        container
        xs={12}
        sm={6}
        md={3}
        lg={3}
        direction="column-reverse"
        className={classes.checkboxContainer}
      >
        <Grid>
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={filters.showVerified}
                onChange={e =>
                  setFilters({ ...filters, showVerified: e.target.checked })
                }
              />
            }
            label={t("Show Verified")}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

export const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  checkboxContainer: {
    textAlign: "right",
  },
}));
