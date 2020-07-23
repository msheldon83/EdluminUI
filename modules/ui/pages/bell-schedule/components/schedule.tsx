import {
  FormHelperText,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { FormikValuesWatcher } from "atomic-object/forms/formik-watcher";
import {
  addMinutes,
  areIntervalsOverlapping,
  format,
  isBefore,
  isDate,
  isEqual,
  isValid,
  parseISO,
} from "date-fns";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import { TFunction } from "i18next";
import { isArray } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { AddPeriod, Period, travelDurationFromPeriods } from "../helpers";
import { ScheduleActionColumn } from "./schedule-columns/schedule-action-column";
import { ScheduleAfternoonColumn } from "./schedule-columns/schedule-afternoon-column";
import { ScheduleDurationColumn } from "./schedule-columns/schedule-duration-column";
import { ScheduleMorningColumn } from "./schedule-columns/schedule-morning-column";
import { ScheduleNamesColumn } from "./schedule-columns/schedule-names-column";
import { ScheduleTimesColumn } from "./schedule-columns/schedule-times-column";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";

type Props = {
  name?: string | null | undefined;
  isStandard: boolean;
  periods: Array<Period>;
  variantId?: string | null | undefined;
  submitLabel?: string | null | undefined;
  onSubmit: (
    periods: Array<Period>,
    variantId?: string | null | undefined
  ) => void;
  onCancel: () => void;
};

const travelDuration = 0; // TODO:: Get this from Org Config once we built that out
const minNumberOfPeriods = 1;

export const Schedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const setPeriods = (periods: Period[], setFieldValue: Function) => {
    setFieldValue("periods", periods);
  };

  // Determine if we already have an End of Day period or not
  const endOfDayPeriod = useMemo(() => {
    const periodMarkedAsEndOfDay = props.periods.find(p => p.isEndOfDayPeriod);
    if (periodMarkedAsEndOfDay) {
      return periodMarkedAsEndOfDay;
    }

    // Figure out the End of Day by the details of the last non skipped Period
    const nonSkippedPeriods = props.periods.filter(p => !p.skipped);
    const lastPeriod = nonSkippedPeriods[nonSkippedPeriods.length - 1];
    return props.variantId &&
      lastPeriod.startTime &&
      lastPeriod.endTime &&
      isEqual(parseISO(lastPeriod.startTime), parseISO(lastPeriod.endTime))
      ? lastPeriod
      : undefined;
  }, [props.periods, props.variantId]);
  const periodsMinusEndOfDay = useMemo(() => {
    return endOfDayPeriod
      ? props.periods.filter(p => p !== endOfDayPeriod)
      : props.periods;
  }, [endOfDayPeriod, props.periods]);

  return (
    <Section borderTopRadius={false}>
      <Formik
        initialValues={{
          periods: periodsMinusEndOfDay,
        }}
        enableReinitialize={true}
        onSubmit={(data, meta) => {
          // Add the end of Day period in here before returning
          const periods = data.periods;
          const nonSkippedPeriods = periods.filter(p => !p.skipped);
          if (endOfDayPeriod) {
            endOfDayPeriod.startTime =
              nonSkippedPeriods[nonSkippedPeriods.length - 1].endTime;
            endOfDayPeriod.endTime =
              nonSkippedPeriods[nonSkippedPeriods.length - 1].endTime;
            periods.push({
              ...endOfDayPeriod,
              isEndOfDayPeriod: true,
            });
          } else {
            periods.push({
              name: "EndOfDay",
              placeholder: "EndOfDay",
              startTime:
                nonSkippedPeriods[nonSkippedPeriods.length - 1].endTime,
              endTime: nonSkippedPeriods[nonSkippedPeriods.length - 1].endTime,
              skipped: false,
              isEndOfDayPeriod: true,
            });
          }

          props.onSubmit(periods, props.variantId);
        }}
        validateOnChange={false}
        validateOnBlur={false}
        validationSchema={yup.object().shape({
          periods: yup
            .array()
            .of(
              yup
                .object()
                .shape({
                  startTime: yup.string().when("skipped", {
                    is: false,
                    then: yup.string().required(t("Required")),
                  }),
                  endTime: yup.string().when("skipped", {
                    is: false,
                    then: yup.string().required(t("Required")),
                  }),
                })
                .test({
                  name: "endBeforeStartCheck",
                  test: function test(value) {
                    if (
                      isBefore(
                        parseISO(value.endTime),
                        parseISO(value.startTime)
                      )
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
              name: "periodOverlapsCheck",
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
                    !!value.find(
                      (f: any) =>
                        v !== f &&
                        isValid(parseISO(v.startTime)) &&
                        isValid(parseISO(v.endTime)) &&
                        isValid(parseISO(f.startTime)) &&
                        isValid(parseISO(f.endTime)) &&
                        areIntervalsOverlapping(
                          {
                            start: parseISO(v.startTime),
                            end: parseISO(v.endTime),
                          },
                          {
                            start: parseISO(f.startTime),
                            end: parseISO(f.endTime),
                          }
                        )
                    )
                );

                if (overlaps.length > 0) {
                  return new yup.ValidationError(
                    t("Period times can not overlap"),
                    null,
                    "periods"
                  );
                }

                return true;
              },
            }),
        })}
      >
        {({ handleSubmit, values, setFieldValue, submitForm, errors }) => (
          <form onSubmit={handleSubmit}>
            <FormikValuesWatcher
              onChange={(prev: { periods: Period[] }, next) => {
                prev.periods.map((p, i) => {
                  if (!next.periods[i]) return;
                  const nextEnd = next.periods[i].endTime;
                  const nextPeriod = next.periods[i + 1];
                  if (
                    nextEnd &&
                    p.endTime !== nextEnd &&
                    nextPeriod &&
                    !nextPeriod.startTime
                  ) {
                    setFieldValue(
                      `periods.${i + 1}.startTime` as any,
                      addMinutes(
                        new Date(nextEnd),
                        travelDuration
                      ).toISOString()
                    );
                  }
                });
              }}
            />
            <Grid container justify="space-between" alignItems="center">
              <Grid item>
                {props.name && <SectionHeader title={props.name} />}
              </Grid>
              <Grid item>
                {errors && errors.periods && !isArray(errors.periods) && (
                  <FormHelperText
                    error={true}
                    className={classes.scheduleError}
                  >
                    {errors.periods}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>

            <div className={classes.scheduleContainer}>
              <div>
                <Can do={[PermissionEnum.ScheduleSettingsSave]}>
                  <ScheduleActionColumn
                    periods={values.periods}
                    isStandard={props.isStandard}
                    minNumberOfPeriods={minNumberOfPeriods}
                    setPeriods={(periods: Period[]) =>
                      setPeriods(periods, setFieldValue)
                    }
                    scheduleClasses={classes}
                  />
                </Can>
              </div>
              <div>
                <ScheduleNamesColumn
                  periods={values.periods}
                  isStandard={props.isStandard}
                  setPeriods={(periods: Period[]) =>
                    setPeriods(periods, setFieldValue)
                  }
                  setFieldValue={setFieldValue}
                  scheduleClasses={classes}
                />
              </div>
              <div className={classes.startOfAfternoonContainer}>
                <ScheduleAfternoonColumn
                  periods={values.periods}
                  setPeriods={(periods: Period[]) =>
                    setPeriods(periods, setFieldValue)
                  }
                  scheduleClasses={classes}
                />
              </div>
              <div>
                <ScheduleTimesColumn
                  periods={values.periods}
                  errors={errors}
                  setFieldValue={setFieldValue}
                  scheduleClasses={classes}
                />
              </div>
              <div className={classes.endOfMorningContainer}>
                <ScheduleMorningColumn
                  periods={values.periods}
                  setPeriods={(periods: Period[]) =>
                    setPeriods(periods, setFieldValue)
                  }
                  scheduleClasses={classes}
                />
              </div>
              <div>
                <ScheduleDurationColumn
                  periods={values.periods}
                  scheduleClasses={classes}
                />
              </div>
            </div>
            {displayEndOfDay(values.periods, t, classes)}
            <Can do={[PermissionEnum.ScheduleSettingsSave]}>
              <ActionButtons
                submit={{
                  text: props.submitLabel || t("Save"),
                  execute: submitForm,
                }}
                cancel={{ text: t("Cancel"), execute: props.onCancel }}
                additionalActions={
                  props.isStandard
                    ? [
                        {
                          text: t("Add Row"),
                          execute: () => {
                            /*
                              Get the travel duration from the previous 2 periods to use for the
                              new period
                            */
                            const targetPeriodIndex = values.periods.length - 2;
                            const previousTravelDuration =
                              targetPeriodIndex < 0
                                ? 0
                                : travelDurationFromPeriods(
                                    values.periods,
                                    values.periods[targetPeriodIndex],
                                    targetPeriodIndex
                                  );

                            const updatedPeriods = AddPeriod(
                              values.periods,
                              previousTravelDuration,
                              t
                            );
                            setFieldValue("periods", updatedPeriods);
                          },
                        },
                      ]
                    : []
                }
              />
            </Can>
          </form>
        )}
      </Formik>
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  scheduleContainer: {
    display: "flex",
  },
  endOfMorningContainer: {
    flexGrow: 1,
  },
  startOfAfternoonContainer: {
    flexGrow: 1,
  },
  period: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    height: theme.typography.pxToRem(75),
  },
  alternatingItem: {
    background: theme.customColors.lightGray,
    borderTop: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
  },
  skippedPeriod: {
    color: theme.customColors.gray,
  },
  scheduleError: {
    fontSize: theme.typography.pxToRem(14),
  },
  action: {
    cursor: "pointer",
    color: "initial",
  },
  hidden: {
    visibility: "hidden",
  },
  endOfDayLabel: {
    paddingLeft: theme.spacing(7),
  },
  endOfDayTime: {
    flexGrow: 2,
    textAlign: "center",
  },
}));

const displayEndOfDay = (periods: Period[], t: TFunction, classes: any) => {
  const numberOfPeriods = periods.length;
  const endOfDayClass = [classes.period];
  if (numberOfPeriods % 2 === 1) {
    endOfDayClass.push(classes.alternatingItem);
  }

  const activePeriods = periods.filter(p => !p.skipped);
  const endOfDayTime =
    activePeriods[activePeriods.length - 1] &&
    activePeriods[activePeriods.length - 1].endTime
      ? parseISO(activePeriods[activePeriods.length - 1].endTime!)
      : undefined;

  return (
    <div className={endOfDayClass.join(" ")}>
      <div className={classes.endOfDayLabel}>
        <Typography variant="h6">{t("End of day")}</Typography>
      </div>
      <div className={classes.endOfDayTime}>
        <Typography variant="h6">
          {endOfDayTime &&
            isValid(endOfDayTime) &&
            isDate(endOfDayTime) &&
            format(endOfDayTime, "h:mm a")}
        </Typography>
      </div>
    </div>
  );
};
