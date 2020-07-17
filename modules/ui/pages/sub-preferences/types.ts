import { Lens } from "@atomic-object/lenses";

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

export namespace SchoolGroup {
  export const schools = Lens.from<SchoolGroup>().prop("schools");
}

export type District = {
  id: string;
  name: string;
  orgUserId: string;
  schoolGroups: SchoolGroup[];
};

export namespace District {
  export const schoolGroups = Lens.from<District>().prop("schoolGroups");
}

export type Grouped<Element> = {
  favorites: Element[];
  hidden: Element[];
};
export type Grouping<Element> = (elements: Element[]) => Grouped<Element>;
