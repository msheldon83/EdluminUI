import * as React from "react";
import { Tab, Tabs, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

type Props = {
  selectedDateTab: Date;
  dateTabOptions: { date: Date; dateLabel: string; count: number }[];
  setSelectedDateTab: React.Dispatch<React.SetStateAction<Date>>;
};

export const DateTabs: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const updateDateTab = (
    event: React.ChangeEvent<{}>,
    newSelectedDate: Date
  ) => {
    props.setSelectedDateTab(newSelectedDate);
  };

  return (
    <>
      <Tabs
        value={props.selectedDateTab}
        indicatorColor="primary"
        textColor="primary"
        onChange={updateDateTab}
        aria-label="date-selector"
        className={classes.tabs}
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
              value={dateOption.date}
              className={classes.tab}
            />
          );
        })}
      </Tabs>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  tabs: {
    backgroundColor: theme.customColors.white,
    border: `1px solid ${theme.customColors.sectionBorder}`,
  },
  tab: {
    textTransform: "uppercase",
    fontWeight: "bold",
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
}));
