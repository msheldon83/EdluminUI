import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Grid,
  FormControlLabel,
  Checkbox,
  Button,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { ButtonDisableOnClick } from "ui/components/button-disable-on-click";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { useCalendarChangeReasonOptions } from "reference-data/calendar-change-reasons";
import { useOrganizationId } from "core/org-context";
import { useContracts } from "reference-data/contracts";
import { useAllSchoolYears } from "reference-data/school-years";
import { Formik } from "formik";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { DatePicker } from "ui/components/form/date-picker";
import { isAfterDate } from "helpers/date";
import { OptionTypeBase } from "react-select/src/types";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Input } from "ui/components/form/input";
import {
  CalendarChangeCreateInput,
  CalendarChangeUpdateInput,
} from "graphql/server-types.gen";
import { CalendarEvent } from "../types";
import { parseISO, format } from "date-fns";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (calendarChange: CalendarChangeCreateInput) => Promise<boolean>;
  onUpdate: (calendarChange: CalendarChangeUpdateInput) => Promise<boolean>;
  calendarChange: CalendarEvent;
  errorMessage?: string;
};

export const CalendarChangeEventDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const orgId = useOrganizationId();
  const today = React.useMemo(() => new Date(), []);
  const schoolYears = useAllSchoolYears(orgId ?? "0");
  const changeReasonOptions = useCalendarChangeReasonOptions(orgId ?? "0");
  const contracts = useContracts(orgId ?? "0");
  const contractOptions = React.useMemo(
    () => contracts.map(c => ({ label: c.name, value: c.id })),
    [contracts]
  );
  const [submittingData, setSubmittingData] = React.useState(false);

  const updating = !!props.calendarChange.id;

  if (!orgId) {
    return <></>;
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
      maxWidth={"md"}
    >
      <Formik
        initialValues={{
          changeReason:
            props.calendarChange.calendarChangeReasonId ??
            changeReasonOptions[0]?.value,
          toDate: format(
            parseISO(props.calendarChange.endDate!),
            "MMMM d, yyyy"
          ),
          fromDate: format(
            parseISO(props.calendarChange.startDate!),
            "MMMM d, yyyy"
          ),
          notes: props.calendarChange.description,
          contracts: props.calendarChange.contractIds,
          applyToAll: props.calendarChange.affectsAllContracts,
        }}
        onReset={(values, formProps) => {
          formProps.setFieldValue("toDate", today);
          formProps.setFieldValue("fromDate", today);
          formProps.setFieldValue("contracts", []);
          formProps.setFieldValue("applyToAll", true);
          formProps.setFieldValue("changeReason", changeReasonOptions[0].value);
          formProps.setFieldValue("notes", "");
          props.onClose();
          // setPanelOpened(false);
        }}
        onSubmit={async (data: any, formProps) => {
          let resultSucceeded = false;
          setSubmittingData(true);
          if (updating) {
            const calendarChange: CalendarChangeUpdateInput = {
              id: props.calendarChange.id!,
              rowVersion: props.calendarChange.rowVersion!,
              description: data.notes,
              startDate: data.fromDate,
              endDate: data.toDate,
              calendarChangeReasonId: data.changeReason
                ? data.changeReason
                : changeReasonOptions[0]?.value,
              contractIds: data.contracts ?? [],
              affectsAllContracts: data.applyToAll,
            };

            resultSucceeded = await props.onUpdate(calendarChange);
          } else {
            const calendarChange: CalendarChangeCreateInput = {
              orgId: orgId,
              description: data.notes,
              startDate: data.fromDate,
              endDate: data.toDate,
              calendarChangeReasonId: data.changeReason
                ? data.changeReason
                : changeReasonOptions[0]?.value,
              contractIds: data.contracts ?? [],
              affectsAllContracts: data.applyToAll,
            };

            resultSucceeded = await props.onAdd(calendarChange);
          }
          setSubmittingData(false);
          if (resultSucceeded) {
            formProps.resetForm();
            props.onClose();
          }
        }}
      >
        {({ values, handleSubmit, setFieldValue, submitForm, handleReset }) => (
          <>
            <DialogTitle disableTypography>
              <Typography variant="h5">
                {updating ? t("Update Event") : t("Add Event")}
              </Typography>
            </DialogTitle>
            <DialogContent className={classes.content}>
              <form onSubmit={handleSubmit}>
                <Grid
                  container
                  justify="flex-start"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid
                    item
                    container
                    justify="flex-start"
                    alignItems="center"
                    spacing={2}
                    xs={7}
                    className={classes.dateReasonContainer}
                  >
                    <Grid item xs={6}>
                      <DatePicker
                        variant={"single-hidden"}
                        startDate={new Date(values.fromDate) ?? today}
                        onChange={({ startDate }) => {
                          setFieldValue("fromDate", startDate);
                          if (
                            values.fromDate &&
                            isAfterDate(startDate, values.fromDate)
                          ) {
                            setFieldValue("toDate", startDate);
                          }
                        }}
                        startLabel={t("From")}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <DatePicker
                        variant={"single-hidden"}
                        startDate={new Date(values.toDate) ?? today}
                        onChange={({ startDate: toDate }) =>
                          setFieldValue("toDate", toDate)
                        }
                        startLabel={t("To")}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Typography>{t("Reason")}</Typography>
                      <SelectNew
                        options={changeReasonOptions}
                        value={
                          values.changeReason
                            ? changeReasonOptions.find(
                                (a: any) => a.value === values.changeReason
                              )
                            : changeReasonOptions[0] ?? { value: "", label: "" }
                        }
                        onChange={async (e: OptionType) => {
                          let selectedValue = null;
                          if (e) {
                            selectedValue = (e as OptionTypeBase).value;
                          }
                          setFieldValue("changeReason", selectedValue);
                        }}
                        multiple={false}
                        withResetValue={false}
                        fixedListBox={true}
                      />
                    </Grid>

                    <Grid item xs={6}>
                      <Input
                        value={values.notes}
                        label={t("Note")}
                        InputComponent={FormTextField}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          setFieldValue("notes", event.target.value);
                        }}
                        inputComponentProps={{
                          margin: "none",
                          variant: "outlined",
                          fullWidth: true,
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={5} container>
                    <Grid item xs={12}>
                      <FormControlLabel
                        checked={values.applyToAll ?? false}
                        className={classes.contractSelector}
                        control={
                          <Checkbox
                            onChange={e => {
                              setFieldValue("applyToAll", !values.applyToAll);
                              if (!values.applyToAll) {
                                setFieldValue("contracts", []);
                              }
                            }}
                          />
                        }
                        label={t("Apply To All Contracts")}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <SelectNew
                        name={"contracts"}
                        className={classes.contractSelector}
                        disabled={values.applyToAll ?? false}
                        label={t("Contracts")}
                        value={
                          contractOptions.filter(
                            e =>
                              e.value &&
                              values.contracts?.includes(e.value.toString())
                          ) ?? [{ label: "", id: "" }]
                        }
                        onChange={e => {
                          const ids = e.map((v: OptionType) =>
                            v.value.toString()
                          );
                          setFieldValue("contracts", ids);
                        }}
                        options={contractOptions}
                        multiple={true}
                        placeholder={t("Search for Contracts")}
                        fixedListBox={true}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </form>
            </DialogContent>
            <Divider className={classes.divider} />
            <DialogActions>
              {props.errorMessage && (
                <div className={classes.errorContainer}>
                  {props.errorMessage}
                </div>
              )}
              <TextButton
                onClick={handleReset}
                className={classes.buttonSpacing}
              >
                {t("Cancel")}
              </TextButton>
              <Button
                disabled={submittingData}
                variant="contained"
                onClick={submitForm}
              >
                {updating ? t("Update") : t("Add")}
              </Button>
            </DialogActions>
          </>
        )}
      </Formik>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  buttonSpacing: {
    paddingRight: theme.spacing(2),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
  },
  cancel: { color: theme.customColors.darkRed },
  errorContainer: {
    width: "100%",
    color: theme.customColors.darkRed,
  },
  content: { minHeight: theme.typography.pxToRem(200) },
  dateReasonContainer: {
    borderRight: "1px solid #E5E5E5",
  },
  contractSelector: {
    marginLeft: theme.spacing(2),
  },
}));