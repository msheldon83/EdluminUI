import * as React from "react";
import { useIsMobile } from "hooks";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import * as yup from "yup";
import {
  Grid,
  RadioGroup,
  Radio,
  FormControlLabel,
  Typography,
} from "@material-ui/core";

type Props = {
  orgUserName: string;
  orgUserType: string;
  onSubmit: (orgUser: any) => Promise<unknown>;
  onCancel: () => void;
};

export const FinishWizard: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <Formik
      initialValues={{ inviteImmediately: true, createAnother: true }}
      onSubmit={props.onSubmit}
      validationSchema={yup.object().shape({
        inviteImmediately: yup
          .boolean()
          .required(t("Invitation selection required")),
        isRestricted: yup.boolean(),
      })}
    >
      {({ values, handleSubmit, setFieldValue }) => (
        <form onSubmit={handleSubmit}>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6" className={classes.label}>
              {t(
                `Do you want to invite ${props.orgUserName} to create their account right away?`
              )}
            </Typography>
            <RadioGroup
              aria-label="inviteImmediately"
              name="inviteImmediately"
              value={values.inviteImmediately}
              onChange={e => {
                setFieldValue("inviteImmediately", e.target.value === "true");
              }}
              row={!isMobile}
            >
              <FormControlLabel
                value={false}
                control={<Radio color="primary" />}
                label={t("No")}
                labelPlacement="end"
              />
              <FormControlLabel
                value={true}
                control={<Radio color="primary" />}
                label={t("Yes")}
                labelPlacement="end"
              />
            </RadioGroup>
          </Grid>

          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="h6" className={classes.label}>
              {t(`Do you want to create another ${props.orgUserType}?`)}
            </Typography>
            <RadioGroup
              aria-label="createAnother"
              name="createAnother"
              value={values.createAnother}
              onChange={e => {
                setFieldValue("createAnother", e.target.value === "true");
              }}
              row={!isMobile}
            >
              <FormControlLabel
                value={false}
                control={<Radio color="primary" />}
                label={t("No")}
                labelPlacement="end"
              />
              <FormControlLabel
                value={true}
                control={<Radio color="primary" />}
                label={t("Yes")}
                labelPlacement="end"
              />
            </RadioGroup>
          </Grid>
        </form>
      )}
    </Formik>
  );
};

const useStyles = makeStyles(theme => ({
  label: {
    marginTop: theme.spacing(4),
  },
}));
