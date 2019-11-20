import {
  Grid,
  Button,
  Typography,
  IconButton,
  makeStyles,
  Popper,
  Fade,
} from "@material-ui/core";
import { ReceiptOutlined } from "@material-ui/icons";
import * as React from "react";
import parseISO from "date-fns/parseISO";
import isTomorrow from "date-fns/isTomorrow";
import isToday from "date-fns/isTomorrow";
import format from "date-fns/format";
import { useTranslation } from "react-i18next";
import { AvailableJobDetail } from "./available-job-detail";
import { formatIsoDateIfPossible } from "helpers/date";
import { Assignment } from "graphql/server-types.gen";
import { Section } from "ui/components/section";

type Props = {
  assignment: Pick<Assignment, "id" | "startTimeLocal" | "endTimeLocal">;
  shadeRow: boolean;
};

export const AssignmentCard: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const assignment = props.assignment;

  const parsedDay = parseISO(assignment.startTimeLocal);
  const dayLabel = isToday(parsedDay)
    ? "Today"
    : isTomorrow(parsedDay)
    ? "Tomorrow"
    : format(parsedDay, "EEEE");

  return (
    <>
      <Section>
        <Grid
          container
          justify="space-between"
          alignItems="center"
          spacing={2}
          className={props.shadeRow ? classes.shadedRow : undefined}
        >
          <Grid item xs={6}>
            <Typography variant="h6">{`${dayLabel}, ${format(
              parsedDay,
              "MMMM d"
            )} (#${assignment.id})`}</Typography>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

export const useStyles = makeStyles(theme => ({
  root: {
    width: 500,
  },
  typography: {
    padding: theme.spacing(2),
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },

  lightText: {
    fontSize: theme.typography.fontSize,
  },
  locationText: {
    fontSize: theme.typography.fontSize + 4,
  },
  boldText: {
    fontSize: theme.typography.fontSize,
    fontWeight: "bold",
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },
}));
