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
import { ActionButtons } from "ui/components/action-buttons";
import { Input } from "ui/components/form/input";
import { CalendarChangeCreateInput } from "graphql/server-types.gen";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (calendarChange: CalendarChangeCreateInput) => Promise<boolean>;
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

  if (!orgId) {
    return <></>;
  }

  return (
    <Dialog
      className="dialog"
      open={props.open}
      onClose={props.onClose}
      fullWidth={true}
    >
      <Formik
        initialValues={{
          changeReason: changeReasonOptions[0]?.value ?? undefined,
          toDate: today,
          fromDate: today,
          notes: undefined,
          contracts: [] as string[],
          applyToAll: true,
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
          const newCalendarChangeCreate: CalendarChangeCreateInput = {
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

          const result = await props.onAdd(newCalendarChangeCreate);
          formProps.resetForm();
          props.onClose();
        }}
      >
        {({ values, handleSubmit, setFieldValue, submitForm, handleReset }) => (
          <>
            <DialogTitle disableTypography>
              <Typography variant="h5">{t("Create an Event")}</Typography>
            </DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <Grid
                  container
                  justify="flex-start"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item xs={4} container>
                    <Grid item xs={12}>
                      <FormControlLabel
                        checked={values.applyToAll}
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
                        disabled={values.applyToAll}
                        label={t("Contracts")}
                        value={
                          contractOptions.filter(
                            e =>
                              e.value &&
                              values.contracts.includes(e.value.toString())
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

                  <Grid
                    item
                    container
                    justify="flex-start"
                    alignItems="center"
                    spacing={2}
                    xs={8}
                    className={classes.dateReasonContainer}
                  >
                    <Grid item xs={6}>
                      <DatePicker
                        variant={"single-hidden"}
                        startDate={values.fromDate}
                        onChange={({ startDate }) => {
                          setFieldValue("fromDate", startDate);
                          if (isAfterDate(startDate, values.fromDate)) {
                            setFieldValue("toDate", startDate);
                          }
                        }}
                        startLabel={t("From")}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <DatePicker
                        variant={"single-hidden"}
                        startDate={values.toDate}
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
                </Grid>
              </form>
            </DialogContent>
            <Divider className={classes.divider} />
            <DialogActions>
              <TextButton
                onClick={handleReset}
                className={classes.buttonSpacing}
              >
                {t("Cancel")}
              </TextButton>
              <ButtonDisableOnClick variant="contained" onClick={submitForm}>
                {t("Add")}
              </ButtonDisableOnClick>
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
  dialog: { width: theme.typography.pxToRem(800) },
  dateReasonContainer: {
    borderLeft: "1px solid #E5E5E5",
  },
  contractSelector: {
    marginRight: theme.spacing(2),
  },
}));
