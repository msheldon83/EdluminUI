import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { makeStyles } from "@material-ui/core";
import { useState } from "react";
import { DateTabs } from "./components/tabs";

type Props = {
  showVerified: boolean;
  locationsFilter: number[];
};

export const VerifyUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  // TODO Get these values from a query
  const dateTabOptions = [
    { dateLabel: "Today", count: 5 },
    { dateLabel: "Older", count: 56 },
  ];
  const [selectedDateTab, setSelectedDateTab] = useState<string>("Today");

  return (
    <>
      <Section>
        <DateTabs
          selectedDateTab={selectedDateTab}
          setSelectedDateTab={setSelectedDateTab}
          dateOptions={dateTabOptions}
        />
      </Section>
    </>
  );
};

export const useStyles = makeStyles(theme => ({}));
