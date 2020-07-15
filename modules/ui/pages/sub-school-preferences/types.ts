import { Lens } from "@atomic-object/lenses";

export type School = {
  id: string;
  name: string;
  status: "favorite" | "hidden" | "default";
};

export namespace School {
  export const status = Lens.from<School>().prop("status");
}

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
  schoolGroups: SchoolGroup[];
};

export namespace District {
  export const schoolGroups = Lens.from<District>().prop("schoolGroups");
}
