import * as React from "react";
import { MyProfile } from "graphql/queries/MyProfile.gen";
import { PageTitle } from "ui/components/page-title";
import { Trans } from "react-i18next";
import {
  makeStyles,
  Card,
  Paper,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Button,
} from "@material-ui/core";
import { Section } from "ui/components/section";
import { AvatarCard } from "ui/components/avatar-card";
import { TextButton } from "ui/components/text-button";

type Props = {
  user: MyProfile.User;
};

export const ProfileUI: React.FC<Props> = props => {
  const classes = useStyles();
  const initials = `${
    props.user.firstName ? props.user.firstName.substr(0, 1) : ""
  }${props.user.lastName ? props.user.lastName.substr(0, 1) : ""}`;
  return (
    <>
      <PageTitle>
        <Trans i18nKey="profile.title">My Profile</Trans>
      </PageTitle>

      <Section>
        <Grid container spacing={3}>
          <Grid>
            <AvatarCard initials={initials} />
            <Typography>
              Hello {props.user.firstName} {props.user.lastName}
            </Typography>
          </Grid>

          <Grid item md={6}>
            <Grid container direction="column">
              {/*  */}
              <Grid container item>
                <Grid item md={6}>
                  <TextField
                    label="First Name"
                    // className={classes.textField}
                    value={props.user.firstName || ""}
                    margin="normal"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item md={6}>
                  <TextField
                    label="Last Name"
                    value={props.user.lastName || ""}
                    margin="normal"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid item container>
                <Grid item md={6}>
                  <TextField
                    label="Mobile Phone"
                    value={props.user.phone || ""}
                    margin="normal"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Grid item container alignItems="baseline">
                <Grid item md={6}>
                  <TextField
                    label="Email"
                    value={props.user.loginEmail}
                    className={classes.filled}
                    margin="normal"
                    variant="outlined"
                    fullWidth
                  />
                </Grid>

                <Grid item md={6}>
                  <TextButton>
                    <Trans i18nKey={"profile.change"}>Change</Trans>
                  </TextButton>
                </Grid>
              </Grid>

              <Grid item container>
                <Grid item md={6}>
                  <Button variant="outlined" fullWidth>
                    <Trans i18nKey={"profile.resetPassword"}>
                      Reset Password
                    </Trans>
                  </Button>
                </Grid>
              </Grid>

              <Grid item container alignItems="baseline">
                <Grid item md={6}>
                  <TextField
                    label="Time Zone"
                    select
                    value={props.user.timeZoneId}
                    className={classes.filled}
                    margin="normal"
                    variant="outlined"
                    fullWidth
                  >
                    <MenuItem value={props.user.timeZoneId || ""}>
                      {props.user.timeZoneId}
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item md={6}>
                  <TextButton>
                    <Trans i18nKey={"profile.change"}>Change</Trans>
                  </TextButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filled: {
    background: theme.customColors.grayWhite,
  },
}));
