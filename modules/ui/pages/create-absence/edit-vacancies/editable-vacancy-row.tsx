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
import { GetLocationsForEmployee } from "../graphql/get-locations-for-employee.gen";
import { VacancyDetail } from "../../../components/absence/types";
import { FormikErrors } from "formik";
import { startOfDay, parseISO, format } from "date-fns";

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
  values: VacancyDetail;
  className?: string;
  showRemoveButton: boolean;
  actingAsEmployee?: boolean;
  onRemoveRow: () => void;
  onAddRow: () => void;
  error?: FormikErrors<VacancyDetail>;
  isFirstOnDay: boolean;
  isLastOnDay: boolean;
};

export const EditableVacancyDetailRow: React.FC<Props> = props => {
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  const absenceStartTime = `${format(
    parseISO(props.values.absenceStartTime!),
    "h:mm a"
  )}`;
  const absenceEndTime = `${format(
    parseISO(props.values.absenceEndTime!),
    "h:mm a"
  )}`;

  const locationMenuOptions = props.locationOptions.map(loc => ({
    value: loc.id,
    label: loc.name,
  }));
  const fieldNamePrefix = props.keyPrefix;
  const locationId = props.values.locationId;

  const accountingCodes = props.accountingCodes;

  const accountingCodeOptions = useMemo(
    () =>
      accountingCodes
        ? accountingCodes
            .filter(x => x?.locationId === locationId || !x?.locationId)
            .map(a => ({ label: a?.name ?? "", value: a?.id ?? "" }))
        : [],
    [accountingCodes, locationId]
  );

  const date = parseISO(props.values.date);
  const startOfDate = date ? startOfDay(date) : undefined;
  const startTimeError =
    props.error && props.error.startTime ? props.error.startTime : undefined;
  const endTimeError =
    props.error && props.error.endTime ? props.error.endTime : undefined;

  return (
    <>
      <Grid
        container
        className={[classes.rowContainer, props.className].join(" ")}
      >
        {props.isFirstOnDay && (
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
                <Grid item xs={isMobile ? 12 : 4}>
                  <Typography variant="h6">{t("School")}</Typography>
                </Grid>
                <Grid item xs={isMobile ? 12 : 4}>
                  <Typography variant="h6">{t("Accounting Code")}</Typography>
                </Grid>
                <Grid item xs={isMobile ? 12 : 4}>
                  <Typography variant="h6">{t("Pay Code")}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </>
        )}
        <Grid item container alignItems="center">
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
                earliestTime={props.values.startTime}
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
              xs={isMobile ? 12 : 4}
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
            {!props.actingAsEmployee && (
              <>
                <Grid
                  item
                  xs={isMobile ? 12 : 4}
                  className={
                    (classes.vacancyBlockItem,
                    isMobile ? classes.mobileMargin : classes.spacing)
                  }
                >
                  <FormikSelect
                    name={`${fieldNamePrefix}.accountingCodeId`}
                    options={accountingCodeOptions}
                    withResetValue={true}
                  />
                </Grid>
                <Grid
                  item
                  xs={isMobile ? 12 : 4}
                  className={
                    (classes.vacancyBlockItem,
                    isMobile ? classes.mobileMargin : classes.spacing)
                  }
                >
                  <FormikSelect
                    name={`${fieldNamePrefix}.payCodeId`}
                    options={props.payCodeOptions}
                    withResetValue={true}
                  />
                </Grid>
              </>
            )}
          </Grid>
          {props.showRemoveButton && (
            <Grid item>
              <IconButton onClick={props.onRemoveRow}>
                <HighlightOff />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </Grid>
      {props.isLastOnDay && (
        <Grid container>
          <Grid item container className={classes.addRow}>
            <Link onClick={props.onAddRow}>{t("Add row")}</Link>
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
