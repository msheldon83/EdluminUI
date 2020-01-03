import * as React from "react";
import {
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Button,
  Collapse,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Formik } from "formik";
import { Grid, makeStyles, FormHelperText } from "@material-ui/core";
import { DateInput } from "ui/components/form/date-picker";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { ActionButtons } from "../../../components/action-buttons";

type Props = {};

export const CreateExpansionPanel: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const initialValues = {};

  return (
    <>
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>New Event</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Formik
            initialValues={initialValues}
            onSubmit={async (data: any) => {
              console.log("submit");
            }}
          >
            {({ handleSubmit, handleChange, submitForm, values }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={8}>
                  <Grid item xs={12} sm={6} lg={6}>
                    <Input
                      label={t("Contract")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "contract",
                        margin: "none",
                        variant: "outlined",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6}>
                    <Input
                      label={t("From")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        placeholder: "Start Date of Event",
                        name: "startDate",
                        margin: "none",
                        variant: "outlined",
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          handleChange(e);
                          //props.onNameChange(e.currentTarget.value);
                        },
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6}>
                    <Input
                      label={t("To")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "endDate",
                        margin: "none",
                        variant: "outlined",
                        placeholder: "End Date of Event",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6}>
                    <Input
                      label={t("Reason")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "reason",
                        margin: "none",
                        variant: "outlined",
                        placeholder: "Absence Reason",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6}>
                    <Input
                      label={t("Bell Schedule Variant")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "bellSchedule",
                        margin: "none",
                        variant: "outlined",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={6}>
                    <Input
                      label={t("Note")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "description",
                        margin: "none",
                        variant: "outlined",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                </Grid>
                <ActionButtons
                  submit={{ text: t("Next"), execute: submitForm }}
                  cancel={{ text: t("Cancel"), execute: () => {} }}
                />
              </form>
            )}
          </Formik>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  subGroupSummaryText: {
    fontWeight: "bold",
    paddingLeft: theme.spacing(2),
    "@media print": {
      paddingLeft: 0,
    },
  },
  subGroupExpanded: {
    borderTop: "0 !important",
    margin: "0 !important",
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
  },
  details: {
    padding: 0,
    display: "block",
  },
  subDetailHeader: {
    width: "100%",
  },
  summary: {
    borderBottom: `1px solid ${theme.customColors.medLightGray}`,
    height: theme.typography.pxToRem(16),
    "@media print": {
      paddingLeft: theme.spacing(),
      minHeight: `${theme.typography.pxToRem(30)} !important`,
    },
  },
  summaryText: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
}));
