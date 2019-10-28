import * as React from "react";
import { mockProvider } from "test-helpers/mock-provider";
import { PeoplePage } from ".";

export default {
  title: "Pages/People",
};

export const PeopleList = () => {
  const Provider = mockProvider({
    mocks: {
      Query: () => ({
        orgUser: () => ({
          paged: () => ({
            totalCount: 3,
            results: [
              {
                id: "100",
                firstName: "Jane",
                lastName: "Edwards",
              },
              {
                id: "101",
                firstName: "John",
                lastName: "Doe",
              },
              {
                id: "102",
                firstName: "Melanie",
                lastName: "Persons",
              },
              {
                id: "104",
                firstName: "Angela",
                lastName: "Forence",
              },
            ],
          }),
        }),
      }),
    },
  });

  return (
    <Provider>
      <PeoplePage />
    </Provider>
  );
};
PeopleList.story = {
  name: "List View",
};
