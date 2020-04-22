import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Formik } from "formik";
import clsx from "clsx";
import { PageTitle } from "ui/components/page-title";
import { HoursToDaysRow } from "./hours-to-days-row";
import { Section } from "ui/components/section";

type Props = {};

export const HoursToDays: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <PageTitle title={t("Hours-to-days conversion")} />
      <Formik initialValues={{}} onSubmit={() => {}}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <h4>
                For position types that are paid in days, the assignment pay
                amount will be rounded up to the nearest day equivalent defined
                below
              </h4>
              <Grid container className={classes.rowContainer}>
                <HoursToDaysRow
                  keyPrefix={"Sample"}
                  time={new Date()}
                  name={"This"}
                  dayFraction={1}
                  className={classes.row}
                />
                <HoursToDaysRow
                  keyPrefix={"Other"}
                  time={"Test"}
                  name={"This"}
                  dayFraction={1}
                  className={clsx(classes.row, classes.shadedRow)}
                />
              </Grid>
            </Section>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  rowContainer: {
    width: "60%",
    paddingRight: "10%",
  },
  row: {
    padding: theme.spacing(1),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },
}));
