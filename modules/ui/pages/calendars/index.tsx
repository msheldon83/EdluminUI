import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { useRouteParams } from "ui/routes/definition";
import { CalendarRoute } from "ui/routes/calendar/calendar";
import { Section } from "ui/components/section";
import { useAllSchoolYears } from "reference-data/school-years";
import { useContracts } from "reference-data/contracts";
import { ContractScheduleHeader } from "ui/components/schedule/contract-schedule-header";

type Props = {
  view: "list" | "calendar";
};

export const Calendars: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(CalendarRoute);
  const classes = useStyles();

  const schoolYears = useAllSchoolYears(params.organizationId);
  const contracts = useContracts(params.organizationId);

  /*TODO Get all Calendar Events initally for All Contracts : maybe this is done on a list component*/

  /*TODO Need a way to update calendar events based on contract selected : maybe this is done on a list component*/

  /*TODO Need a way to delete a calendar event*/

  /*TODO Need a way to add a calendar event*/

  /*TODO This page will store dates selected and schools years, and include a calendar cmpt and list cmpt */

  return (
    <>
      <div className={classes.pageContainer}>
        <Section className={classes.section}>
          <div className={classes.itemContainer}>
            <div className={classes.item}>
              <ContractScheduleHeader view={props.view} />
            </div>
          </div>
        </Section>
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  pageContainer: {
    display: "block",
    overflowY: "scroll",
    height: "100vh",
    position: "fixed",
    paddingRight: theme.spacing(3),
  },
  section: { padding: 0 },
  header: { paddingBottom: theme.spacing(3) },
  itemContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${theme.typography.pxToRem(14)} ${theme.typography.pxToRem(24)}`,
  },
  item: {
    display: "flex",
    alignItems: "center",
  },
  viewContainer: {
    padding: `0 ${theme.typography.pxToRem(24)} ${theme.typography.pxToRem(
      18
    )}`,
  },
  sticky: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: theme.customColors.appBackgroundGray,
    boxShadow: `0 ${theme.typography.pxToRem(32)} ${theme.typography.pxToRem(
      16
    )} -${theme.typography.pxToRem(13)} ${
      theme.customColors.appBackgroundGray
    }`,
  },
  assignments: {
    padding: theme.spacing(1),
  },
}));
