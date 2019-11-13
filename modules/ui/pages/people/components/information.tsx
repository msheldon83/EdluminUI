import * as React from "react";
import { Typography, Divider, Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { formatIsoDateIfPossible } from "helpers/date";
import { TextButton } from "ui/components/text-button";
import { AvatarCard } from "ui/components/avatar-card";
import { useBreakpoint } from "hooks";
import { getInitials } from "ui/components/helpers";
import { StateCode, CountryCode } from "graphql/server-types.gen";

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
      | Array<{ name: string } | null | undefined>
      | null
      | undefined;
    isSuperUser: boolean;
  };
  lastLogin: string | null | undefined;
  setEditing: React.Dispatch<React.SetStateAction<string | null>>;
  onResetPassword: () => Promise<unknown>;
};

export const Information: React.FC<Props> = props => {
  const orgUser = props.orgUser;
  const { t } = useTranslation();
  const history = useHistory();
  const isSmDown = useBreakpoint("sm", "down");

  const formattedLoginTime = formatIsoDateIfPossible(
    props.lastLogin ? props.lastLogin : "Not Available",
    "MMM d, yyyy h:m a"
  );

  const formattedBirthDate = formatIsoDateIfPossible(
    orgUser.dateOfBirth ? orgUser.dateOfBirth : "Not Specified",
    "MMM d, yyyy"
  );

  const initials = getInitials(props.orgUser);

  let permissions = orgUser.isSuperUser ? t("Org Admin") : "";
  if (orgUser.permissionSets!.length > 0) {
    permissions =
      orgUser?.permissionSets?.map(p => p?.name).join(",") ??
      t("No Permissions Defined");
  }

  return (
    <>
      <Section>
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
        <Grid container spacing={2}>
          <Grid container item spacing={2} xs={8}>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Email")}</Typography>
              <div>{orgUser.email}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Address")}</Typography>
              <div>
                {!orgUser.address1
                  ? t("Not specified")
                  : `${orgUser.address1}\n${orgUser.address2 &&
                      `${orgUser.address2}\n`}${orgUser.city}, ${
                      orgUser.state
                    } ${orgUser.postalCode}\n${orgUser.country}`}
              </div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Phone")}</Typography>
              <div>{orgUser.phoneNumber ?? t("Not specified")}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Date of Birth")}</Typography>
              <div>{formattedBirthDate}</div>
            </Grid>
            <Grid item xs={12}>
              <Divider variant="middle" />
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Permissions")}</Typography>
              <div>{permissions}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Last Login")}</Typography>
              <div>{formattedLoginTime}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Username")}</Typography>
              <div>{orgUser.loginEmail}</div>
            </Grid>
            <Grid item xs={12} sm={6} lg={6}>
              <Typography variant="h6">{t("Password")}</Typography>
              <TextButton onClick={() => props.onResetPassword()}>
                {t("Reset Password")}
              </TextButton>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={4}>
            <Grid
              item
              container={isSmDown}
              justify={isSmDown ? "center" : undefined}
            >
              <AvatarCard initials={initials} />
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};
