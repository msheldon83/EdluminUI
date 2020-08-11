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
  Tooltip,
} from "@material-ui/core";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { useCalendarChangeReasonOptions } from "reference-data/calendar-change-reasons";
import { useOrganizationId } from "core/org-context";
import { useContracts } from "reference-data/contracts";
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
import { isSameDay } from "date-fns/esm";
import { useLocations } from "reference-data/locations";
import InfoIcon from "@material-ui/icons/Info";

type Props = {
  open: boolean;
  onClose: () => void;
  onAdd: (calendarChange: CalendarChangeCreateInput) => Promise<boolean>;
  onUpdate: (calendarChange: CalendarChangeUpdateInput) => Promise<boolean>;
  onSplit: (
    originalCalendarChangeId: string,
    calendarChange: CalendarEvent
  ) => Promise<boolean>;
  calendarChange: CalendarEvent;
  errorMessage?: string;
  specificDate?: Date;
};

export const CalendarChangeEventDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const orgId = useOrganizationId();
  const today = React.useMemo(() => new Date(), []);
  const changeReasonOptions = useCalendarChangeReasonOptions(orgId ?? "0");
  const contracts = useContracts(orgId ?? "0");
  const contractOptions = React.useMemo(
    () => contracts.map(c => ({ label: c.name, value: c.id })),
    [contracts]
  );

  const locations = useLocations();
  const locationOptions: OptionType[] = React.useMemo(
    () => locations.map(l => ({ label: l.name, value: l.id })),
    [locations]
  );

  const [submittingData, setSubmittingData] = React.useState(false);

  const updating = props.calendarChange ? !!props.calendarChange.id : false;

  const isRange =
    props.calendarChange &&
    props.calendarChange.startDate &&
    props.calendarChange.endDate
      ? !isSameDay(
          parseISO(props.calendarChange.startDate),
          parseISO(props.calendarChange.endDate)
        )
      : false;

  if (!orgId || !props.calendarChange) {
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
          notes: props.calendarChange.description ?? "",
          contracts: props.calendarChange.changedContracts?.map(c => c?.id),
          locations: props.calendarChange.changedContracts?.map(c => c?.id), // TODO: Get value from object
          applyToAllContracts: props.calendarChange.affectsAllContracts,
          applyToAllLocations: false, //TODO: Get value from object
        }}
        onReset={(values, formProps) => {
          formProps.setFieldValue("toDate", today);
          formProps.setFieldValue("fromDate", today);
          formProps.setFieldValue("contracts", []);
          formProps.setFieldValue("locations", []);
          formProps.setFieldValue("applyToAllContracts", true);
          formProps.setFieldValue("applyToAllLocations", false);
          formProps.setFieldValue("changeReason", changeReasonOptions[0].value);
          formProps.setFieldValue("notes", "");
          props.onClose();
        }}
        onSubmit={async (data: any, formProps) => {
          let resultSucceeded = false;
          setSubmittingData(true);
          if (updating) {
            if (isRange && !!props.specificDate) {
              const calendarChange: CalendarEvent = {
                description: data.notes === "" ? null : data.notes,
                startDate: format(props.specificDate, "MMMM d, yyyy"),
                endDate: format(props.specificDate, "MMMM d, yyyy"),
                calendarChangeReasonId: data.changeReason
                  ? data.changeReason
                  : changeReasonOptions[0]?.value,
                contractIds: data.contracts ?? [],
                locationIds: data.locations ?? [],
                affectsAllContracts: data.applyToAllContracts,
                affectsAllLocations: data.applyToAllLocations,
              };
              resultSucceeded = await props.onSplit(
                props.calendarChange.id ?? "0",
                calendarChange
              );
            } else {
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
                locationIds: data.locations ?? [],
                affectsAllContracts: data.applyToAllContracts,
                affectsAllLocations: data.applyToAllLocations,
              };

              resultSucceeded = await props.onUpdate(calendarChange);
            }
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
              locationIds: data.locations ?? [],
              affectsAllContracts: data.applyToAllContracts,
              affectsAllLocations: data.applyToAllLocations,
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
                    xs={12}
                  >
                    <Grid item xs={3}>
                      {(!isRange || (isRange && !props.specificDate)) && (
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
                      )}
                      {isRange &&
                        props.calendarChange.id &&
                        props.specificDate && (
                          <>
                            <Typography variant="h4" display="inline">
                              {format(props.specificDate, "MMM d")}
                            </Typography>
                            <Tooltip
                              title={
                                <div className={classes.tooltip}>
                                  <Typography variant="body1">
                                    {t(
                                      "You are currently editing a single date that is associated with an event that spans multiple days.  To edit the event's to and from dates, edit the event instead."
                                    )}
                                  </Typography>
                                </div>
                              }
                              placement="right-start"
                            >
                              <InfoIcon
                                color="primary"
                                style={{
                                  fontSize: "16px",
                                  marginLeft: "8px",
                                }}
                              />
                            </Tooltip>
                          </>
                        )}
                    </Grid>
                    <Grid item xs={3}>
                      {(!isRange || (isRange && !props.specificDate)) && (
                        <DatePicker
                          variant={"single-hidden"}
                          startDate={new Date(values.toDate) ?? today}
                          onChange={({ startDate: toDate }) =>
                            setFieldValue("toDate", toDate)
                          }
                          startLabel={t("To")}
                        />
                      )}
                    </Grid>
                    <Grid item xs={3}>
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
                    <Grid item xs={3}>
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
                  <Grid item xs={12} container>
                    <Grid item xs={12}>
                      <Typography>
                        {t("For [Summary test from Jira issue]")}
                      </Typography>
                      <div>show affected employee count here</div>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} container>
                    <Grid item xs={4}>
                      <FormControlLabel
                        checked={values.applyToAllContracts ?? false}
                        className={clsx(
                          classes.selectorColor,
                          classes.checkBoxAlignment
                        )}
                        control={
                          <Checkbox
                            onChange={e => {
                              setFieldValue(
                                "applyToAllContracts",
                                !values.applyToAllContracts
                              );
                              if (!values.applyToAllContracts) {
                                setFieldValue("contracts", []);
                              }
                            }}
                            color="primary"
                          />
                        }
                        label={t("All")}
                      />
                      <SelectNew
                        name={"contracts"}
                        className={classes.selectorColor}
                        disabled={values.applyToAllContracts ?? false}
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
                    <Grid item xs={4} className={classes.marginLeft}>
                      <FormControlLabel
                        checked={values.applyToAllLocations ?? false}
                        className={clsx(
                          classes.selectorColor,
                          classes.checkBoxAlignment
                        )}
                        control={
                          <Checkbox
                            onChange={e => {
                              setFieldValue(
                                "applyToAllLocations",
                                !values.applyToAllLocations
                              );
                              if (!values.applyToAllLocations) {
                                setFieldValue("locations", []);
                              }
                            }}
                            color="primary"
                          />
                        }
                        label={t("All")}
                      />
                      <SelectNew
                        name={"locations"}
                        className={classes.selectorColor}
                        disabled={values.applyToAllLocations ?? false}
                        label={t("Schools")}
                        value={
                          locationOptions.filter(
                            e =>
                              e.value &&
                              values.locations?.includes(e.value.toString())
                          ) ?? [{ label: "", id: "" }]
                        }
                        onChange={e => {
                          const ids = e.map((v: OptionType) =>
                            v.value.toString()
                          );
                          setFieldValue("locations", ids);
                        }}
                        options={locationOptions}
                        multiple={true}
                        placeholder={t("Search for Schools")}
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
  selectorColor: {
    color: theme.customColors.primary,
  },
  tooltip: {
    padding: theme.spacing(2),
  },
  fontWeight: {
    fontWeight: 700,
  },
  checkBoxAlignment: {
    top: "30px",
    position: "relative",
    float: "right",
    marginRight: "0px",
    zIndex: 1000,
  },
  marginLeft: {
    marginLeft: "20px",
  },
}));
