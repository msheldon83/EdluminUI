import * as React from "react";
import { Tab, Tabs, makeStyles, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { VerifyRoute } from "ui/routes/absence-vacancy/verify";
import { useRouteParams } from "ui/routes/definition";
import { format } from "date-fns";

type Props = {
  selectedDateTab: Date;
  dateTabOptions: { date: Date; dateLabel: string; count: number }[];
  setSelectedDateTab: React.Dispatch<React.SetStateAction<Date>>;
  showLinkToVerify?: boolean;
};

export const DateTabs: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const verifyRouteParams = useRouteParams(VerifyRoute);

  const updateDateTab = (
    event: React.ChangeEvent<{}>,
    newSelectedDate: string
  ) => {
    props.setSelectedDateTab(new Date(newSelectedDate));
  };

  return (
    <Grid
      container
      justify="space-between"
      alignItems="center"
      className={classes.container}
    >
      <Grid item>
        <Tabs
          value={format(props.selectedDateTab, "P")}
          indicatorColor="primary"
          textColor="primary"
          onChange={updateDateTab}
          aria-label="date-selector"
        >
          {props.dateTabOptions.map((dateOption, index: number) => {
            const isActiveTab = props.selectedDateTab === dateOption.date;
            return (
              <Tab
                key={index}
                label={
                  <div className={classes.tabLabel}>
                    {dateOption.dateLabel}
                    <div
                      className={clsx({
                        [classes.activeTabCount]: isActiveTab,
                        [classes.count]: true,
                      })}
                    >
                      {dateOption.count}
                    </div>
                  </div>
                }
                value={format(dateOption.date, "P")}
                className={classes.tab}
              />
            );
          })}
        </Tabs>
      </Grid>
      <Grid item>
        {props.showLinkToVerify && (
          <Link
            to={VerifyRoute.generate(verifyRouteParams)}
            className={classes.verifyUiLink}
          >
            {t("Advanced view")}
          </Link>
        )}
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.customColors.white,
    border: `1px solid ${theme.customColors.sectionBorder}`,
  },
  tab: {
    textTransform: "uppercase",
    fontWeight: "bold",
    minWidth: theme.typography.pxToRem(150),
  },
  tabLabel: {
    display: "flex",
    alignItems: "center",
  },
  activeTabCount: {
    backgroundColor: `${theme.palette.primary.main} !important`,
  },
  count: {
    marginLeft: theme.spacing(),
    borderRadius: "50%",
    width: theme.typography.pxToRem(28),
    height: theme.typography.pxToRem(28),
    paddingTop: theme.typography.pxToRem(2),
    backgroundColor: "#9E9E9E",
    color: theme.customColors.white,
    fontWeight: "bold",
  },
  verifyUiLink: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
}));
