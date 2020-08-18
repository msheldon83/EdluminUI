import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Button, Grid, Typography, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { useMyUserAccess } from "reference-data/my-user-access";
import { useIsMobile } from "hooks";
import { ContentFooter } from "ui/components/content-footer";
import { SubPreferencesEditRoute } from "ui/routes/sub-preferences";
import { SubPreferences } from "ui/components/substitutes/preferences/view";
import { OrgUser } from "graphql/server-types.gen";
import { OrgInfo } from "ui/components/substitutes/preferences/types";

type Props = {};

export const SubPreferencesPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const user = useMyUserAccess()?.me?.user;
  if (!user) {
    return <></>;
  }
  const userId = user.id;
  const orgInfo: OrgInfo[] = (
    user.orgUsers?.filter(
      (ou): ou is OrgUser => ou?.isReplacementEmployee ?? false
    ) ?? []
  ).map(ou => ({
    orgId: ou.organization.id,
    orgName: ou.organization.name,
    orgUserId: ou.id,
  }));

  const EditButton = (
    <Button
      variant="contained"
      className={classes.editButton}
      onClick={() => history.push(SubPreferencesEditRoute.generate({}))}
    >
      {t("Edit")}
    </Button>
  );

  return (
    <>
      <Grid
        container
        justify="space-between"
        className={isMobile ? classes.mobileHeader : classes.header}
      >
        <Typography variant="h1">{t("School Preferences")}</Typography>
        {!isMobile && EditButton}
      </Grid>
      <Section className={isMobile ? classes.mobileSection : undefined}>
        <SubPreferences userId={userId} orgInfo={orgInfo} />
      </Section>
      {isMobile && (
        <ContentFooter>
          <Grid container justify="flex-end">
            {EditButton}
          </Grid>
        </ContentFooter>
      )}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  editButton: {
    backgroundColor: theme.customColors.edluminSlate,
    width: theme.spacing(10),
    height: theme.spacing(5.5),
    marginRight: theme.spacing(3.25),
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  mobileHeader: {
    marginBottom: theme.spacing(2),
  },
  mobileSection: {
    margin: 0,
  },
}));
