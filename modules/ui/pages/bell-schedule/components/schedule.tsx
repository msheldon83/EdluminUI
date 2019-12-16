import { FormHelperText, makeStyles, Grid } from "@material-ui/core";
import { isBefore, parseISO, areIntervalsOverlapping } from "date-fns";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import * as yup from "yup";
import { ActionButtons } from "../../../components/action-buttons";
import { Period, AddPeriod } from "../helpers";
import { isArray } from "lodash-es";
import { ScheduleActionColumn } from "./schedule-columns/schedule-action-column";
import { ScheduleNamesColumn } from "./schedule-columns/schedule-names-column";
import { ScheduleAfternoonColumn } from "./schedule-columns/schedule-afternoon-column";
import { ScheduleMorningColumn } from "./schedule-columns/schedule-morning-column";
import { ScheduleTimesColumn } from "./schedule-columns/schedule-times-column";
import { ScheduleDurationColumn } from "./schedule-columns/schedule-duration-column";

type Props = {
  name?: string | null | undefined;
  isStandard: boolean;
  periods: Array<Period>;
  variantId?: number | null | undefined;
  submitLabel?: string | null | undefined;
  onSubmit: (
    periods: Array<Period>,
    variantId?: number | null | undefined
  ) => void;
  onCancel: () => void;
};

const travelDuration = 5;
const minNumberOfPeriods = 1;

export const Schedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const setPeriods = (periods: Period[], setFieldValue: Function) => {
    setFieldValue("periods", periods);
  };

  return (
    <Section>
      <Formik
        initialValues={{
          periods: props.periods,
        }}
        enableReinitialize={true}
        onSubmit={(data, meta) => {
          props.onSubmit(data.periods, props.variantId);
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
                <ScheduleActionColumn
                  periods={values.periods}
                  isStandard={props.isStandard}
                  minNumberOfPeriods={minNumberOfPeriods}
                  setPeriods={(periods: Period[]) =>
                    setPeriods(periods, setFieldValue)
                  }
                  scheduleClasses={classes}
                />
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
                  travelDuration={travelDuration}
                  setPeriods={(periods: Period[]) =>
                    setPeriods(periods, setFieldValue)
                  }
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
                  travelDuration={travelDuration}
                  scheduleClasses={classes}
                />
              </div>
            </div>

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
                          const updatedPeriods = AddPeriod(
                            values.periods,
                            travelDuration,
                            t
                          );
                          setFieldValue("periods", updatedPeriods);
                        },
                      },
                    ]
                  : []
              }
            />
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
}));
