import {
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { Section } from "ui/components/section";
import { useQueryParams } from "hooks/query-params";

type Props = { className?: string };

export const PeopleFilters: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [value, setValue] = React.useState(2);

  const [queryParams, updateQueryParams] = useQueryParams(["active"]);

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper square className={props.className}>
      <Tabs
        value={value}
        indicatorColor="primary"
        textColor="primary"
        onChange={handleChange}
        aria-label="people-role-filters"
      >
        <Tab label={t("All")} className={classes.tab} />
        <Tab label={t("Employees")} className={classes.tab} />
        <Tab label={t("Substitutes")} className={classes.tab} />
        <Tab label={t("Admins")} className={classes.tab} />
      </Tabs>

      <Section>
        <Grid container>
          <Grid item container md={3}>
            <InputLabel>{t("Name")}</InputLabel>
            <TextField
              variant="outlined"
              name={"name"}
              placeholder={t("Search for first or last name")}
              fullWidth
            />
          </Grid>
          <Grid item container md={3}>
            {/* position type */}
          </Grid>
          <Grid item container md={3}>
            {/* locations */}
          </Grid>

          <Grid item container md={3}>
            <InputLabel>{t("Status")}</InputLabel>
            <Grid item container>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      queryParams.active !== null &&
                      queryParams.active === "true" // This will not do
                    }
                    // onChange={updateQueryParams({
                    //   active: "true",
                    //   ...queryParams,
                    // })}
                    value=""
                  />
                }
                label={t("Active")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      queryParams.active === null ||
                      queryParams.active !== "true"
                    }
                    // onChange={updateQueryParams({
                    //   active: "false",
                    //   ...queryParams,
                    // })}
                    value=""
                  />
                }
                label={t("Inactive")}
              />
            </Grid>
          </Grid>
        </Grid>
      </Section>
    </Paper>
  );
};

const useStyles = makeStyles(theme => ({
  tab: {
    textTransform: "uppercase",
  },
}));
