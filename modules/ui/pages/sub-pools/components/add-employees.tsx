import * as React from "react";
import { makeStyles, useTheme } from "@material-ui/styles";
import { Typography, Grid } from "@material-ui/core";
import { Section } from "ui/components/section";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  title: string;
  peopleList?: { id: string; name: string }[];
  onAdd?: (data: any) => Promise<void>;
  onBlock?: (data: any) => Promise<void>;
  positionTypes: string[];
};

// Used for Sub Pool & Sub Preference Edit Pages
export const AddEmployees: React.FC<Props> = props => {
  const { t } = useTranslation();
  const theme = useTheme();
  const classes = useStyles();

  return (
    <>
      <Section>
        <SectionHeader title={t(props.title)} />
        <Grid container item spacing={2} xs={12}>
          <Grid item xs={12} sm={6} lg={6}>
            {/* {props.qualifiedPositionTypes?.length === 0 ? (
                <div>{t("Not defined")}</div>
              ) : (
                props.qualifiedPositionTypes?.map((n, i) => (
                  <div key={i}>{n?.name}</div>
                ))
              )} */}
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
