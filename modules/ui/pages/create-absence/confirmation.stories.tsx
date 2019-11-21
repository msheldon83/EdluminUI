import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";
import { Confirmation } from "./confirmation";
import {
  VacancyDetail,
  Maybe,
  AbsenceDetail,
  AbsenceReasonUsage,
  Vacancy,
} from "graphql/server-types.gen";

export default {
  title: "Pages/Create Absence/Confirmation",
};

const vacancies = [
  {
    startTimeLocal: new Date("11/1/2019 08:00 AM"),
    endTimeLocal: new Date("11/3/2019 05:00 PM"),
    numDays: 3,
    positionId: 1,
    details: [
      {
        startTimeLocal: new Date("11/1/2019 07:00 AM"),
        endTimeLocal: new Date("11/1/2019 09:00 AM"),
        locationId: 1,
        location: {
          name: "Evans Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/1/2019 09:00 AM"),
        endTimeLocal: new Date("11/1/2019 12:00 PM"),
        locationId: 2,
        location: {
          name: "Brook Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/1/2019 01:00 PM"),
        endTimeLocal: new Date("11/1/2019 05:00 PM"),
        locationId: 3,
        location: {
          name: "Haven Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/2/2019 07:00 AM"),
        endTimeLocal: new Date("11/2/2019 09:00 AM"),
        locationId: 1,
        location: {
          name: "Evans Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/2/2019 09:00 AM"),
        endTimeLocal: new Date("11/2/2019 12:00 PM"),
        locationId: 2,
        location: {
          name: "Brook Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/2/2019 01:00 PM"),
        endTimeLocal: new Date("11/2/2019 05:00 PM"),
        locationId: 3,
        location: {
          name: "Haven Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/3/2019 07:00 AM"),
        endTimeLocal: new Date("11/3/2019 09:00 AM"),
        locationId: 1,
        location: {
          name: "Evans Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/3/2019 09:00 AM"),
        endTimeLocal: new Date("11/3/2019 12:00 PM"),
        locationId: 2,
        location: {
          name: "Brook Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/3/2019 01:00 PM"),
        endTimeLocal: new Date("11/3/2019 05:00 PM"),
        locationId: 3,
        location: {
          name: "Haven Elementary School",
        },
      },
    ] as Maybe<VacancyDetail[]>,
  },
  {
    startTimeLocal: new Date("11/6/2019 08:00 AM"),
    endTimeLocal: new Date("11/7/2019 05:00 PM"),
    numDays: 2,
    positionId: 1,
    details: [
      {
        startTimeLocal: new Date("11/6/2019 07:00 AM"),
        endTimeLocal: new Date("11/6/2019 09:00 AM"),
        locationId: 1,
        location: {
          name: "Evans Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/6/2019 09:00 AM"),
        endTimeLocal: new Date("11/6/2019 12:00 PM"),
        locationId: 2,
        location: {
          name: "Brook Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/6/2019 01:00 PM"),
        endTimeLocal: new Date("11/6/2019 05:00 PM"),
        locationId: 3,
        location: {
          name: "Haven Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/7/2019 07:00 AM"),
        endTimeLocal: new Date("11/7/2019 09:00 AM"),
        locationId: 1,
        location: {
          name: "Evans Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/7/2019 09:00 AM"),
        endTimeLocal: new Date("11/7/2019 12:00 PM"),
        locationId: 2,
        location: {
          name: "Brook Elementary School",
        },
      },
      {
        startTimeLocal: new Date("11/7/2019 01:00 PM"),
        endTimeLocal: new Date("11/7/2019 05:00 PM"),
        locationId: 3,
        location: {
          name: "Haven Elementary School",
        },
      },
    ] as Maybe<VacancyDetail[]>,
  },
];

const allAbsenceReasons = [
  {
    id: "1",
    name: "Vacation",
  },
  {
    id: "2",
    name: "Illness",
  },
];

const notesToApprover =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore";
const notesToSubstitute =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

export const AsAdminWithAllInformation = () => {
  const path = AdminCreateAbsenceRoute.generate({
    organizationId: "1006",
    employeeId: "123",
  });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {
      Query: () => ({
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
      }),
    },
  });

  return (
    <Provider>
      <Confirmation
        orgId={"1000"}
        absence={{
          id: "123456789",
          numDays: 10,
          employeeId: 1125,
          notesToApprover: notesToApprover,
          details: [
            {
              reasonUsages: [
                {
                  absenceReasonId: "1",
                } as any,
              ] as Maybe<AbsenceReasonUsage[]>,
            },
          ] as Maybe<AbsenceDetail[]>,
        }}
        vacancies={vacancies as Vacancy[]}
        needsReplacement={true}
        notesToSubstitute={notesToSubstitute}
        preAssignedReplacementEmployeeName={"Luke Skywalker"}
        setStep={() => {}}
      />
    </Provider>
  );
};

export const AsAdminWithMinimumInformation = () => {
  const path = AdminCreateAbsenceRoute.generate({
    organizationId: "1006",
    employeeId: "123",
  });
  const Provider = mockProvider({
    initialUrl: path,
    mocks: {
      Query: () => ({
        orgRef_AbsenceReason: () => ({
          all: () => allAbsenceReasons,
        }),
      }),
    },
  });

  return (
    <Provider>
      <Confirmation
        orgId={"1000"}
        absence={{
          id: "123456789",
          numDays: 10,
          employeeId: 1125,
          notesToApprover: null,
          details: [
            {
              reasonUsages: [
                {
                  absenceReasonId: "2",
                } as any,
              ] as Maybe<AbsenceReasonUsage[]>,
            },
          ] as Maybe<AbsenceDetail[]>,
        }}
        needsReplacement={false}
        setStep={() => {}}
      />
    </Provider>
  );
};
