import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  MenuItem,
} from "@material-ui/core";
import { Formik } from "formik";
import { MyProfile } from "graphql/queries/MyProfile.gen";
import { UserUpdateInput, TimeZone } from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { InformationHelperText } from "ui/components/information-helper-text";
import { TextButton } from "ui/components/text-button";
import * as Forms from "atomic-object/forms";

export type MinimalUpdateTimezoneArgs = Pick<
  UserUpdateInput,
  "id" | "timeZoneId"
>;
type Props = {
  open: boolean;
  onClose: () => void;
  user: MyProfile.User;
  updateTimezone: (timeZoneId: TimeZone) => void;
};

export const ChangeTimezoneDialog: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const initialValues: MinimalUpdateTimezoneArgs = {
    id: props.user.id! /* The Id should always be there*/,
    timeZoneId: props.user.timeZoneId,
  };

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <Formik
        initialValues={initialValues}
        onSubmit={async (values: MinimalUpdateTimezoneArgs) => {
          props.updateTimezone(values.timeZoneId!); // !
          props.onClose();
        }}
      >
        {({ values, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <div className={classes.spacing}>
              <DialogTitle>{t("Change Timezone")}</DialogTitle>
              <DialogContent>
                <Forms.TextField
                  name="changeTimezone"
                  select
                  value={values.timeZoneId || undefined}
                  margin="normal"
                  variant="outlined"
                  fullWidth
                  // className={classes.select}
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
