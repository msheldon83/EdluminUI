import * as React from "react";
import { Button, Grid, makeStyles, Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { useTranslation } from "react-i18next";
import { AvatarCard } from "ui/components/avatar-card";
import { getInitials } from "ui/components/helpers";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { ChangeLoginEmailDialog } from "./components/change-email-dialog";
import { Formik } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Input } from "ui/components/form/input";
import * as yup from "yup";
import { useTimeZoneOptions } from "reference-data/timezones";
import { SelectNew } from "ui/components/form/select-new";
import { useIsMobile } from "hooks";
import { UserUpdateInput, TimeZone } from "graphql/server-types.gen";
import { TextButton } from "ui/components/text-button";

type Props = {
  user: {
    id: string;
    rowVersion: string;
    phone?: string | null;
    firstName: string;
    lastName: string;
    loginEmail: string;
    timeZoneId?: TimeZone | null;
  };
  onUpdateLoginEmail: (loginEmail: string) => Promise<any>;
  onUpdateUser: (updatedUser: UserUpdateInput) => Promise<any>;
  onResetPassword: () => Promise<any>;
};

export const ProfileUI: React.FC<Props> = props => {
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

  // TODO: Consolidate this logic with the phone number field in Information component
  const phoneRegExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

  const cleanPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, "");
  };

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
                <Grid container item spacing={2} xs={isMobile ? 12 : 4}>
                  <Grid container item spacing={2} xs={isMobile ? 8 : 12}>
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
                  </Grid>
                  {isMobile && (
                    <Grid item xs={4}>
                      <div className={classes.avatarContainer}>
                        <AvatarCard initials={initials} />
                      </div>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Input
                      label={t("Mobile Phone")}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "phone",
                        fullWidth: true,
                      }}
                    />
                  </Grid>
                </Grid>
                <Grid container item spacing={2} xs={isMobile ? 12 : 4}>
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
}));
