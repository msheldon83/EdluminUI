import { Grid, Button, Typography, Divider } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/styles";
import { useScreenSize } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Filters } from "./filters/index";
import { AvailableJob } from "./components/available-job";
import { FilterList } from "@material-ui/icons";
import { useQueryBundle } from "graphql/hooks";
import { GetAllVacancies } from "./graphql/get-all-vacancies.gen";
import { Vacancy } from "graphql/server-types.gen";

type Props = {};

export const SubHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const [showFilters, setShowFilters] = React.useState(!isMobile);

  const getVacancies = useQueryBundle(GetAllVacancies, {
    variables: {},
  });

  const vacancies = (getVacancies.state === "LOADING" ||
  getVacancies.state === "UPDATING"
    ? []
    : getVacancies.data?.vacancy?.all ?? []) as Pick<
    Vacancy,
    | "id"
    | "organization"
    | "position"
    | "absence"
    | "startTimeLocal"
    | "endTimeLocal"
    | "startDate"
    | "endDate"
    | "notesToReplacement"
    | "totalDayPortion"
    | "details"
  >[];

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
        <Grid
          container
          className={classes.header}
          justify="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h5">{t("Available Jobs")}</Typography>
          </Grid>
          {isMobile && (
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {t("Filters")}
              </Button>
            </Grid>
          )}
        </Grid>
        {showFilters && <Filters />}
        <div>
          <Divider className={classes.header} />
          {getVacancies.state === "LOADING" ? (
            <Grid item>
              <Typography variant="h5">
                {t("Loading Available Jobs")}
              </Typography>
            </Grid>
          ) : vacancies.length === 0 ? (
            <Grid item>
              <Typography variant="h5">{t("No Jobs Available")}</Typography>
            </Grid>
          ) : (
            vacancies.map((vacancy, index) => (
              <AvailableJob
                vacancy={vacancy}
                shadeRow={false}
                shadeRow={index % 2 != 0}
                key={index}
              />
            ))
          )}
        </div>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
}));
