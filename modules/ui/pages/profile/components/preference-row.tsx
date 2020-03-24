import * as React from "react";
import { makeStyles, Checkbox, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import { useIsMobile } from "hooks";
import {
  NotificationPreferenceInput,
  NotificationReason,
} from "graphql/server-types.gen";
import clsx from "clsx";

type Props = {
  notificationPreference?: {
    notificationReasonId?: NotificationReason | null;
    receiveEmailNotifications: boolean;
    receiveSmsNotifications: boolean;
    receiveInAppNotifications: boolean;
  } | null;
  onUpdatePreference: (
    notificationPreference: NotificationPreferenceInput
  ) => Promise<any>;
  shadeRow: boolean;
};

export const PreferenceRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <>
      <Formik
        initialValues={{
          receiveEmailNotifications:
            props.notificationPreference?.receiveEmailNotifications ?? false,
          receiveSmsNotifications:
            props.notificationPreference?.receiveSmsNotifications ?? false,
          receiveInAppNotifications:
            props.notificationPreference?.receiveInAppNotifications ?? false,
        }}
        onSubmit={async data =>
          await props.onUpdatePreference({
            notificationReasonId:
              props.notificationPreference?.notificationReasonId,
            receiveEmailNotifications: data.receiveEmailNotifications,
            receiveInAppNotifications: data.receiveInAppNotifications,
            receiveSmsNotifications: data.receiveSmsNotifications,
          })
        }
      >
        {({ handleSubmit, submitForm, values, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Grid
              container
              item
              xs={6}
              spacing={1}
              alignItems="center"
              className={clsx({
                [classes.shadedRow]: props.shadeRow,
              })}
            >
              <Grid item xs={6}>
                {props.notificationPreference?.notificationReasonId}
              </Grid>
              <Grid item xs={2}>
                <Checkbox
                  color="primary"
                  checked={values.receiveEmailNotifications}
                  onChange={e =>
                    setFieldValue("receiveEmailNotifications", e.target.checked)
                  }
                />
              </Grid>
              <Grid item xs={2}>
                <Checkbox
                  color="primary"
                  checked={values.receiveSmsNotifications}
                  onChange={e =>
                    setFieldValue("receiveSmsNotifications", e.target.checked)
                  }
                />
              </Grid>
              <Grid item xs={2}>
                <Checkbox
                  color="primary"
                  checked={values.receiveInAppNotifications}
                  onChange={e =>
                    setFieldValue("receiveInAppNotifications", e.target.checked)
                  }
                />
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedRow: {
    background: theme.customColors.lightGray,
    border: `1px solid ${theme.customColors.lightGray}`,
  },
  checkBox: {
    padding: theme.spacing(2),
  },
}));
