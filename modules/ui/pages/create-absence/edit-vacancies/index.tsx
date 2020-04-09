import {
  Button,
  Divider,
  Grid,
  makeStyles,
  Typography,
  FormHelperText,
} from "@material-ui/core";
import { FieldArray, Formik, FormikErrors } from "formik";
import { useQueryBundle } from "graphql/hooks";
import { compact, isArray } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { Section } from "ui/components/section";
import { GetLocationsForEmployee } from "../graphql/get-locations-for-employee.gen";
import { VacancyDetail } from "../../../components/absence/types";
import { EditableVacancyDetailRow } from "./editable-vacancy-row";
import { usePayCodes } from "reference-data/pay-codes";
import * as yup from "yup";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import {
  isBefore,
  parseISO,
  isValid,
  areIntervalsOverlapping,
  isSameDay,
} from "date-fns";
import { getDateRangeDisplayTextWithDayOfWeek } from "ui/components/date-helpers";

type Props = {
  details: VacancyDetail[];
  orgId: string;
  employeeName: string;
  onCancel: () => void;
  onChangedVacancies: (data: VacancyDetail[]) => void;
  employeeId: string;
  setStep: (s: "absence") => void;
  absenceId?: string;
  actingAsEmployee?: boolean;
  positionName?: string;
  disabledDates?: Date[];
  defaultAccountingCode?: string;
  defaultPayCode?: string;
};

type EditVacancyFormData = {
  details: VacancyDetail[];
};

export const EditVacancies: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const initialFormData: EditVacancyFormData = {
    details: props.details.map(d => ({
      ...d,
      startTime: parseISO(d.startTime).toISOString(),
      endTime: parseISO(d.endTime).toISOString(),
      accountingCodeId: d.accountingCodeId ?? props.defaultAccountingCode,
      payCodeId: d.payCodeId ?? props.defaultPayCode,
    })),
  };

  const locationQuery = useQueryBundle(GetLocationsForEmployee, {
    variables: { id: props.employeeId },
  });
  const locationOptions: GetLocationsForEmployee.Locations[] =
    (locationQuery.state !== "LOADING" &&
      compact(locationQuery.data.employee?.byId?.locations)) ||
    [];

  const payCodes = usePayCodes(props.orgId);
  const payCodeOptions = useMemo(
    () => payCodes.map(c => ({ label: c.name, value: c.id })),
    [payCodes]
  );

  const accountingCodes = useAccountingCodes(props.orgId);

  if (props.details.length === 0) {
    props.setStep("absence");
    return <></>;
  }

  const pageHeader = props.absenceId
    ? `${t("Substitute details for absence ")} ${"#" + props.absenceId}`
    : t("Substitute details for a new absence");

  return (
    <Formik
      initialValues={initialFormData}
      onSubmit={(values: EditVacancyFormData) => {
        props.onChangedVacancies(values.details);
      }}
      validateOnChange={false}
      validateOnBlur={false}
      validationSchema={yup.object().shape({
        details: yup
          .array()
          .of(
            yup
              .object()
              .shape({
                startTime: yup.string().required(t("Required")),
                endTime: yup.string().required(t("Required")),
              })
              .test({
                name: "endBeforeStartCheck",
                test: function test(value) {
                  if (
                    isBefore(parseISO(value.endTime), parseISO(value.startTime))
                  ) {
                    return new yup.ValidationError(
                      t("End Time before Start Time"),
                      null,
                      `${this.path}.endTime`
                    );
                  }

                  return true;
                },
              })
          )
          .test({
            name: "detailsOverlapsCheck",
            test: value => {
              if (
                value.find((v: any) =>
                  isBefore(parseISO(v.endTime), parseISO(v.startTime))
                )
              ) {
                // endBeforeStartCheck test above will handle this scenario
                // We don't want to call areIntervalsOverlapping with invalid intervals
                return true;
              }

              const overlaps = value.filter(
                (v: any) =>
                  !!value.find((f: any) => {
                    if (v === f) {
                      return false;
                    }

                    if (
                      !(
                        isValid(parseISO(v.startTime)) &&
                        isValid(parseISO(v.endTime)) &&
                        isValid(parseISO(f.startTime)) &&
                        isValid(parseISO(f.endTime))
                      )
                    ) {
                      return false;
                    }

                    return areIntervalsOverlapping(
                      {
                        start: parseISO(v.startTime),
                        end: parseISO(v.endTime),
                      },
                      {
                        start: parseISO(f.startTime),
                        end: parseISO(f.endTime),
                      }
                    );
                  })
              );

              if (overlaps.length > 0) {
                return new yup.ValidationError(
                  t("Substitute times can not overlap"),
                  null,
                  "details"
                );
              }

              return true;
            },
          }),
      })}
    >
      {({ values, handleSubmit, errors }) => (
        <form onSubmit={handleSubmit}>
          <AbsenceVacancyHeader
            pageHeader={pageHeader}
            subHeader={props.employeeName}
            actingAsEmployee={props.actingAsEmployee}
          />
          <Section className={classes.vacancyDetails}>
            <Grid
              container
              spacing={2}
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography variant="h5">
                  {getDateRangeDisplayTextWithDayOfWeek(
                    props.details.map(d => parseISO(d.date)),
                    props.disabledDates
                  )}
                  {`${" - "}`} {props.positionName && `${props.positionName}`}
                </Typography>
                <Typography variant="h5"></Typography>
              </Grid>
              <Grid item>
                {errors && errors.details && !isArray(errors.details) && (
                  <FormHelperText error={true} className={classes.detailsError}>
                    {errors.details}
                  </FormHelperText>
                )}
              </Grid>
              <Grid item xs={12}>
                <Divider className={classes.divider} />
              </Grid>
            </Grid>

            <FieldArray
              name="details"
              render={arrayHelpers =>
                values.details.map((d, i) => {
                  const isFirstOnDay =
                    0 == i ||
                    !isSameDay(
                      parseISO(values.details[i - 1].date),
                      parseISO(d.date)
                    );
                  const isLastOnDay =
                    values.details.length - 1 == i ||
                    !isSameDay(
                      parseISO(values.details[i + 1].date),
                      parseISO(d.date)
                    );
                  return (
                    <Grid key={i} container>
                      <EditableVacancyDetailRow
                        actingAsEmployee={props.actingAsEmployee}
                        locationOptions={locationOptions}
                        accountingCodes={accountingCodes}
                        orgId={props.orgId}
                        payCodeOptions={payCodeOptions}
                        keyPrefix={`details.${i}`}
                        values={d}
                        className={i % 2 == 1 ? classes.shadedRow : undefined}
                        onAddRow={() => arrayHelpers.insert(i + 1, d)}
                        onRemoveRow={() => arrayHelpers.remove(i)}
                        showRemoveButton={mulitpleDetailsForDate(
                          values.details,
                          d
                        )}
                        error={
                          errors && errors.details && isArray(errors.details)
                            ? (errors.details[i] as FormikErrors<VacancyDetail>)
                            : undefined
                        }
                        isFirstOnDay={isFirstOnDay}
                        isLastOnDay={isLastOnDay}
                      />
                    </Grid>
                  );
                })
              }
            />

            <Grid container justify="flex-end" spacing={2}>
              <Grid item>
                <Button onClick={props.onCancel} variant="outlined">
                  {t("Cancel")}
                </Button>
              </Grid>
              <Grid item>
                <Button type={"submit"} variant="contained">
                  {t("Save")}
                </Button>
              </Grid>
            </Grid>
          </Section>
        </form>
      )}
    </Formik>
  );
};

const useStyles = makeStyles(theme => ({
  vacancyDetails: {
    marginTop: theme.spacing(3),
  },
  divider: {
    marginTop: theme.spacing(3),
  },
  shadedRow: {
    backgroundColor: theme.customColors.lightGray,
  },
  detailsError: {
    fontSize: theme.typography.pxToRem(14),
  },
}));

const mulitpleDetailsForDate = (details: VacancyDetail[], d: VacancyDetail) => {
  return details.filter(detail => detail.date === d.date).length > 1;
};
