import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles } from "@material-ui/core";
import { Input } from "ui/components/form/input";
import { useIsMobile } from "hooks";

type Props = {
  search: string;
  setSearch: (id: string) => void;
};

export const Filters: React.FC<Props> = ({ search, setSearch }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <Grid container>
      <Grid item xs={isMobile ? 12 : 3} className={classes.filter}>
        <Input
          label={t("Schools")}
          placeholder={t("Search")}
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  filter: {
    padding: theme.spacing(3),
    paddingLeft: 0,
  },
}));
