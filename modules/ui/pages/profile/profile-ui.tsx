import * as React from "react";
import { MyProfile } from "graphql/queries/MyProfile.gen";
import { PageTitle } from "ui/components/page-title";
import { Trans } from "react-i18next";
import { Card, Paper, Typography } from "@material-ui/core";
import { Section } from "ui/components/section";
import { AvatarCard } from "ui/components/avatar-card";

type Props = {
  user: MyProfile.User;
};

export const ProfileUI: React.FC<Props> = props => {
  return (
    <>
      <PageTitle>
        <Trans i18nKey="profile.title">My Profile</Trans>
      </PageTitle>

      <Section>
        <AvatarCard />
        <Typography>
          Hello {props.user.firstName} {props.user.lastName}
        </Typography>
      </Section>
    </>
  );
};
