import * as React from "react";
import {
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Formik } from "formik";
import {
  Grid,
  makeStyles,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { ActionButtons } from "../../../components/action-buttons";
import { useMutationBundle } from "graphql/hooks";
import { Select, OptionType } from "ui/components/form/select";
import { DatePicker } from "ui/components/form/date-picker";
import { useContracts } from "reference-data/contracts";
import { useMemo } from "react";
import { OptionTypeBase } from "react-select/src/types";
import { parseISO, isBefore } from "date-fns";
import { CreateCalendarChange } from "../graphql/create-calendar-change.gen";
import { CalendarChangeCreateInput } from "graphql/server-types.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useAllSchoolYears } from "reference-data/school-years";
import { isAfterDate } from "helpers/date";
import { useCalendarChangeReasonOptions } from "reference-data/calendar-change-reasons";

type Props = {
  orgId: string;
  refetchQuery: any;
};

export const CreateExpansionPanel: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const today = useMemo(() => new Date(), []);
  const schoolYears = useAllSchoolYears(props.orgId);

  const changeReasonOptions = useCalendarChangeReasonOptions(props.orgId);

  const contracts = useContracts(props.orgId);
  const contractOptions = useMemo(
    () => contracts.map(c => ({ label: c.name, value: c.id })),
    [contracts]
  );

  const [panelOpened, setPanelOpened] = React.useState(false);

  const [createCalendarChange] = useMutationBundle(CreateCalendarChange, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const dateInSchoolYear = (date: string) => {
    let found = false;
    const d = new Date(date);

    schoolYears.forEach(sy => {
      const sd = parseISO(sy.startDate);
      const ed = parseISO(sy.endDate);
      if (d >= sd && d <= ed) {
        found = true;
        return found;
      }
    });
    return found;
  };

  const create = async (calendarChange: CalendarChangeCreateInput) => {
    if (
      isBefore(
        parseISO(calendarChange.startDate),
        parseISO(calendarChange.endDate)
      )
    ) {
      openSnackbar({
        message: t("The from date has to be before the to date."),
        dismissable: true,
        status: "error",
        autoHideDuration: 5000,
      });
      return false;
    }
    if (
      !dateInSchoolYear(calendarChange.startDate) ||
      !dateInSchoolYear(calendarChange.endDate)
    ) {
      openSnackbar({
        message: t("Please enter a date within the available school years."),
        dismissable: true,
        status: "error",
        autoHideDuration: 5000,
      });
      return false;
    }

    if (calendarChange.calendarChangeReasonId == undefined) {
      openSnackbar({
        message: t("Please provide a change reason."),
        dismissable: true,
        status: "error",
        autoHideDuration: 5000,
      });
      return false;
    }
    if (
      !calendarChange.affectsAllContracts &&
      calendarChange.contractIds == undefined
    ) {
      openSnackbar({
        message: t("Select a contract or choose, Apply To All Contracts."),
        dismissable: true,
        status: "error",
        autoHideDuration: 5000,
      });
      return false;
    }

    const result = await createCalendarChange({
      variables: {
        calendarChange,
      },
    });
    if (result === undefined) return false;
    return true;
  };

  return (
    <>
      <ExpansionPanel expanded={panelOpened}>
        <ExpansionPanelSummary
          onClick={event => {
            setPanelOpened(!panelOpened);
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography variant="h5">{t("Add New Event")}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
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
              formProps.setFieldValue(
                "changeReason",
                changeReasonOptions[0].value
              );
              formProps.setFieldValue("notes", "");
              setPanelOpened(false);
            }}
            onSubmit={async (data: any, formProps) => {
              const newCalendarChangeCreate: CalendarChangeCreateInput = {
                orgId: props.orgId,
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

              const result = await create(newCalendarChangeCreate);
              if (result) {
                formProps.resetForm();
                props.refetchQuery();
              }
            }}
          >
            {({
              values,
              handleSubmit,
              setFieldValue,
              submitForm,
              handleReset,
            }) => (
              <form className={classes.form} onSubmit={handleSubmit}>
                <Grid
                  container
                  justify="flex-start"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item xs={3}>
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
                  <Grid item xs={3}>
                    <Select
                      name={"contracts"}
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
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  justify="flex-start"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item xs={3}>
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
                  <Grid item xs={3}>
                    <DatePicker
                      variant={"single-hidden"}
                      startDate={values.toDate}
                      onChange={({ startDate: toDate }) =>
                        setFieldValue("toDate", toDate)
                      }
                      startLabel={t("To")}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  justify="flex-start"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item xs={3}>
                    <Typography>{t("Reason")}</Typography>
                    <Select
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
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <ActionButtons
                    submit={{ text: t("Add"), execute: submitForm }}
                    cancel={{ text: t("Cancel"), execute: handleReset }}
                  />
                </Grid>
              </form>
            )}
          </Formik>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  form: {
    width: "100%",
  },
  details: {
    padding: 0,
    display: "block",
  },
}));
