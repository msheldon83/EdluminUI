import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { Formik } from "formik";
import clsx from "clsx";
import * as yup from "yup";
import { format, parseISO } from "date-fns";
import { VacancyDetailVerifyInput } from "graphql/server-types.gen";
import { AssignmentRow } from "./types";
import { ProgressBar } from "./components/progess-bar";

type FormProps = {
  startTime: string;
  endTime: string;
  position: string;
  school: string;
  initialAccountingCode?: { id: string; name: string };
  initialPayCode?: { id: string; name: string };
  initialPayDuration?: string;
  isOpen: boolean;
  onVerify: (verifyInput: VacancyDetailVerifyInput) => void;
};
const AssignmentForm: React.FC<FormProps> = ({
  startTime,
  endTime,
  position,
  school,
  initialPayDuration,
  initialPayCode,
  initialAccountingCode,
  isOpen,
  onVerify,
}) => {
  const { t } = useTranslation();
  const [payDuration, setPayDuration] = React.useState<string>(
    initialPayDuration ?? ""
  );
  const [payCode, setPayCode] = React.useState<
    { id: string; name: string } | undefined
  >(initialPayCode);
  const [accountingCode, setAccountingCode] = React.useState<
    { id: string; name: string } | undefined
  >(initialAccountingCode);

  const staticSection = (
    <>
      <Grid item xs={4}>
        <Typography>{`${format(parseISO(startTime), "h:mm aaa")} - ${format(
          parseISO(endTime),
          "h:mm aaa"
        )}`}</Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography>{position}</Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography>{school}</Typography>
      </Grid>
    </>
  );

  const VerifyButton = (
    <Button
      variant="outlined"
      type="submit"
      onClick={event => {
        event.stopPropagation();
        //onVerify(id);
      }}
    >
      {t("Verify")}
    </Button>
  );

  return (
    <Formik initialValues={{}} onSubmit={() => {}}>
      {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
        <form onSubmit={handleSubmit}>
          <Grid item xs={10}>
            {staticSection}
          </Grid>
          <Grid item xs={2}>
            {VerifyButton}
          </Grid>
        </form>
      )}
    </Formik>
  );
};

const AssignmentRowUI: React.FC<AssignmentRow & {
  onVerify: (verifyInput: VacancyDetailVerifyInput) => void;
}> = ({
  id,
  subName,
  subFor,
  reason,
  onVerify,
  payDuration,
  payCode,
  accountingCode,
  ...props
}) => {
  const classes = useRowStyles();
  const { t } = useTranslation();

  return (
    <Grid item container>
      <Grid item xs={2} className={clsx(classes.cell, classes.idCell)}>
        <Typography variant="h6">{`C#${id}`}</Typography>
      </Grid>
      <Grid item xs={3} className={classes.cell}>
        <Typography>{subName}</Typography>
        <Typography className={classes.detailSubText}>
          {`for ${subFor}`}
        </Typography>
        <Typography className={classes.detailSubText}>{reason}</Typography>
      </Grid>
      <Grid item container xs={7} className={classes.cell}>
        <AssignmentForm
          {...props}
          initialPayDuration={payDuration}
          initialPayCode={payCode}
          initialAccountingCode={accountingCode}
          onVerify={onVerify}
          isOpen={false}
        />
      </Grid>
    </Grid>
  );
};

const useRowStyles = makeStyles(theme => ({
  cell: {
    padding: theme.spacing(1),
    textAlign: "left",
  },
  idCell: {
    textAlign: "center",
  },
  detailSubText: {
    color: theme.customColors.edluminSubText,
  },
}));

type Props = {
  assignments: AssignmentRow[];
  showVerified: boolean;
  onVerify: (verifyInput: VacancyDetailVerifyInput) => void;
};

export const VerifyDailyUI: React.FC<Props> = ({
  assignments,
  showVerified,
  onVerify,
}) => {
  const { t } = useTranslation();

  const unverified = assignments.filter(a => !a.isVerified);

  return (
    <>
      <Grid container justify="space-between">
        <Grid item>
          <Typography variant="h5">{`${assignments.length -
            unverified.length} ${t("verified assignments")}`}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="h5">{`${unverified.length} ${t(
            "awaiting verification"
          )}`}</Typography>
        </Grid>
      </Grid>
      <ProgressBar
        thick
        verifiedAssignments={assignments.length - unverified.length}
        totalAssignments={assignments.length}
      />
      <Grid container direction="column">
        {(showVerified ? assignments : unverified).map(a => (
          <AssignmentRowUI onVerify={onVerify} {...a} />
        ))}
      </Grid>
    </>
  );
};
