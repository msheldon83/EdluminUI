import {
  Grid,
  IconButton,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { HighlightOff } from "@material-ui/icons";
import { formatDateIfPossible } from "helpers/date";
import * as React from "react";
import { useIsMobile } from "hooks";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";
import { FormikSelect } from "ui/components/form/formik-select";
import { FormikTimeInput } from "ui/components/form/formik-time-input";
import { FormikErrors, useFormikContext } from "formik";
import { startOfDay, parseISO, format } from "date-fns";
import {
  AccountingCodeDropdown,
  noAllocation,
} from "ui/components/form/accounting-code-dropdown";
import { GetLocationsForEmployee } from "../../graphql/get-locations-for-employee.gen";
import { VacancyDetail } from "../../types";

type Props = {
  locationOptions: GetLocationsForEmployee.Locations[];
  payCodeOptions: { label: string; value: string }[];
  accountingCodes:
    | Array<
        | {
            id: string;
            name: string;
            locationId?: string | null | undefined;
          }
        | null
        | undefined
      >
    | null
    | undefined;
  keyPrefix: string;
  orgId: string;
  detail: VacancyDetail;
  className?: string;
  showRemoveButton: boolean;
  actingAsEmployee?: boolean;
  onRemoveRow: () => void;
  onAddRow: () => void;
  error?: FormikErrors<VacancyDetail>;
  isFirstOnDay: boolean;
  isLastOnDay: boolean;
  multipleAccountingCodesInUse?: boolean;
};

export const EditableVacancyDetailRow: React.FC<Props> = props => {
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { t } = useTranslation();
  const { setFieldValue } = useFormikContext<any>();
  const {
    detail,
    locationOptions,
    payCodeOptions,
    keyPrefix,
    accountingCodes,
    error,
    className,
    isFirstOnDay,
    isLastOnDay,
    actingAsEmployee,
    showRemoveButton,
    onAddRow,
    onRemoveRow,
    multipleAccountingCodesInUse = false,
  } = props;

  const absenceStartTime = `${format(
    parseISO(detail.absenceStartTime!),
    "h:mm a"
  )}`;
  const absenceEndTime = `${format(
    parseISO(detail.absenceEndTime!),
    "h:mm a"
  )}`;

  const locationMenuOptions = locationOptions.map(loc => ({
    value: loc.id,
    label: loc.name,
  }));
  const fieldNamePrefix = keyPrefix;
  const locationId = detail.locationId;

  const accountingCodeOptions = useMemo(
    () =>
      accountingCodes
        ? accountingCodes
            .filter(x => x?.locationId === locationId || !x?.locationId)
            .map(a => ({ label: a?.name ?? "", value: a?.id ?? "" }))
        : [],
    [accountingCodes, locationId]
  );

  const date = parseISO(detail.date);
  const startOfDate = date ? startOfDay(date) : undefined;
  const startTimeError = error && error.startTime ? error.startTime : undefined;
  const endTimeError = error && error.endTime ? error.endTime : undefined;

  return (
    <>
      <Grid container className={[classes.rowContainer, className].join(" ")}>
        {isFirstOnDay && (
          <>
            <Grid item container className={classes.date}>
              <Typography variant="h6">
                {date && formatDateIfPossible(date, "MMMM d, yyyy")}
              </Typography>
            </Grid>
            <Grid item container className={classes.time}>
              <Grid item xs={isMobile ? 12 : 3}>
                {(absenceStartTime || absenceEndTime) && (
                  <Typography variant="h6">
                    {absenceStartTime} - {absenceEndTime}
                  </Typography>
                )}
              </Grid>
              <Grid item container xs={isMobile ? 12 : 8}>
                <Grid
                  item
                  xs={isMobile ? 12 : multipleAccountingCodesInUse ? 3 : 4}
                >
                  <Typography variant="h6">{t("School")}</Typography>
                </Grid>
                {!actingAsEmployee && (
                  <>
                    <Grid
                      item
                      xs={isMobile ? 12 : multipleAccountingCodesInUse ? 6 : 4}
                    >
                      <Typography variant="h6">
                        {t("Accounting Code")}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={isMobile ? 12 : multipleAccountingCodesInUse ? 3 : 4}
                    >
                      <Typography variant="h6">{t("Pay Code")}</Typography>
                    </Grid>
                  </>
                )}
              </Grid>
            </Grid>
          </>
        )}
        <Grid item container alignItems="flex-start">
          <Grid
            item
            container
            xs={isMobile ? 12 : 3}
            className={
              (classes.vacancyBlockItem,
              isMobile ? classes.mobileMargin : classes.noClass)
            }
          >
            <Grid item xs={5} className={classes.timeInput}>
              <FormikTimeInput
                name={`${fieldNamePrefix}.startTime`}
                date={startOfDate}
                inputStatus={startTimeError ? "error" : "default"}
                validationMessage={startTimeError}
              />
            </Grid>
            <Grid item xs={5} className={classes.timeInput}>
              <FormikTimeInput
                name={`${fieldNamePrefix}.endTime`}
                date={startOfDate}
                earliestTime={detail.startTime}
                inputStatus={endTimeError ? "error" : "default"}
                validationMessage={endTimeError}
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            xs={isMobile ? 12 : 8}
            className={
              (classes.vacancyBlockItem,
              isMobile ? classes.mobilePadding : classes.noClass)
            }
          >
            <Grid
              item
              xs={isMobile ? 12 : multipleAccountingCodesInUse ? 3 : 4}
              className={
                (classes.vacancyBlockItem,
                isMobile ? classes.mobileMargin : classes.noClass)
              }
            >
              <FormikSelect
                name={`${fieldNamePrefix}.locationId`}
                options={locationMenuOptions}
                withResetValue={false}
              />
            </Grid>
            {!actingAsEmployee && (
              <>
                <Grid
                  item
                  xs={isMobile ? 12 : multipleAccountingCodesInUse ? 6 : 4}
                  className={
                    (classes.vacancyBlockItem,
                    isMobile ? classes.mobileMargin : classes.spacing)
                  }
                >
                  <AccountingCodeDropdown
                    value={detail.accountingCodeAllocations ?? noAllocation()}
                    options={accountingCodeOptions}
                    onChange={value =>
                      setFieldValue(
                        `${fieldNamePrefix}.accountingCodeAllocations`,
                        value
                      )
                    }
                    showLabel={false}
                    inputStatus={
                      error?.accountingCodeAllocations ? "error" : undefined
                    }
                    validationMessage={error?.accountingCodeAllocations}
                  />
                </Grid>
                <Grid
                  item
                  xs={isMobile ? 12 : multipleAccountingCodesInUse ? 3 : 4}
                  className={
                    (classes.vacancyBlockItem,
                    isMobile ? classes.mobileMargin : classes.spacing)
                  }
                >
                  <FormikSelect
                    name={`${fieldNamePrefix}.payCodeId`}
                    options={payCodeOptions}
                    withResetValue={true}
                  />
                </Grid>
              </>
            )}
          </Grid>
          {showRemoveButton && (
            <Grid item>
              <IconButton onClick={onRemoveRow}>
                <HighlightOff />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </Grid>
      {isLastOnDay && (
        <Grid container>
          <Grid item container className={classes.addRow}>
            <Link onClick={onAddRow}>{t("Add row")}</Link>
          </Grid>
        </Grid>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  addRow: {
    padding: theme.spacing(1),
  },
  date: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  time: {
    paddingBottom: theme.spacing(1),
  },
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  mobilePadding: {
    paddingTop: theme.spacing(2),
  },
  rowContainer: {
    padding: theme.spacing(1),
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
  },
  timeInput: {
    marginRight: theme.spacing(1),
  },
  spacing: {
    //marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
  },
  mobileMargin: {
    marginBottom: theme.spacing(1),
  },
  noClass: {},
}));
