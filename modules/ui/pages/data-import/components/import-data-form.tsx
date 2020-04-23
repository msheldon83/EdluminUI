import * as React from "react";
import { Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Formik } from "formik";
import { makeStyles } from "@material-ui/core";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";

type Props = {
  orgId: string;
  onClose: () => void;
  refetchImports?: () => Promise<void>;
};

export const ImportDataForm: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Formik
        initialValues={{}}
        onReset={(values, formProps) => {}}
        onSubmit={async (data: any, formProps) => {}}
      >
        {({ values, handleSubmit, setFieldValue, submitForm, handleReset }) => (
          <form className={classes.form} onSubmit={handleSubmit}>
            <Typography variant="h5">{t("It's coming soon!")}</Typography>
          </form>
        )}
      </Formik>
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
