import * as React from "react";
import { Assignment } from "./assignment";
import { makeStyles } from "@material-ui/core/styles";
import {
  VacancyDetail,
  VacancyDetailVerifyInput,
} from "graphql/server-types.gen";

export default {
  title: "Pages/Verify/Assignment",
};

export const AssignmentStory = () => {
  const [selectedVacancyDetail, setSelectedVacancyDetail] = React.useState<
    string | undefined
  >(undefined);
  const onVerify = async (vacancyDetail: VacancyDetailVerifyInput) => {};

  const classes = useStyles();
  return (
    <div className={classes.container}>
      <Assignment
        vacancyDetail={simpleAssignment}
        shadeRow={false}
        onVerify={onVerify}
        selectedVacancyDetail={selectedVacancyDetail}
        setSelectedVacancyDetail={setSelectedVacancyDetail}
        payCodeOptions={payCodeOptions}
      />
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
  orgId: 1038,
  startTimeLocal: "2019-11-20T08:00",
  endTimeLocal: "2019-11-20T15:00",
  dayPortion: 1.0,
  assignment: {
    id: "123456789",
    startTimeLocal: "2019-11-20T08:00",
    endTimeLocal: "2019-11-20T15:00",
    employee: {
      firstName: "Jane",
      lastName: "Teacher",
    },
  },
  payCode: {
    id: "1234567",
    name: "Regular Sub Rate",
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
      id: "98765",
      employee: {
        firstName: "Joe",
        lastName: "Schmoe",
      },
      details: [
        {
          id: "12345",
          startDate: "2019-11-20",
          startTimeLocal: "2019-11-20T08:00",
          endTimeLocal: "2019-11-20T15:00",
          dayPortion: 1.0,
        },
      ],
    },
    position: {
      name: "Kindergarten",
    },
    notesToReplacement: "These are notes for the substitute.",
  },
} as unknown) as Pick<
  VacancyDetail,
  | "id"
  | "orgId"
  | "startTimeLocal"
  | "startDate"
  | "endTimeLocal"
  | "assignment"
  | "payCode"
  | "location"
  | "vacancy"
  | "dayPortion"
  | "accountingCodeAllocations"
  | "verifyComments"
  | "verifiedAtLocal"
  | "payDurationOverride"
  | "actualDuration"
>;

const payCodeOptions = [
  { label: "Option 1", value: "12" },
  { label: "Option 2", value: "13" },
];
