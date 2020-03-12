import { VacancyDetail } from "graphql/server-types.gen";
import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { SubSchedule } from "../../../pages/sub-schedule";

export default {
  title: "Pages/Subtitute Schedule/Calendar view",
};

export const Page = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        userAccess: () => ({
          me: {
            user: {
              id: "1234",
              orgUsers: [
                {
                  id: "123",
                  userId: "24",
                  isReplacementEmployee: true,
                },
              ],
            },
          },
        }),
        user: () => ({
          byId: () => ({
            id: "123",
            userId: "23",
            createdUtc: "2019-11-27T18:10:34.7294627" as any,
          }),
        }),
        employee: () => ({
          employeeAssignmentSchedule: [
            {
              id: "1010",
              startDate: "2019-11-19" as any,
              endDate: "2019-11-19" as any,
              startTimeLocal: "2019-11-19T08:30:00" as any,
              endTimeLocal: "2019-11-19T13:00:00" as any,
              dayPortion: 0.5,
              assignment: {
                id: "100108",
                startTimeLocal: "2019-11-19T08:30:00",
                endTimeLocal: "2019-11-19T13:00:00",
                __typename: "Assignment",
              },
              location: {
                id: "1013",
                name: "Haven Elementary School",
                address1: "415 Eagleview Blvd",
                city: "Exton",
                stateName: null,
                postalCode: "19341",
                phoneNumber: null,
                __typename: "Location",
              },
              vacancy: {
                id: "100114",
                organization: {
                  id: "1038",
                  name: "Configured for Absence Create",
                  __typename: "Organization",
                },
                absence: {
                  id: "100125",
                  employee: {
                    id: "1137",
                    firstName: "Soledad",
                    lastName: "Feil",
                    __typename: "Employee",
                  },
                  __typename: "Absence",
                },
                position: {
                  id: "1057",
                  title: "Music Teacher",
                  __typename: "Position",
                },
                notesToReplacement:
                  "Notes for the substitute: I will leave lesson plans on my desk.",
                __typename: "BasicVacancy",
              },
              __typename: "VacancyDetail",
            } as VacancyDetail,
            {
              id: "1013",
              startDate: "2019-11-19" as any,
              endDate: "2019-11-19" as any,
              startTimeLocal: "2019-11-19T14:30:00" as any,
              endTimeLocal: "2019-11-19T16:00:00" as any,
              dayPortion: 0.5,
              assignment: {
                id: "100110",
                startTimeLocal: "2019-11-19T14:30:00",
                endTimeLocal: "2019-11-19T16:00:00",
                __typename: "Assignment",
              },
              location: {
                id: "1017",
                name: "Harbor View Elementary School",
                address1: "41 Lakeside Rd",
                city: "Exton",
                stateName: null,
                postalCode: "19341",
                phoneNumber: null,
                __typename: "Location",
              },
              vacancy: {
                id: "100114",
                organization: {
                  id: "1038",
                  name: "Configured for Absence Create",
                  __typename: "Organization",
                },
                absence: {
                  id: "100125",
                  employee: {
                    id: "1137",
                    firstName: "Soledad",
                    lastName: "Feil",
                    __typename: "Employee",
                  },
                  __typename: "Absence",
                },
                position: {
                  id: "1058",
                  title: "Music Teacher",
                  __typename: "Position",
                },
                notesToReplacement:
                  "Notes for the substitute: I will leave lesson plans on my desk.",
                __typename: "BasicVacancy",
              },
              __typename: "VacancyDetail",
            } as VacancyDetail,
          ],
        }),
      }),
    },
  });

  return (
    <Provider>
      <SubSchedule view="calendar" />
    </Provider>
  );
};

Page.story = {
  name: "Multiple on one day",
};
