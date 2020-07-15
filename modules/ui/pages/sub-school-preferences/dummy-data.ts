import { District } from "./types";

export const dummyDistricts: District[] = [
  {
    id: "1",
    name: "District 1",
    schoolGroups: [
      {
        id: "1",
        name: "Elementary Schools",
        schools: [
          {
            id: "1000",
            name: "ABC Elementary",
            status: "favorite",
          },
          {
            id: "1001",
            name: "First Elementary School",
            status: "default",
          },
          {
            id: "1002",
            name: "Second Elementary School",
            status: "default",
          },
        ],
      },
      {
        id: "2",
        name: "Middle Schools",
        schools: [
          {
            id: "1003",
            name: "ABC Middle",
            status: "favorite",
          },
          {
            id: "1004",
            name: "First Middle School",
            status: "default",
          },
          {
            id: "1005",
            name: "Second Middle School",
            status: "default",
          },
        ],
      },
      {
        id: "3",
        name: "High Schools",
        schools: [
          {
            id: "1006",
            name: "ABC High",
            status: "default",
          },
          {
            id: "1007",
            name: "First High School",
            status: "hidden",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "District 2",
    schoolGroups: [
      {
        id: "10",
        name: "Elementary Schools",
        schools: [
          {
            id: "10000",
            name: "ABC Elementary 2",
            status: "favorite",
          },
          {
            id: "10010",
            name: "First Elementary School 2",
            status: "default",
          },
          {
            id: "10020",
            name: "Second Elementary School 2",
            status: "default",
          },
        ],
      },
      {
        id: "20",
        name: "Middle Schools",
        schools: [
          {
            id: "10030",
            name: "ABC Middle 2",
            status: "favorite",
          },
          {
            id: "10040",
            name: "First Middle School 2",
            status: "default",
          },
          {
            id: "10050",
            name: "Second Middle School 2",
            status: "default",
          },
        ],
      },
      {
        id: "30",
        name: "High Schools",
        schools: [
          {
            id: "10060",
            name: "ABC High 2",
            status: "default",
          },
          {
            id: "10070",
            name: "First High School 2",
            status: "default",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "District 3",
    schoolGroups: [
      {
        id: "100",
        name: "Elementary Schools",
        schools: [
          {
            id: "1000",
            name: "ABC Elementary 3",
            status: "hidden",
          },
          {
            id: "100100",
            name: "First Elementary School 3",
            status: "default",
          },
          {
            id: "100200",
            name: "Second Elementary School 3",
            status: "hidden",
          },
        ],
      },
      {
        id: "200",
        name: "Middle Schools",
        schools: [
          {
            id: "100300",
            name: "ABC Middle 3",
            status: "hidden",
          },
          {
            id: "100400",
            name: "First Middle School 3",
            status: "default",
          },
          {
            id: "100500",
            name: "Second Middle School 3",
            status: "default",
          },
        ],
      },
      {
        id: "300",
        name: "High Schools",
        schools: [
          {
            id: "100600",
            name: "ABC High 3",
            status: "default",
          },
          {
            id: "100700",
            name: "First High School 3",
            status: "hidden",
          },
        ],
      },
    ],
  },
];
