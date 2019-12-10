import * as React from "react";
import { Typography, Divider, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { formatIsoDateIfPossible } from "helpers/date";
import { TextButton } from "ui/components/text-button";
import { AvatarCard } from "ui/components/avatar-card";
import { useBreakpoint } from "hooks";
import { getInitials } from "ui/components/helpers";
import { PhoneNumberInput } from "ui/components/form/phone-number-input";
import { StateCode, CountryCode, OrgUserRole } from "graphql/server-types.gen";
import { PeopleGridItem } from "./people-grid-item";

type Props = {
  editing: string | null;
  orgUser: {
    firstName: string;
    lastName: string;
    email: string;
    address1?: string | null | undefined;
    address2?: string | null | undefined;
    city?: string | null | undefined;
    state?: StateCode | null | undefined;
    country?: CountryCode | null | undefined;
    postalCode?: string | null | undefined;
    phoneNumber?: string | null | undefined;
    loginEmail?: string | null | undefined;
    dateOfBirth?: string | null | undefined;
    permissionSets?:
      | Array<{ name: string; orgUserRole: OrgUserRole } | null | undefined>
      | null
      | undefined;
    isSuperUser: boolean;
  };
  lastLogin: string | null | undefined;
  selectedRole: OrgUserRole;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  onResetPassword: () => Promise<unknown>;
};

export const Information: React.FC<Props> = props => {
  const classes = useStyles();

  const orgUser = props.orgUser;
  const { t } = useTranslation();
  const history = useHistory();
  const isSmDown = useBreakpoint("sm", "down");

  const formattedLoginTime = formatIsoDateIfPossible(
    props.lastLogin ? props.lastLogin : "Not Available",
    "MMM d, yyyy h:m a"
  );

  const formattedBirthDate = formatIsoDateIfPossible(
    orgUser.dateOfBirth ? (
      orgUser.dateOfBirth
    ) : (
      <span className={classes.notSpecified}>{t("Not Specified")}</span>
    ),
    "MMM d, yyyy"
  );

  const initials = getInitials(props.orgUser);

  let permissions = orgUser.isSuperUser ? t("Org Admin") : "";
  if (orgUser.permissionSets!.length > 0) {
    permissions =
      orgUser?.permissionSets
        ?.filter(p => p?.orgUserRole === props.selectedRole)
        .map(p => p?.name)
        .join(",") ?? t("No Permissions Defined");
  }

  return (
    <>
      <Section className={classes.customSection}>
        <SectionHeader
          title={t("Information")}
          action={{
            text: t("Edit"),
            visible: !props.editing,
            execute: () => {
              const editSettingsUrl = "/"; //TODO figure out the URL for editing
              history.push(editSettingsUrl);
            },
          }}
        />
        <Grid container>
          <Grid container item xs={8} component="dl" spacing={2}>
            <PeopleGridItem title={t("Email")} description={orgUser.email} />
            <PeopleGridItem
              title={t("Address")}
              description={
                !orgUser.address1 ? (
                  <span className={classes.notSpecified}>
                    {t("Not specified")}
                  </span>
                ) : (
                  <>
                    <div>{orgUser.address1}</div>
                    <div>{orgUser.address2 && `${orgUser.address2}`}</div>
                    <div>{`${orgUser.city}, ${orgUser.state} ${orgUser.postalCode}`}</div>
                    <div>{orgUser.country}</div>
                  </>
                )
              }
            />
            <PhoneNumberInput
              phoneNumber={orgUser.phoneNumber ?? t("Not specified")}
              forViewOnly={true}
            />
            <PeopleGridItem
              title={t("Date of Birth")}
              description={formattedBirthDate}
            />
            <Grid item xs={12}>
              <Divider variant="fullWidth" className={classes.divider} />
            </Grid>
            <PeopleGridItem
              title={t("Permissions")}
              description={permissions}
            />
            <PeopleGridItem
              title={t("Last Login")}
              description={formattedLoginTime}
            />
            <PeopleGridItem
              title={t("Last Username")}
              description={orgUser.loginEmail}
            />
            <PeopleGridItem
              title={t("Password")}
              description={
                <TextButton onClick={() => props.onResetPassword()}>
                  {t("Reset Password")}
                </TextButton>
              }
            />
          </Grid>
          <Grid container item spacing={2} xs={4}>
            <Grid
              item
              container={isSmDown}
              justify={isSmDown ? "center" : undefined}
            >
              <div className={classes.avatar}>
                <AvatarCard initials={initials} />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  customSection: {
    borderRadius: `0 0 ${theme.typography.pxToRem(
      4
    )} ${theme.typography.pxToRem(4)}`,
  },
  divider: {
    marginBottom: theme.spacing(1),
  },
  avatar: {
    paddingLeft: theme.spacing(9),
  },
  notSpecified: {
    color: theme.customColors.edluminSubText,
  },
}));
