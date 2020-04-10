import * as React from "react";
import { Button, Grid, makeStyles, Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { useTranslation } from "react-i18next";
import { AvatarCard } from "ui/components/avatar-card";
import { getInitials } from "ui/components/helpers";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { ChangeLoginEmailDialog } from "./change-email-dialog";
import { Formik } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Input } from "ui/components/form/input";
import * as yup from "yup";
import { useTimeZoneOptions } from "reference-data/timezones";
import { SelectNew } from "ui/components/form/select-new";
import { useIsMobile } from "hooks";
import { UserUpdateInput, TimeZone } from "graphql/server-types.gen";
import { TextButton } from "ui/components/text-button";
import { isAfter, parseISO, format } from "date-fns";
import { phoneRegExp } from "helpers/regexp"

type Props = {
  user: {
    id: string;
    rowVersion: string;
    phone?: string | null;
    firstName: string;
    lastName: string;
    loginEmail: string;
    timeZoneId?: TimeZone | null;
    phoneIsValidForSms?: boolean | null;
    stopSmsUntilUtc?: string | null;
    suspendSmsUntilUtc?: string | null;
  };
  onVerifyPhoneNumber: () => Promise<any>;
  onUpdateLoginEmail: (loginEmail: string) => Promise<any>;
  onUpdateUser: (updatedUser: UserUpdateInput) => Promise<any>;
  onResetPassword: () => Promise<any>;
};

export const ProfileBasicInfo: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const [changeEmailIsOpen, setChangeEmailIsOpen] = React.useState(false);
  const [changeTimezoneIsOpen, setChangeTimezoneIsOpen] = React.useState(false);

  const timeZoneOptions = useTimeZoneOptions();
  const selectedTimeZoneOption = timeZoneOptions.find(
    tz => tz && tz.value === props.user.timeZoneId?.toString()
  ) ?? { label: "", value: "" };

  const initials = getInitials(props.user);

  const onCloseEmailDialog = React.useCallback(
    () => setChangeEmailIsOpen(false),
    [setChangeEmailIsOpen]
  );

  const cleanPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, "");
  };

  const smsStartMessage = `${t(
    "To start SMS notifications, text 'START' to: "
  )} 1 (360) 777-6837`;
  const smsSuspendedMessage = props.user.suspendSmsUntilUtc
    ? isAfter(parseISO(props.user.suspendSmsUntilUtc), new Date())
      ? `${t("SMS notifications paused until")} ${format(
          parseISO(props.user.suspendSmsUntilUtc),
          "LLL d, h:mm a."
        )}`
      : null
    : null;
  const smsStoppedMessage = props.user.stopSmsUntilUtc
    ? isAfter(parseISO(props.user.stopSmsUntilUtc), new Date())
      ? t("SMS Notifications stopped.")
      : null
    : null;

  return (
    <>
      <ChangeLoginEmailDialog
        open={changeEmailIsOpen}
        onClose={onCloseEmailDialog}
        onUpdateLoginEmail={props.onUpdateLoginEmail}
        triggerReauth={true}
      />

      <PageTitle title={t("My Profile")} />

      <Formik
        initialValues={{
          firstName: props.user.firstName,
          lastName: props.user.lastName,
          phone: props.user.phone ?? "",
          timeZoneId: props.user.timeZoneId?.toString() ?? "",
        }}
        onSubmit={async data =>
          await props.onUpdateUser({
            id: props.user.id,
            rowVersion: props.user.rowVersion,
            firstName: data.firstName,
            lastName: data.lastName,
            phone:
              data.phone.trim().length === 0
                ? null
                : cleanPhoneNumber(data.phone),
            timeZoneId: data.timeZoneId as TimeZone,
          })
        }
        validationSchema={yup.object().shape({
          firstName: yup.string().required(t("First name is required")),
          lastName: yup.string().required(t("Last name is required")),
          timeZoneId: yup.string().required(t("Time zone is required")),
          phone: yup
            .string()
            .nullable()
            .required(t("Phone number is required")) // TODO: Only require this if the user has a replacmenet Employee role
            .matches(phoneRegExp, t("Phone Number Is Not Valid")),
        })}
      >
        {({ handleSubmit, submitForm, values, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <Grid container spacing={2}>
                <Grid
                  container
                  item
                  xs={isMobile ? 12 : 4}
                  alignItems="stretch"
                >
                  <Grid item xs={12}>
                    <Input
                      label={t("First Name")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "firstName",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Input
                      label={t("Last Name")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "lastName",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  {isMobile && (
                    <Grid item xs={4}>
                      <div className={classes.avatarContainer}>
                        <AvatarCard initials={initials} />
                      </div>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <div className={classes.labelContainer}>
                      <div>{t("Mobile Phone")}</div>
                      {props.user.phoneIsValidForSms &&
                        props.user.phone === values.phone && (
                          <div>{t("Verified for SMS")}</div>
                        )}
                    </div>
                    <Input
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "phone",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                  {!props.user.phoneIsValidForSms &&
                    props.user.phone === values.phone && (
                      <Grid item xs={12}>
                        <div className={classes.verifyButton}>
                          <Button
                            onClick={props.onVerifyPhoneNumber}
                            variant="contained"
                          >
                            {t("Send Test SMS")}
                          </Button>
                        </div>
                      </Grid>
                    )}
                </Grid>
                <Grid
                  container
                  item
                  spacing={2}
                  xs={isMobile ? 12 : 4}
                  alignItems="center"
                >
                  <Grid item xs={12}>
                    <div onClick={() => setChangeEmailIsOpen(true)}>
                      <div className={classes.labelContainer}>
                        <div>{t("Email")}</div>
                        <TextButton onClick={() => setChangeEmailIsOpen(true)}>
                          {t("Edit email")}
                        </TextButton>
                      </div>
                      <Input value={props.user.loginEmail} fullWidth disabled />
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div>
                      <div className={classes.labelContainer}>
                        <div>
                          {t("Time Zone")}
                          <Tooltip
                            title={
                              <div className={classes.tooltip}>
                                {t(
                                  "Changing the timezone will cause your availability times to change."
                                )}
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
                        </div>
                        <TextButton
                          onClick={() => setChangeTimezoneIsOpen(true)}
                        >
                          {t("Edit time zone")}
                        </TextButton>
                      </div>
                      <SelectNew
                        value={selectedTimeZoneOption}
                        multiple={false}
                        options={timeZoneOptions}
                        disabled={!changeTimezoneIsOpen}
                        withResetValue={false}
                        onChange={value => {
                          const timeZoneId = value.value;
                          setFieldValue("timeZoneId", timeZoneId);
                        }}
                      />
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <div onClick={() => props.onResetPassword()}>
                      <div className={classes.labelContainer}>
                        <div>
                          {t("Password")}
                          <Tooltip
                            title={
                              <div className={classes.tooltip}>
                                {t(
                                  "Upon reset, an email will be sent with instructions on resetting your password."
                                )}
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
                        </div>
                        <TextButton onClick={() => props.onResetPassword()}>
                          {t("Reset password")}
                        </TextButton>
                      </div>
                      <Input value={"**********"} fullWidth disabled />
                    </div>
                  </Grid>
                </Grid>
                {!isMobile && (
                  <Grid container item spacing={2} xs={4}>
                    <div className={classes.avatarContainer}>
                      <AvatarCard initials={initials} />
                    </div>
                  </Grid>
                )}
              </Grid>
              <div className={classes.button}>
                <Button onClick={submitForm} variant="contained">
                  {t("Save")}
                </Button>
              </div>
              {(smsSuspendedMessage || smsStoppedMessage) && (
                <div className={classes.smsWarning}>{`${
                  smsSuspendedMessage ? smsSuspendedMessage : smsStoppedMessage
                } ${smsStartMessage}`}</div>
              )}
            </Section>
          </form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filled: {
    background: theme.customColors.grayWhite,
  },
  spacing: {
    marginLeft: theme.spacing(2),
  },
  buttonSpacing: {
    marginLeft: theme.spacing(4),
  },
  button: {
    display: "flex",
    marginTop: theme.spacing(2),
    justifyContent: "flex-end",
  },
  verifyButton: {
    display: "flex",
    marginTop: theme.spacing(2),
    justifyContent: "flex-start",
  },
  field: {
    display: "flex",
    width: "50%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  tooltip: {
    padding: theme.spacing(2),
  },
  labelContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(0.4),
  },
  avatarContainer: {
    padding: theme.spacing(3),
  },
  smsWarning: {
    color: theme.customColors.darkRed,
    fontWeight: "bold",
    fontSize: theme.typography.pxToRem(14),
  },
}));
