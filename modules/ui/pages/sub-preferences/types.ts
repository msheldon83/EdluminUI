export type OrgInfo = {
  orgId: string;
  orgName: string;
  orgUserId: string;
};

export type School = {
  id: string;
  name: string;
  preference: "favorite" | "hidden" | "default";
};

export type SchoolGroup = {
  id: string;
  name: string;
  schools: School[];
};

export type District = {
  id: string;
  name: string;
  orgUserId: string;
  schoolGroups: SchoolGroup[];
};
