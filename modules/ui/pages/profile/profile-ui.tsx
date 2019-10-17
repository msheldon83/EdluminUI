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
import { UpdateUserTimezone } from "ui/pages/profile/UpdateUserTimezone.gen";
import { ResetPassword } from "ui/pages/profile/ResetPassword.gen";
import { ChangeLoginEmailDialog } from "./change-email-dialog";
import { ChangeTimezoneDialog } from "./change-timezone-dialog";

type Props = {
  user: MyProfile.User;
  updateLoginEmail: MutationFunction<
    UpdateLoginEmail.Mutation,
    UpdateLoginEmail.Variables
  >;
  updateTimezone: MutationFunction<
    UpdateUserTimezone.Mutation,
    UpdateUserTimezone.Variables
  >;
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

  const initials = getInitials(props.user);

  const saveButton = (
    <Button variant="contained" fullWidth={isSmDown}>
      {t("Save")}
    </Button>
  );
  const onCloseEmailDialog = React.useCallback(
    () => setChangeEmailIsOpen(false),
    [setChangeEmailIsOpen]
  );

  const onResetPassword = async () => {
    await props.resetPassword({
      variables: { resetPasswordInput: { userId: props.user.id! } },
    });
  };

  const onCloseTimezoneDialog = React.useCallback(
    () => setChangeTimezoneIsOpen(false),
    [setChangeTimezoneIsOpen]
  );

  const updateTimezoneCallback = React.useCallback(
    async (timeZoneId: any) =>
      await props.updateTimezone({
        variables: {
          user: {
            id: props.user.id!,
            timeZoneId,
            rowVersion: props.user.rowVersion,
          },
        },
      }),
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
                  <TextField
                    label={t("First Name")}
                    value={props.user.firstName || ""}
                    margin={isSmDown ? "normal" : "none"}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
                    className={isSmDown ? "" : classes.spacing}
                    label={t("Last Name")}
                    value={props.user.lastName || ""}
                    margin={isSmDown ? "normal" : "none"}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid item container>
                <Grid item md={6} xs={12}>
                  <TextField
                    label={t("Mobile Phone")}
                    value={props.user.phone || ""}
                    margin="normal"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Hidden mdUp>
                <Grid item>{saveButton}</Grid>
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
                  <Button variant="outlined"
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
                        value={selectTimeZoneOption.enumValue || undefined}
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
            <Grid item container alignContent="flex-end" justify="flex-end">
              <Grid item>{saveButton}</Grid>
            </Grid>
          </Hidden>
        </Grid>
      </Section>
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
