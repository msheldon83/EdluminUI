import * as React from "react";
import { useState } from "react";
import { LazyQueryResult } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import {
  makeStyles,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  CircularProgress,
} from "@material-ui/core";
import { parseISO, startOfToday } from "date-fns";
import { TextButton } from "ui/components/text-button";
import { ReportFilterField } from "graphql/server-types.gen";
import { DateRangePicker } from "ui/components/form/date-range-picker";
import { getDateRangeFromRelativeDates } from "ui/components/reporting/helpers";
import { pastPresetDateRanges } from "ui/components/form/hooks/use-preset-date-ranges";

export const RunNowDialog: React.FC<{
  open: boolean;
  download: (filters: ReportFilterField[]) => Promise<LazyQueryResult<any>>;
  close: () => void;
  initialFilters: ReportFilterField[];
}> = ({ open, download, close, initialFilters }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [filters, setFilters] = useState(initialFilters);
  const [downloading, setDownloading] = useState(false);

  const resolveStartEndDates = (filterField: ReportFilterField) => {
    const [startStr, endStr] = filterField?.arguments ?? [];
    let start = startStr ? parseISO(startStr) : startOfToday();
    let end = endStr ? parseISO(endStr) : startOfToday();

    if (filterField) {
      // Might be relative date strings. Find matching dates
      const dateRange = getDateRangeFromRelativeDates(
        startStr ?? "",
        endStr ?? ""
      );
      if (dateRange) {
        start = dateRange[0] ?? start;
        end = dateRange[1] ?? end;
      }
    }
    return [start, end];
  };

  // Making an assumption of a single date range filter for now
  const filterField = initialFilters[0];
  const [initialStart, initialEnd] = resolveStartEndDates(initialFilters[0]);
  const [start, end] = resolveStartEndDates(filters[0]);

  const handleDownloadClick = async () => {
    setDownloading(true);
    const { error } = await download(filters);
    setDownloading(false);
    close();
  };

  return (
    <Dialog fullWidth={true} maxWidth="sm" open={open} onClose={close}>
      <DialogTitle disableTypography>
        <Typography variant="h5">{t("Run now")}</Typography>
      </DialogTitle>
      <DialogContent>
        <DateRangePicker
          startDate={start}
          endDate={end}
          presets={pastPresetDateRanges}
          additionalPresets={[
            {
              label: t("Default"),
              value: "default",
              range() {
                // Including Today
                return {
                  start: initialStart,
                  end: initialEnd,
                };
              },
            },
          ]}
          onDateRangeSelected={(newStart: Date, newEnd: Date) => {
            if (start != newStart || end != newEnd) {
              const newFilter = {
                ...filterField,
                arguments: [newStart.toISOString(), newEnd.toISOString()],
              };
              setFilters([newFilter]);
            }
          }}
        />
      </DialogContent>
      <Divider className={classes.divider} />
      <DialogActions>
        <TextButton onClick={close} className={classes.buttonSpacing}>
          {t("Cancel")}
        </TextButton>
        <Button
          variant="contained"
          onClick={handleDownloadClick}
          disabled={downloading}
        >
          {downloading ? (
            <>
              {t("Downloading")}
              <CircularProgress size={24} className={classes.buttonProgress} />
            </>
          ) : (
            t("Download")
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  cancel: { color: theme.customColors.blue },
  buttonProgress: {
    marginLeft: theme.spacing(1),
  },
}));
