import * as React from "react";
import { makeStyles, useTheme } from "@material-ui/styles";
import { Typography, Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { useTranslation } from "react-i18next";
import { Maybe, Employee } from "graphql/server-types.gen";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  title: string;
  peopleList?: Maybe<Pick<Employee, "id" | "firstName" | "lastName">>[] | null;
};

// Used for Sub Pool & Sub Preference Edit Pages
export const EmployeeList: React.FC<Props> = props => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();

  return (
    <>
      <Section>
        <SectionHeader title={t(props.title)} />
        <Grid container item spacing={2} xs={12}>
          <Grid item xs={12} sm={6} lg={6}>
            {props.peopleList?.length === 0 ? (
              <div>
                <b>{t("Not defined")}</b>
              </div>
            ) : (
              props.peopleList?.map((n, i) => (
                <div key={i}>
                  <b>{n?.firstName + " " + n?.lastName}</b>
                </div>
              ))
            )}
          </Grid>
        </Grid>
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
