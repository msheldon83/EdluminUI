import * as React from "react";
import { Tab, Tabs, makeStyles, Avatar } from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  dateOptions: { dateLabel: string; count: number }[];
  selectedDateTab: string;
  setSelectedDateTab: React.Dispatch<React.SetStateAction<string>>;
};

export const DateTabs: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const updateDateTab = (
    event: React.ChangeEvent<{}>,
    newSelectedDate: string
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
      >
        {props.dateOptions.map((dateOption, index: number) => (
          <Tab
            key={index}
            label={
              <div>
                {dateOption.dateLabel}
                <Avatar className={classes.tabLabel}>{dateOption.count}</Avatar>
              </div>
            }
            value={dateOption.dateLabel}
            className={classes.tab}
          />
        ))}
      </Tabs>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  tab: {
    textTransform: "uppercase",
  },
  tabLabel: {
    display: "inline",
    marginLeft: "5px",
  },
}));
