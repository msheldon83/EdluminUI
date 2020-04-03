import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  InputLabel,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { ContractScheduleCreateInput } from "graphql/server-types.gen";
import { DayOfWeekSelector } from "ui/components/day-of-week-selector";
import { Formik } from "formik";
import { DayOfWeek } from "graphql/server-types.gen";
import { DatePicker } from "ui/components/form/date-picker";
import { useWorkDayPatterns } from "reference-data/work-day-patterns";
import { getDayOfWeekFromDate } from "helpers/day-of-week";
import { parseISO, isBefore, isAfter } from "date-fns";
import * as yup from "yup";
import { formatIsoDateIfPossible } from "helpers/date";

type Props = {
  schoolYear?: {
    startDate: string;
    endDate: string;
  };
  orgId: string;
  contract?: {
    id: string;
    name: string;
  };
  open: boolean;
  onClose: () => void;
  onSave: (contractSchedule: ContractScheduleCreateInput) => Promise<any>;
};

export const CreateContractScheduleDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const allWorkDayPatterns = useWorkDayPatterns(props.orgId);
  const workDays =
    allWorkDayPatterns.length > 0 ? allWorkDayPatterns[0].workDays : [];

  const findWorkdayId = (startDate: Date) => {
    const dayOfWeek = getDayOfWeekFromDate(startDate);
    return workDays?.find(x => x?.dayOfWeek === dayOfWeek)?.id;
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={false}
      maxWidth={"md"}
    >
      <Formik
        initialValues={{
          startDate: parseISO(props.schoolYear?.startDate ?? ""),
          daysToWork: [
            DayOfWeek.Monday,
            DayOfWeek.Tuesday,
            DayOfWeek.Wednesday,
            DayOfWeek.Thursday,
            DayOfWeek.Friday,
          ],
        }}
        validationSchema={yup
          .object({
            startDate: yup.date().required(),
          })
          .test({
            name: "dateInSchoolYear",
            test: function test(value) {
              if (
                isBefore(
                  value.startDate,
                  parseISO(props.schoolYear?.startDate ?? "")
                ) ||
                isAfter(
                  value.startDate,
                  parseISO(props.schoolYear?.endDate ?? "")
                )
              ) {
                return new yup.ValidationError(
                  `${t("Date must be between")} ${formatIsoDateIfPossible(
                    props.schoolYear?.startDate,
                    "MMM d yyyy"
                  )} ${t("and")} ${formatIsoDateIfPossible(
                    props.schoolYear?.endDate,
                    "MMM d yyyy"
                  )}`,
                  null,
                  "startDate"
                );
              }
              return true;
            },
          })}
        onSubmit={async data => {
          await props.onSave({
            startDate: data.startDate,
            contractId: props.contract?.id,
            daysToWork: data.daysToWork,
            firstWorkDayId: findWorkdayId(data.startDate),
          });
        }}
      >
        {({ values, handleSubmit, setFieldValue, submitForm, errors }) => (
          <form onSubmit={handleSubmit} className={classes.form}>
            <DialogTitle disableTypography>
              <Typography variant="h5">{props.contract?.name}</Typography>
            </DialogTitle>
            <DialogContent>
              <div>
                {t(
                  "Pick a start date for the contract and the days of the week this contract applies to:"
                )}
              </div>
              <div className={classes.dateContainer}>
                <div className={classes.startDateLabel}>{t("Start date")}</div>
                <DatePicker
                  variant={"single-hidden"}
                  startDate={values.startDate}
                  onChange={({ startDate }) =>
                    setFieldValue(
                      "startDate",
                      typeof startDate === "string"
                        ? parseISO(startDate)
                        : startDate
                    )
                  }
                  inputStatus={errors.startDate ? "error" : "default"}
                  validationMessage={errors.startDate}
                />
              </div>
              <DayOfWeekSelector
                daysOfWeek={values.daysToWork}
                onCheckDayOfWeek={(dow: DayOfWeek) => {
                  const dayIndex = values.daysToWork.indexOf(dow);
                  if (dayIndex != -1) {
                    values.daysToWork.splice(dayIndex, 1);
                  } else {
                    values.daysToWork.push(dow);
                  }
                  setFieldValue("daysToWork", values.daysToWork);
                }}
              />
            </DialogContent>

            <Divider className={classes.divider} />
            <DialogActions>
              <TextButton
                onClick={props.onClose}
                className={classes.buttonSpacing}
              >
                {t("Cancel")}
              </TextButton>
              <ButtonDisableOnClick
                variant="outlined"
                onClick={submitForm}
                className={classes.save}
              >
                {t("Save")}
              </ButtonDisableOnClick>
            </DialogActions>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  dialog: {
    width: 800,
  },
  dateContainer: {
    display: "flex",
    alignItems: "center",
    paddingTop: theme.spacing(2),
  },
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  save: { color: theme.customColors.darkRed },
  form: {
    display: "flex",
    flexDirection: "column",
    margin: "auto",
    width: "fit-content",
  },
  startDateLabel: {
    paddingRight: theme.spacing(1),
  },
}));
