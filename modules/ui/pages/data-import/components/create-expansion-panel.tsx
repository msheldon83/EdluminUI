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
import { makeStyles } from "@material-ui/core";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";

type Props = {};

export const CreateExpansionPanel: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();

  const [panelOpened, setPanelOpened] = React.useState(false);

  return (
    <>
      <ExpansionPanel expanded={panelOpened}>
        <ExpansionPanelSummary
          onClick={event => {
            setPanelOpened(!panelOpened);
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography variant="h5">{t("Import data")}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Formik
            initialValues={{}}
            onReset={(values, formProps) => {}}
            onSubmit={async (data: any, formProps) => {}}
          >
            {({
              values,
              handleSubmit,
              setFieldValue,
              submitForm,
              handleReset,
            }) => (
              <form className={classes.form} onSubmit={handleSubmit}>
                <Typography variant="h5">{t("It's coming soon!")}</Typography>
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
