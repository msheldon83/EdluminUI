import { MutationFunction } from "@apollo/react-common";
import { Maybe } from "graphql/server-types.gen";
import {
  Button,
  Grid,
  Hidden,
  makeStyles,
  MenuItem,
  TextField,
} from "@material-ui/core";

import { useBreakpoint } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { GetTimezones } from "reference-data/GetTimezones.gen";
import { AvatarCard } from "ui/components/avatar-card";
import { getInitials } from "ui/components/helpers";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { TextButton } from "ui/components/text-button";
import { MyProfile } from "ui/pages/profile/MyProfile.gen";
import { UpdateLoginEmail } from "ui/pages/profile/UpdateLoginEmail.gen";
import { UpdateUser } from "./UpdateUser.gen";
import { ResetPassword } from "ui/pages/profile/ResetPassword.gen";
import { ChangeLoginEmailDialog } from "./change-email-dialog";
import { ChangeTimezoneDialog } from "./change-timezone-dialog";
import { Formik } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";

type Props = {
  user: MyProfile.User;
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
  const isSmDown = useBreakpoint("sm", "down");
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
    await props.resetPassword({
      variables: { resetPasswordInput: { id: props.user.id } },
    });
  };

  const onCloseTimezoneDialog = React.useCallback(
    () => setChangeTimezoneIsOpen(false),
    [setChangeTimezoneIsOpen]
  );

  const updateTimezoneCallback = React.useCallback(
    async (timeZoneId: any) =>
      await props.updateUser({
        variables: {
          user: {
            id: props.user.id,
            timeZoneId,
            rowVersion: props.user.rowVersion,
          },
        },
      }),
    [props]
  );

  const updateBasicDetails = React.useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      phone: string | null;
    }) => {
      const { firstName, lastName, phone } = data;
      await props.updateUser({
        variables: {
          user: {
            id: props.user.id,
            rowVersion: props.user.rowVersion,
            firstName,
            lastName,
            phone,
          },
        },
      });
    },
    [props]
  );

  return (
    <>
      <ChangeLoginEmailDialog
        open={changeEmailIsOpen}
        onClose={onCloseEmailDialog}
        updateLoginEmail={props.updateLoginEmail}
        user={props.user}
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
                        <FormTextField
                          label={t("First Name")}
                          name="firstName"
                          margin={isSmDown ? "normal" : "none"}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <FormTextField
                          className={isSmDown ? "" : classes.spacing}
                          label={t("Last Name")}
                          name="lastName"
                          margin={isSmDown ? "normal" : "none"}
                          variant="outlined"
                          fullWidth
                        />
                      </Grid>
                    </Grid>

                    <Grid item container>
                      <Grid item md={6} xs={12}>
                        <FormTextField
                          label={t("Mobile Phone")}
                          name="phone"
                          margin="normal"
                          variant="outlined"
                          fullWidth
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

                    <Grid item container alignItems="baseline">
                      <div
                        className={classes.field}
                        onClick={() => setChangeEmailIsOpen(true)}
                      >
                        <TextField
                          label={t("Email")}
                          value={props.user.loginEmail}
                          className={classes.filled}
                          margin="normal"
                          variant="outlined"
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
