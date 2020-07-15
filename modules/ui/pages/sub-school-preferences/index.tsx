import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Button, Grid, makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { PageTitle } from "ui/components/page-title";
import { useMyUserAccess } from "reference-data/my-user-access";
import { SubSchoolPreferencesEditRoute } from "ui/routes/sub-school-preferences";
import { SubSchoolPreferencesUI } from "./ui";

type Props = {};

export const SubSchoolPreferencesPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();

  const userAccess = useMyUserAccess();
  const userId = userAccess?.me?.user?.id;

  if (!userId) {
    return <></>;
  }

  return (
    <>
      <Grid container justify="space-between">
        <PageTitle title={t("School Preferences")} />
        <Button
          variant="contained"
          className={classes.editButton}
          onClick={() =>
            history.push(SubSchoolPreferencesEditRoute.generate({}))
          }
        >
          {t("Edit")}
        </Button>
      </Grid>
      <Section>
        <SubSchoolPreferencesUI userId={userId} />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  editButton: {
    backgroundColor: theme.customColors.edluminSlate,
    width: theme.spacing(10),
    height: theme.spacing(5.5),
  },
}));
