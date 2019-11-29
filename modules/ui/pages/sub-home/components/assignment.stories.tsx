import * as React from "react";
import { AssignmentCard } from "./assignment";
import { makeStyles } from "@material-ui/core/styles";
import { VacancyDetail } from "graphql/server-types.gen";

export default {
  title: "Pages/Sub Home/Assignment",
};

export const AssignmentStory = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <AssignmentCard vacancyDetail={simpleAssignment} shadeRow={false} />
    </div>
  );
};

AssignmentStory.story = {
  name: "Simple Assignment",
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    width: "100%",
  },
}));

const simpleAssignment = ({
  id: "123456789",
  startTimeLocal: "2019-11-20T08:00",
  endTimeLocal: "2019-11-20T15:00",
  assignment: {
    id: "123456789",
    startTimeLocal: "2019-11-20T08:00",
    endTimeLocal: "2019-11-20T15:00",
  },
  location: {
    name: "Frank's school",
    address1: "77 Victoria Chase",
    city: "Pottstown",
    stateName: "PA",
    postalCode: "19465",
    phoneNumber: "6105551234",
  },
  vacancy: {
    absence: {
      employee: {
        firstName: "Joe",
        lastName: "Schmoe",
      },
    },
    position: {
      name: "Kindergarten",
    },
    notesToReplacement: "These are notes for the substitute.",
  },
} as unknown) as Pick<
  VacancyDetail,
  | "id"
  | "startTimeLocal"
  | "endTimeLocal"
  | "assignment"
  | "location"
  | "vacancy"
>;
