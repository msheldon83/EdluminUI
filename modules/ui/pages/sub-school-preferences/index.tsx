import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Button, Grid, Typography, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { PageTitle } from "ui/components/page-title";
import { useMyUserAccess } from "reference-data/my-user-access";
import { useIsMobile } from "hooks";
import { ContentFooter } from "ui/components/content-footer";
import { SubSchoolPreferencesEditRoute } from "ui/routes/sub-school-preferences";
import { SubSchoolPreferencesUI } from "./ui";

type Props = {};

export const SubSchoolPreferencesPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const userAccess = useMyUserAccess();
  const userId = userAccess?.me?.user?.id;

  if (!userId) {
    return <></>;
  }

  const EditButton = (
    <Button
      variant="contained"
      className={classes.editButton}
      onClick={() => history.push(SubSchoolPreferencesEditRoute.generate({}))}
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
      <Section>
        <SubSchoolPreferencesUI userId={userId} />
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
}));
