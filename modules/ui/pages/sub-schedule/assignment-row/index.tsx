import * as React from "react";
import { DayPart } from "graphql/server-types.gen";
import { makeStyles } from "@material-ui/styles";
import { Grid, Button, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { AssignmentRowUI } from "./assignment-row-ui";
import { VacancyDetail } from "ui/pages/create-absence/types";
import * as DateFns from "date-fns";

// Mirrors gql type
type AssignmentDetails = {
  id?: string;
  assignment: {
    id: string;
  } | null;
  startDate?: string;
  endDate?: string;
  startTimeLocal?: string;
  endTimeLocal?: string;
  dayPortion: number;
  location: {
    name?: string;
  } | null;
  vacancy: {
    organization: { name?: string };
    position: {
      name?: string;
    } | null;
    absence: {
      employee: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  } | null;
};

type Props = {
  assignment: AssignmentDetails;
  onCancel: () => void;
  className?: string;
};

export const AssignmentRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const a = props.assignment;

  const employeeName = `${a.vacancy?.absence?.employee?.firstName} ${a.vacancy?.absence?.employee?.lastName}`;

  return (
    <AssignmentRowUI
      {...props}
      confirmationNumber={a.assignment?.id || ""}
      startTime={a.startTimeLocal || ""}
      endTime={a.endTimeLocal || ""}
      employeeName={employeeName}
      startDate={a.startDate || ""}
      endDate={a.endDate || ""}
      locationName={a?.location?.name || ""}
      organizationName={a?.vacancy?.organization?.name}
      positionName={a?.vacancy?.position?.name || ""}
      dayPortion={a.dayPortion}
    />
  );
};

const useStyles = makeStyles(theme => ({}));
