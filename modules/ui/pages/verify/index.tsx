import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  makeStyles,
} from "@material-ui/core";
import { OptionType, Select } from "ui/components/form/select";
import { useLocations } from "reference-data/locations";
import { useCallback, useMemo, useState } from "react";
import { Filters } from "./components/filters";
import { DateTabs } from "./components/tabs";

export const VerifyPage: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [showVerified, setShowVerified] = useState(false);
  const [locationsFilter, setLocationsFilter] = useState<number[]>([]);

  const dateTabOptions = [
    { dateLabel: "Today", count: 5 },
    { dateLabel: "Older", count: 56 },
  ];
  const today = useMemo(() => new Date(), []);
  const [selectedDateTab, setSelectedDateTab] = useState<string>("Today");

  return (
    <>
      <PageTitle title={t("Verify subsitute assignments")} />
      <Section>
        <Filters
          showVerified={showVerified}
          locationsFilter={locationsFilter}
          setShowVerified={setShowVerified}
          setLocationsFilter={setLocationsFilter}
        />
      </Section>
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
