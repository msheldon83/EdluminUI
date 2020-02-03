import { MutationFunction } from "@apollo/react-common";
import { Maybe } from "graphql/server-types.gen";
import {
  Button,
  Grid,
  Hidden,
  makeStyles,
  MenuItem,
  Box,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import { useBreakpoint } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { GetTimezones } from "reference-data/get-timezones.gen";
import { AvatarCard } from "ui/components/avatar-card";
import { getInitials } from "ui/components/helpers";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { TextButton } from "ui/components/text-button";
import { UpdateLoginEmail } from "ui/pages/profile/UpdateLoginEmail.gen";
import { UpdateUser } from "./UpdateUser.gen";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { ResetPassword } from "ui/pages/profile/ResetPassword.gen";
import { ChangeLoginEmailDialog } from "./change-email-dialog";
import { ChangeTimezoneDialog } from "./change-timezone-dialog";
import { Formik } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Input } from "ui/components/form/input";
import * as yup from "yup";
import { useSnackbar } from "hooks/use-snackbar";

type Props = {
  user: GetMyUserAccess.User;
  updateLoginEmail: MutationFunction<
    UpdateLoginEmail.Mutation,
    UpdateLoginEmail.Variables
  >;
  updateUser: MutationFunction<UpdateUser.Mutation, UpdateUser.Variables>;
  timeZoneOptions: Maybe<GetTimezones.TimeZones>[];
  resetPassword: MutationFunction<
    ResetPassword.Mutation,
    ResetPassword.Variables
  >;
};

export const ProfileUI: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();
  const isSmDown = useBreakpoint("sm", "down");
  const [rowVersion, setRowVersion] = React.useState(props.user.rowVersion);
  const [changeEmailIsOpen, setChangeEmailIsOpen] = React.useState(false);
  const [changeTimezoneIsOpen, setChangeTimezoneIsOpen] = React.useState(false);
  const selectTimeZoneOption = props.timeZoneOptions.find(
    tz => tz && tz.enumValue === props.user.timeZoneId
  );

  const initialBasicProfileValues = {
    firstName: props.user.firstName,
    lastName: props.user.lastName,
    phone: props.user.phone || "",
  };

  const initials = getInitials(props.user);

  const onCloseEmailDialog = React.useCallback(
    () => setChangeEmailIsOpen(false),
    [setChangeEmailIsOpen]
  );

  const onResetPassword = async () => {
    const response = await props.resetPassword({
      variables: { resetPasswordInput: { id: props.user.id } },
    });
    const result = response?.data?.user?.resetPassword;
    if (result) {
      openSnackbar({
        message: t("Reset password email has been sent"),
        dismissable: true,
        status: "success",
        autoHideDuration: 5000,
      });
      setRowVersion(result.rowVersion);
    }
  };

  const onCloseTimezoneDialog = React.useCallback(
    () => setChangeTimezoneIsOpen(false),
    [setChangeTimezoneIsOpen]
  );

  const updateTimezoneCallback = React.useCallback(
    async (timeZoneId: any) => {
      const response = await props.updateUser({
        variables: {
          user: {
            id: props.user.id,
            timeZoneId,
            rowVersion: rowVersion,
          },
        },
      });
      const result = response?.data?.user?.update;
      if (result) {
        setRowVersion(result.rowVersion);
      }
    },
    [props, rowVersion]
  );

  // TODO: Consolidate this logic with the phone number field in Information component
  const phoneRegExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

  const cleanPhoneNumber = (phoneNumber: string) => {
    return phoneNumber.replace(/\D/g, "");
  };

  const updateBasicDetails = React.useCallback(
    async (data: { firstName: string; lastName: string; phone: string }) => {
      const { firstName, lastName, phone } = data;
      const response = await props.updateUser({
        variables: {
          user: {
            id: props.user.id,
            rowVersion: rowVersion,
            firstName,
            lastName,
            phone: phone.trim().length === 0 ? null : cleanPhoneNumber(phone),
          },
        },
      });
      const result = response?.data?.user?.update;
      if (result) {
        setRowVersion(result.rowVersion);
      }
    },
    [props, rowVersion]
  );

  const validateBasicDetails = React.useMemo(
    () =>
      yup.object().shape({
        firstName: yup.string().required(t("First name is required")),
        lastName: yup.string().required(t("Last name is required")),
        phone: yup
          .string()
          .nullable()
          .required(t("Phone number is required")) // TODO: Only require this if the user has a replacmenet Employee role
          .matches(phoneRegExp, t("Phone Number Is Not Valid")),
      }),
    [t, phoneRegExp]
  );  

  return (
    <>
      <ChangeLoginEmailDialog
        open={changeEmailIsOpen}
        onClose={onCloseEmailDialog}
        updateLoginEmail={props.updateLoginEmail}
        user={props.user}
        triggerReauth={true}
      />
      <ChangeTimezoneDialog
        open={changeTimezoneIsOpen}
        onClose={onCloseTimezoneDialog}
        user={props.user}
        updateTimezone={updateTimezoneCallback}
        timeZoneOptions={props.timeZoneOptions}
      />

      <PageTitle title={t("My Profile")} />

      <Formik
        initialValues={initialBasicProfileValues}
        onSubmit={(data, meta) => updateBasicDetails(data)}
        validationSchema={validateBasicDetails}
      >
        {({ handleSubmit, submitForm }) => (
          <form onSubmit={handleSubmit}>
            <Section>
              <Grid container spacing={3}>
                <Grid
                  item
                  container={isSmDown}
                  justify={isSmDown ? "center" : undefined}
                >
                  <AvatarCard initials={initials} />
                </Grid>

                <Grid item md={7} xs={12}>
                  <Grid container direction="column">
                    <Grid container item>
                      <Grid item md={6} xs={12}>
                        <Input
                          label={t("First Name")}
                          withSpacing
                          InputComponent={FormTextField}
                          inputComponentProps={{
                            name: "firstName",
                            margin: isSmDown ? "normal" : "none",
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <Input
                          label={t("Last Name")}
                          className={isSmDown ? "" : classes.spacing}
                          InputComponent={FormTextField}
                          inputComponentProps={{
                            name: "lastName",
                            margin: isSmDown ? "normal" : "none",
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Grid item container>
                      <Grid item md={6} xs={12}>
                        <Input
                          label={t("Mobile Phone")}
                          withSpacing
                          InputComponent={FormTextField}
                          inputComponentProps={{
                            name: "phone",
                            fullWidth: true,
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Hidden mdUp>
                      <Grid item>
                        <Button
                          onClick={submitForm}
                          variant="contained"
                          fullWidth={isSmDown}
                        >
                          {t("Save")}
                        </Button>
                      </Grid>
                    </Hidden>

                    <Grid item container alignItems="center">
                      <div
                        className={classes.field}
                        onClick={() => setChangeEmailIsOpen(true)}
                      >
                        <Input
                          label={t("Email")}
                          value={props.user.loginEmail}
                          withSpacing
                          fullWidth
                          disabled
                        />
                      </div>

                      {isSmDown ? (
                        <Button
                          variant="outlined"
                          fullWidth
                          className={classes.button}
                          onClick={() => setChangeEmailIsOpen(true)}
                        >
                          {t("Change Email")}
                        </Button>
                      ) : (
                        <TextButton
                          className={classes.buttonSpacing}
                          onClick={() => setChangeEmailIsOpen(true)}
                        >
                          {t("Change")}
                        </TextButton>
                      )}
                    </Grid>

                    <Grid item container>
                      <Grid item md={6} xs={12}>
                        <Button
                          variant="outlined"
                          fullWidth
                          onClick={() => onResetPassword()}
                        >
                          {t("Reset Password")}
                        </Button>
                      </Grid>
                    </Grid>

                    <Grid item container alignItems="baseline">
                      <div
                        className={classes.field}
                        onClick={() => setChangeTimezoneIsOpen(true)}
                      >
                        <TextField
                          label={t("Time Zone")}
                          select
                          value={props.user.timeZoneId}
                          className={classes.filled}
                          margin="normal"
                          variant="outlined"
                          fullWidth
                          disabled
                        >
                          {selectTimeZoneOption && (
                            <MenuItem
                              value={
                                selectTimeZoneOption.enumValue || undefined
                              }
                            >
                              {selectTimeZoneOption.name}
                            </MenuItem>
                          )}
                        </TextField>
                      </div>

                      <Grid item md={6} xs={12}>
                        {isSmDown ? (
                          <Button
                            variant="outlined"
                            fullWidth
                            className={classes.button}
                            onClick={() => setChangeTimezoneIsOpen(true)}
                          >
                            {t("Change Timezone")}
                          </Button>
                        ) : (
                          <TextButton
                            className={classes.buttonSpacing}
                            onClick={() => setChangeTimezoneIsOpen(true)}
                          >
                            {t("Change")}
                          </TextButton>
                        )}
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Hidden smDown>
                  <Grid
                    item
                    container
                    alignContent="flex-end"
                    justify="flex-end"
                  >
                    <Grid item>
                      <Button
                        onClick={submitForm}
                        variant="contained"
                        fullWidth={isSmDown}
                      >
                        {t("Save")}
                      </Button>
                    </Grid>
                  </Grid>
                </Hidden>
              </Grid>
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
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  field: {
    display: "flex",
    width: "50%",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
}));
