import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  MenuItem,
} from "@material-ui/core";
import { Formik } from "formik";
import { MyProfile } from "ui/pages/profile/MyProfile.gen";
import { UserUpdateInput, TimeZone } from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { InformationHelperText } from "ui/components/information-helper-text";
import { TextButton } from "ui/components/text-button";
import * as Forms from "atomic-object/forms";
import * as Yup from "yup";

export type MinimalUpdateTimezoneArgs = Pick<
  UserUpdateInput,
  "id" | "timeZoneId" | "rowVersion"
>;
type Props = {
  open: boolean;
  onClose: () => void;
  user: MyProfile.User;
  updateTimezone: (timeZoneId: TimeZone) => Promise<any>;
};

export const ChangeTimezoneDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const initialValues: MinimalUpdateTimezoneArgs = {
    id: props.user.id! /* The Id should always be there*/,
    timeZoneId: props.user.timeZoneId,
    rowVersion: props.user.rowVersion,
  };

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values: MinimalUpdateTimezoneArgs) => {
          await props.updateTimezone(values.timeZoneId!); // !
          props.onClose();
        }}
        validationSchema={Yup.object().shape({
          timeZoneId: Yup.string().required(t("Required")),
        })}
      >
        {({ values, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <div className={classes.spacing}>
              <DialogTitle>{t("Change Time Zone")}</DialogTitle>
              <DialogContent>
                <Forms.TextField
                  name="changeTimezone"
                  label={t("Time Zone")}
                  select
                  value={values.timeZoneId || undefined}
                  margin="normal"
                  variant="outlined"
                  fullWidth
                >
                  {[values.timeZoneId].map((tz, i) => (
                    <MenuItem key={i} value={tz || undefined}>
                      {tz}
                    </MenuItem>
                  ))}
                </Forms.TextField>

                <InformationHelperText
                  text={t(
                    "Your availability times will be adjusted to reflect this change."
                  )}
                  className={classes.helperText}
                />
              </DialogContent>
              <DialogActions>
                <TextButton onClick={props.onClose}>{t("Cancel")}</TextButton>
                <TextButton type="submit" disabled={isSubmitting}>
                  {t("Save")}
                </TextButton>
              </DialogActions>
            </div>
          </form>
        )}
      </Formik>
    </Dialog>
  );
};

const useStyles = makeStyles(theme => ({
  helperText: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(2),
  },
  spacing: {
    padding: theme.spacing(1),
    paddingBottom: 0,
  },
}));
