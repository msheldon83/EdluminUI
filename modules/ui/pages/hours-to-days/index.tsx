import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Formik } from "formik";
import clsx from "clsx";
import * as yup from "yup";
import { startOfDay, format } from "date-fns";
import { FormikErrors } from "formik";
import { PageTitle } from "ui/components/page-title";
import { HoursToDaysRow } from "./hours-to-days-row";
import { Section } from "ui/components/section";

type Props = {};

type Case = {
  maxMinutes: number;
  name: string;
  dayFraction: number;
};

type HoursToDaysData = {
  cases: Case[];
  catchAll: {
    name: string;
    dayFraction: number;
  };
};

const formatMinutes = (minutes: number) =>
  `${Math.floor(minutes / 60)}:${(minutes % 60).toString().padStart(2, "0")}`;

export const HoursToDays: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const dummyData: HoursToDaysData = {
    cases: [
      {
        maxMinutes: 360,
        name: "First",
        dayFraction: 0.5,
      },
    ],
    catchAll: {
      name: "Last",
      dayFraction: 1,
    },
  };

  const today = startOfDay(new Date());
  const deleteRow = (
    currentCases: Case[],
    setFieldValue: (field: keyof HoursToDaysData, value: any) => void,
    i: number
  ) => () => {
    setFieldValue(
      "cases",
      currentCases.slice(0, i).concat(currentCases.slice(i + 1))
    );
  };
  const addRow = (
    currentCases: Case[],
    setFieldValue: (field: keyof HoursToDaysData, value: any) => void
  ) => () => {
    const last = currentCases[currentCases.length - 1];
    setFieldValue(
      "cases",
      currentCases.concat([
        {
          maxMinutes: last.maxMinutes + 1,
          name: "",
          dayFraction: last.dayFraction,
        },
      ])
    );
  };

  return (
    <>
      <PageTitle title={t("Hours-to-days conversion")} />
      <Formik
        initialValues={dummyData}
        onSubmit={() => {}}
        validationSchema={yup.object().shape({
          cases: yup
            .array()
            .of(
              yup.object().shape({
                maxMinutes: yup
                  .number()
                  .min(0, "maxMinutes must be non-negative")
                  .max(60 * 24, "There's only so many hours in a day!")
                  .required(),
                name: yup.string().required("Name must be non-empty"),
                dayFraction: yup
                  .number()
                  .min(0, "dayFraction must be non-negative")
                  .max(1, "dayFraction can be at most 1")
                  .required(),
              })
            )
            .test({
              name: "timesOrderedCheck",
              test: function test(cases: Case[]) {
                const reducer = (
                  acc: boolean | yup.ValidationError,
                  current: Case,
                  i: number
                ) => {
                  if (!acc) {
                    return acc;
                  }
                  if (
                    i == cases.length - 1 ||
                    current.maxMinutes < cases[i + 1].maxMinutes
                  ) {
                    return acc;
                  }
                  return new yup.ValidationError(
                    t("Time durations out of order"),
                    null,
                    `${this.path}.${i + 1}.maxMinutes`
                  );
                };
                const res = cases.reduce(reducer, true);
                return res;
              },
            }),
          catchAll: yup.object().shape({
            name: yup.string().required("Name must be non-empty"),
            dayFraction: yup
              .number()
              .min(0, "dayFraction must be non-negative")
              .max(1, "dayFraction can be at most 1")
              .required(),
          }),
        })}
      >
        {({ values, handleSubmit, setFieldValue, errors }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Section>
                <h4>
                  For position types that are paid in days, the assignment pay
                  amount will be rounded up to the nearest day equivalent
                  defined below
                </h4>
                <Grid container className={classes.rowContainer}>
                  <Grid item container>
                    <Grid item xs={1} className={classes.headerCell} />
                    <Grid item xs={3} className={classes.headerCell}>
                      Up to
                    </Grid>
                    <Grid item xs={4} className={classes.headerCell}>
                      Display Name
                    </Grid>
                    <Grid item xs={4} className={classes.headerCell}>
                      Day equivalent
                    </Grid>
                  </Grid>
                  {values.cases.map((c, i) => (
                    <HoursToDaysRow
                      key={`cases.${i}`}
                      keyPrefix={`cases.${i}`}
                      className={clsx(
                        i % 2 ? [classes.row, classes.shadedRow] : classes.row
                      )}
                      deleteThisRow={deleteRow(values.cases, setFieldValue, i)}
                      error={
                        errors && errors.cases && Array.isArray(errors.cases)
                          ? (errors.cases[i] as FormikErrors<Case>)
                          : undefined
                      }
                      {...c}
                    />
                  ))}
                  <HoursToDaysRow
                    keyPrefix={`catchAll`}
                    className={clsx(
                      values.cases.length % 2
                        ? [classes.row, classes.shadedRow]
                        : classes.row
                    )}
                    headerText={
                      values.cases.length
                        ? `Greater than ${formatMinutes(
                            values.cases[values.cases.length - 1].maxMinutes
                          )}`
                        : "All hours"
                    }
                    error={errors?.catchAll}
                    {...values.catchAll}
                  />
                </Grid>
                <Button
                  variant="outlined"
                  onClick={addRow(values.cases, setFieldValue)}
                >
                  {t("Add row")}
                </Button>
              </Section>
            </form>
          );
        }}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  rowContainer: {
    width: "70%",
    paddingRight: theme.spacing(4),
  },
  row: {
    padding: theme.spacing(1),
  },
  headerCell: {
    paddingRight: theme.spacing(4),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },
}));
