import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Divider,
  Grid,
  Button,
  Tooltip,
} from "@material-ui/core";
import * as React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TextButton } from "ui/components/text-button";
import { makeStyles } from "@material-ui/styles";
import { useCalendarChangeReasonOptions } from "reference-data/calendar-change-reasons";
import { useOrganizationId } from "core/org-context";
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
import { getCalendarSummaryText } from "../helpers";
import InfoIcon from "@material-ui/icons/Info";

type Props = {
  open: boolean;
  onClose: () => void;
  locationOptions: OptionType[];
  contractOptions: OptionType[];
  onAdd: (calendarChange: CalendarChangeCreateInput) => Promise<boolean>;
  onUpdate: (calendarChange: CalendarChangeUpdateInput) => Promise<boolean>;
  onSplit: (
    originalCalendarChangeId: string,
    calendarChange: CalendarEvent
  ) => Promise<boolean>;
  calendarChange: CalendarEvent[];
  errorMessage?: string;
  specificDate?: Date;
};

export const CalendarChangeEventDialog: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const orgId = useOrganizationId();
  const { locationOptions, contractOptions } = props;
  const today = React.useMemo(() => new Date(), []);
  const changeReasonOptions = useCalendarChangeReasonOptions(orgId ?? "0");

  const calendarChange =
    props.calendarChange[0] !== undefined
      ? props.calendarChange[0]
      : ({
          //If the incoming calendarChange is undefined create one.
          //This prevents clicking a day without a CalendarEvent from erroring out.
          startDate: today.toISOString(),
          endDate: today.toISOString(),
          affectsAllContracts: true,
          locationIds: [],
          contractIds: [],
        } as CalendarEvent);

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

  const clearState = () => {
    setContractIds([]);
    setLocationIds([]);
    setSummaryTest("");
    setAffectsAllLocations(false);
    setAffectsAllContracts(false);
    setSubmittingData(false);
  };

  useEffect(() => {
    const string = getCalendarSummaryText(
      locationOptions,
      contractOptions,
      affectsAllContracts,
      affectsAllLocations,
      contractIds,
      locationIds,
      t
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
          contracts: calendarChange.contractIds,
          locations: calendarChange.locationIds,
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
              const calendarChangeSplit: CalendarEvent = {
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
                calendarChange.id ?? "0",
                calendarChangeSplit
              );
            } else {
              const calendarChangeUpdate: CalendarChangeUpdateInput = {
                id: calendarChange.id!,
                rowVersion: calendarChange.rowVersion!,
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

              resultSucceeded = await props.onUpdate(calendarChangeUpdate);
            }
          } else {
            const calendarChangeCreate: CalendarChangeCreateInput = {
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

            resultSucceeded = await props.onAdd(calendarChangeCreate);
          }
          setSubmittingData(false);
          if (resultSucceeded) {
            formProps.resetForm();
            clearState();
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
                      {isRange && calendarChange.id && props.specificDate && (
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
                        withResetValue={true}
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
                      <div className={classes.positionRelative}>
                        <SelectNew
                          name={"contracts"}
                          className={classes.selectorColor}
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
                            if (ids.includes("0")) {
                              setAffectsAllContracts(true);
                              setFieldValue("applyToAllContracts", true);
                              setFieldValue("contracts", []);
                              setContractIds([]);
                            } else {
                              setContractIds(ids);
                              setFieldValue("contracts", ids);
                              setAffectsAllContracts(false);
                              setFieldValue("applyToAllContracts", false);
                            }
                          }}
                          options={contractOptions}
                          multiple={true}
                          placeholder={t("Search for Contracts")}
                          fixedListBox={true}
                        />
                      </div>
                    </Grid>
                    <Grid item xs={4} className={classes.marginLeft}>
                      <div className={classes.positionRelative}>
                        <SelectNew
                          name={"locations"}
                          className={classes.selectorColor}
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

                            if (ids.includes("0")) {
                              setFieldValue("applyToAllLocations", true);
                              setFieldValue("locations", []);
                              setAffectsAllLocations(true);
                              setLocationIds([]);
                            } else {
                              setFieldValue("applyToAllLocations", false);
                              setFieldValue("locations", ids);
                              setAffectsAllLocations(false);
                              setLocationIds(ids);
                            }
                          }}
                          options={locationOptions}
                          multiple={true}
                          placeholder={t("Search for Schools")}
                          fixedListBox={true}
                        />
                      </div>
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
  positionRelative: {
    position: "relative",
  },
  checkBoxAlignment: {
    position: "absolute",
    top: "-10px",
    right: "-10px",
  },
  marginLeft: {
    marginLeft: "20px",
  },
}));
