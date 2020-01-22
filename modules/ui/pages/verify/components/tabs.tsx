import * as React from "react";
import { Tab, Tabs, makeStyles, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { VerifyRoute } from "ui/routes/absence-vacancy/verify";
import { useRouteParams } from "ui/routes/definition";
import { format, isEqual } from "date-fns";

type Props = {
  selectedDateTab: Date;
  dateTabOptions: DateTabOption[];
  setSelectedDateTab: React.Dispatch<React.SetStateAction<Date>>;
  showLinkToVerify?: boolean;
};

export type DateTabOption = {
  date: Date;
  dateLabel: string;
  count: number;
  onClick?: () => void;
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
    <div className={classes.container}>
      <div>
        <Tabs
          value={format(props.selectedDateTab, "P")}
          indicatorColor="primary"
          textColor="primary"
          onChange={updateDateTab}
          aria-label="date-selector"
        >
          {props.dateTabOptions.map((dateOption, index: number) => {
            const isActiveTab = isEqual(props.selectedDateTab, dateOption.date);
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
                onClick={
                  dateOption.onClick ? () => dateOption.onClick!() : undefined
                }
              />
            );
          })}
        </Tabs>
      </div>
      <div>
        {props.showLinkToVerify && (
          <Link
            to={VerifyRoute.generate(verifyRouteParams)}
            className={classes.verifyUiLink}
          >
            {t("Advanced view")}
          </Link>
        )}
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.customColors.white,
    border: `1px solid ${theme.customColors.sectionBorder}`,
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tab: {
    textTransform: "uppercase",
    fontWeight: "bold",
    minWidth: theme.typography.pxToRem(145),
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
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
