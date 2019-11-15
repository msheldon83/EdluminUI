import { makeStyles, useTheme } from "@material-ui/styles";
import { Divider } from "@material-ui/core";
import { useScreenSize } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Filters } from "./filters/index";

type Props = {};

export const SubHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";

  return (
    <>
      <Section>
        <SectionHeader title={t("Upcoming work")} />
        <Grid container>
          <Grid item xs={12} sm={6} lg={6}>
            {"Schedule goes here"}
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            {"Calendar goes here"}
          </Grid>
        </Grid>
      </Section>
      <Section>
        <SectionHeader title={t("Available jobs")} />
        <Filters />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
