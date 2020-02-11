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
import { startOfDay, parseISO } from "date-fns";

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
};

export const EditableVacancyDetailRow: React.FC<Props> = props => {
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

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
    <Grid
      container
      className={[classes.rowContainer, props.className].join(" ")}
    >
      <Grid item container>
        <Typography variant="h6">
          {date && formatDateIfPossible(date, "MMMM d, yyyy")}
        </Typography>
      </Grid>
      <Grid item container alignItems="center">
        <Grid
          item
          container
          xs={isMobile ? 12 : 4}
          className={
            (classes.vacancyBlockItem,
            isMobile ? classes.margin : classes.noClass)
          }
        >
          <Grid item xs={isMobile ? 5 : 4} className={classes.timeInput}>
            <FormikTimeInput
              name={`${fieldNamePrefix}.startTime`}
              date={startOfDate}
              inputStatus={startTimeError ? "error" : "default"}
              validationMessage={startTimeError}
            />
          </Grid>
          <Grid item xs={isMobile ? 5 : 4} className={classes.timeInput}>
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
          xs={isMobile ? 12 : 7}
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
              isMobile ? classes.margin : classes.noClass)
            }
          >
            {t("School")}
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
                  isMobile ? classes.margin : classes.spacing)
                }
              >
                {t("Accounting Code")}
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
                  isMobile ? classes.margin : classes.spacing)
                }
              >
                {t("Pay Code")}
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
      <Grid item container>
        <Link onClick={props.onAddRow}>{t("Add row")}</Link>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
    marginRight: theme.spacing(1),
  },
  mobilePadding: {
    paddingTop: theme.spacing(2),
  },
  rowContainer: {
    padding: theme.spacing(2),
  },
  timeInput: {
    marginRight: theme.spacing(1),
  },
  spacing: {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
  },
  margin: {
    marginBottom: theme.spacing(1),
  },
  noClass: {},
}));
