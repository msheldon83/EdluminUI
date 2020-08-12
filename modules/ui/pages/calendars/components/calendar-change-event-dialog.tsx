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
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { useCalendarChangeReasonOptions } from "reference-data/calendar-change-reasons";
import { useOrganizationId } from "core/org-context";
import { useContracts } from "reference-data/contracts";
import { Formik } from "formik";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { compact } from "lodash-es";
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
import { getCalendarSummaryText } from "../helpers";
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

  const { calendarChange } = props;

  const [contractIds, setContractIds] = React.useState<string[]>(
    compact(calendarChange.contractIds) ?? []
  );
  const [locationIds, setLocationIds] = React.useState<string[]>(
    compact(calendarChange.locationIds) ?? []
  );

  const [submittingData, setSubmittingData] = React.useState(false);
  const [summaryText, setSummaryTest] = React.useState<string>("");
  const [affectsAllLocations, setAffectsAllLocations] = useState<boolean>(
    calendarChange.affectsAllLocations ?? false
  );
  const [affectsAllContracts, setAffectsAllContracts] = useState<boolean>(
    calendarChange.affectsAllContracts ?? false
  );

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

  useEffect(() => {
    const string = getCalendarSummaryText(
      locationOptions,
      contractOptions,
      affectsAllContracts,
      affectsAllLocations,
      contractIds,
      locationIds
    );

    setSummaryTest(string);
  }, [
    locationIds,
    contractIds,
    contractOptions,
    locationOptions,
    affectsAllLocations,
    affectsAllContracts,
  ]);

  const updating = calendarChange ? !!calendarChange.id : false;

  const isRange =
    calendarChange && calendarChange.startDate && calendarChange.endDate
      ? !isSameDay(
          parseISO(calendarChange.startDate),
          parseISO(calendarChange.endDate)
        )
      : false;

  if (!orgId || !calendarChange) {
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
            calendarChange.calendarChangeReasonId ??
            changeReasonOptions[0]?.value,
          toDate: format(parseISO(calendarChange.endDate!), "MMMM d, yyyy"),
          fromDate: format(parseISO(calendarChange.startDate!), "MMMM d, yyyy"),
          notes: calendarChange.description ?? "",
          contracts: contractIds,
          locations: locationIds,
          applyToAllContracts: affectsAllContracts,
          applyToAllLocations: affectsAllLocations,
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
                contractIds: data.contracts,
                locationIds: data.locations,
                affectsAllContracts: affectsAllContracts,
                affectsAllLocations: affectsAllLocations,
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
                contractIds: data.contracts,
                locationIds: data.locations,
                affectsAllContracts: affectsAllContracts,
                affectsAllLocations: affectsAllLocations,
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
              contractIds: data.contracts,
              locationIds: data.locations,
              affectsAllContracts: affectsAllContracts,
              affectsAllLocations: affectsAllLocations,
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
                      <Typography className={classes.boldFont}>
                        {summaryText}
                      </Typography>
                      <div className={classes.subFont}>
                        {t("show affected employee count here")}
                      </div>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} container>
                    <Grid item xs={4}>
                      <SelectNew
                        name={"contracts"}
                        className={classes.selectorColor}
                        disabled={affectsAllContracts}
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
                          setContractIds(ids);
                          setFieldValue("contracts", ids);
                        }}
                        options={contractOptions}
                        multiple={true}
                        placeholder={t("Search for Contracts")}
                        fixedListBox={true}
                      />
                      <FormControlLabel
                        checked={affectsAllContracts}
                        className={clsx(
                          classes.selectorColor,
                          classes.checkBoxAlignment
                        )}
                        control={
                          <Checkbox
                            onChange={e => {
                              setAffectsAllContracts(!affectsAllContracts);
                              setFieldValue(
                                "applyToAllContracts",
                                !values.applyToAllContracts
                              );

                              if (!affectsAllContracts) {
                                setFieldValue("contracts", []);
                                setContractIds([]);
                              }
                            }}
                            color="primary"
                          />
                        }
                        label={t("All")}
                      />
                    </Grid>
                    <Grid item xs={4} className={classes.marginLeft}>
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
                          setLocationIds(ids);
                        }}
                        options={locationOptions}
                        multiple={true}
                        placeholder={t("Search for Schools")}
                        fixedListBox={true}
                      />
                      <FormControlLabel
                        checked={affectsAllLocations}
                        className={clsx(
                          classes.selectorColor,
                          classes.checkBoxAlignment
                        )}
                        control={
                          <Checkbox
                            onChange={e => {
                              setAffectsAllLocations(!affectsAllLocations);

                              setFieldValue(
                                "applyToAllLocations",
                                !values.applyToAllLocations
                              );

                              if (!affectsAllLocations) {
                                setFieldValue("locations", []);
                                setLocationIds([]);
                              }
                            }}
                            color="primary"
                          />
                        }
                        label={t("All")}
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
  boldFont: {
    fontSize: "1.1rem",
    fontWeight: 500,
  },
  subFont: {
    color: theme.customColors.edluminSubText,
  },
  checkBoxAlignment: {
    float: "right",
    zIndex: 1000,
    position: "relative",
    top: "-80px",
    marginRight: "0px",
  },
  marginLeft: {
    marginLeft: "20px",
  },
}));
