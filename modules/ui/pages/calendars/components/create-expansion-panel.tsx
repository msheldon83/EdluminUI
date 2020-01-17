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
import { GetAllCalendarChangeReasonsWithinOrg } from "ui/pages/calendar-event-reasons/graphql/get-calendar-event-reasons.gen";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import {
  SelectNew as SelectMulti,
  OptionType as OptionMulti,
} from "ui/components/form/select-new";
import { DatePicker } from "ui/components/form/date-picker";
import { useContracts } from "reference-data/contracts";
import { useMemo } from "react";
import { OptionTypeBase } from "react-select/src/types";
import { parseISO, format } from "date-fns";
import { CreateCalendarChange } from "../graphql/create-calendar-change.gen";
import { CalendarChangeCreateInput } from "graphql/server-types.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";
import { useAllSchoolYears } from "reference-data/school-years";

type Props = {
  orgId: string;
  refetchQuery: any;
};

export const CreateExpansionPanel: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const today = useMemo(() => format(new Date(), "MMM d, yyyy").toString(), []);
  const schoolYears = useAllSchoolYears(props.orgId);

  const getCalendarChangeReasons: any = useQueryBundle(
    GetAllCalendarChangeReasonsWithinOrg,
    {
      variables: { orgId: props.orgId, includeExpired: false },
    }
  );
  const changeReasonOptions = getCalendarChangeReasons?.data?.orgRef_CalendarChangeReason?.all.map(
    (cr: any) => {
      return { label: cr.name, value: cr.id };
    }
  );

  const contracts = useContracts(props.orgId);
  const contractOptions = contracts.map(c => {
    return { label: c.name, value: parseInt(c.id) };
  });

  const [enableAllContracts, setEnableAllContracts] = React.useState(false);
  const [selectedChangeReason, setSelectedChangeReason] = React.useState();
  const [selectedContracts, setselectedContracts] = React.useState();
  const [selectedToDate, setSelectedToDate] = React.useState(today);
  const [selectedFromDate, setSelectedFromDate] = React.useState(today);
  const [panelOpened, setPanelOpened] = React.useState(false);

  const contractValue = contractOptions.filter(
    e => e.value && selectedContracts?.includes(Number(e.value))
  );

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
    if (calendarChange.startDate > calendarChange.endDate) {
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
    if (calendarChange.contractIds == undefined) {
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

  /** used to initialize which change reason is selected **/
  if (changeReasonOptions != undefined && selectedChangeReason == undefined) {
    setSelectedChangeReason(changeReasonOptions[0].value);
  }

  if (getCalendarChangeReasons.state !== "DONE") {
    return <></>;
  }

  return (
    <>
      <ExpansionPanel expanded={panelOpened}>
        <ExpansionPanelSummary
          onClick={event => {
            setPanelOpened(!panelOpened);
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography variant="h5">New Event</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Formik
            initialValues={{
              changeReason: selectedChangeReason,
              toDate: selectedToDate,
              fromDate: selectedFromDate,
              notes: undefined,
              contracts: selectedContracts,
              applyToAll: enableAllContracts,
            }}
            onReset={(values, formProps) => {
              setSelectedToDate(today);
              setSelectedFromDate(today);
              setselectedContracts([]);
              setEnableAllContracts(false);
              setSelectedChangeReason(changeReasonOptions[0].value);
              formProps.setFieldValue("notes", "");
              setPanelOpened(false);
            }}
            onSubmit={async (data: any, formProps) => {
              const newCalendarChangeCreate: CalendarChangeCreateInput = {
                orgId: parseInt(props.orgId),
                description: data.notes,
                startDate: data.fromDate,
                endDate: data.toDate,
                calendarChangeReasonId: data.changeReason,
                contractIds: data.contracts,
                affectsAllContracts: data.applyToAll,
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
                  justify="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item xs={12}>
                    <FormControlLabel
                      checked={enableAllContracts}
                      control={
                        <Checkbox
                          onChange={e => {
                            setEnableAllContracts(!enableAllContracts);
                            setFieldValue("applyToAll", !enableAllContracts);
                            if (!enableAllContracts) {
                              setselectedContracts([]);
                              setFieldValue("contracts", []);
                            }
                          }}
                        />
                      }
                      label={t("Apply To All Contracts")}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item xs={4}>
                    <SelectMulti
                      name={"contracts"}
                      disabled={enableAllContracts}
                      label={"Contracts"}
                      value={contractValue}
                      onChange={(value: OptionType[]) => {
                        const ids: number[] = value
                          ? value.map((v: OptionType) => Number(v.value))
                          : [];
                        setselectedContracts(ids);
                        setFieldValue("contracts", ids);
                      }}
                      options={contractOptions}
                      multiple={true}
                      placeholder="Search for Contracts"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <DatePicker
                      variant={"single-hidden"}
                      startDate={values.fromDate}
                      onChange={({ startDate }) => {
                        const startDateAsDate =
                          typeof startDate === "string"
                            ? startDate
                            : format(startDate, "MMM d, yyyy").toString();

                        setSelectedFromDate(startDateAsDate);
                        setFieldValue("fromDate", startDateAsDate);
                        setSelectedToDate(startDateAsDate);
                        setFieldValue("toDate", startDateAsDate);
                      }}
                      startLabel={t("From")}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <DatePicker
                      variant={"single-hidden"}
                      startDate={values.toDate}
                      onChange={({ startDate }) => {
                        const startDateAsDate =
                          typeof startDate === "string"
                            ? startDate
                            : format(startDate, "MMM d, yyyy").toString();

                        setSelectedToDate(startDateAsDate);
                        setFieldValue("toDate", startDateAsDate);
                      }}
                      startLabel={t("To")}
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <Typography>{t("Reason")}</Typography>
                    <SelectNew
                      options={changeReasonOptions}
                      value={{
                        value: values.changeReason ?? "",
                        label:
                          changeReasonOptions.find(
                            (a: any) => a.value === values.changeReason
                          )?.label || "",
                      }}
                      onChange={async (e: OptionType) => {
                        let selectedValue = null;
                        if (e) {
                          selectedValue = (e as OptionTypeBase).value;
                        }
                        setSelectedChangeReason(selectedValue);
                        setFieldValue("changeReason", selectedValue);
                      }}
                      multiple={false}
                    />
                  </Grid>
                </Grid>
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Grid item xs={4}></Grid>
                  <Grid item xs={8}>
                    <Input
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
