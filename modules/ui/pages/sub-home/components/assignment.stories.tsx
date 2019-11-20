import * as React from "react";
import { AssignmentCard } from "./assignment";
import { makeStyles } from "@material-ui/core/styles";
import { Assignment } from "graphql/server-types.gen";

export default {
  title: "Components/Assignment",
};

export const AssignmentStory = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <AssignmentCard assignment={simpleAssignment} shadeRow={false} />
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
} as unknown) as Pick<Assignment, "id" | "startTimeLocal" | "endTimeLocal">;
