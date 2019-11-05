import * as jsc from "jsverify";
import { FilterParams, PeopleFilters } from "./filter-params";
import { isEqual } from "lodash-es";
import { OrgUserRole } from "graphql/server-types.gen";

describe("FilterParams isomorphism", () => {
  const listOfIds = jsc.array(jsc.nat).smap(
    nums => nums.map(n => n.toString()).join(","),
    str => str.split(",").map(s => Number(s))
  );

  const roleReplacementEmployee = jsc.record({
    roleFilter: jsc.constant(OrgUserRole.ReplacementEmployee),
    endorsements: listOfIds,
  });

  const roleEmployee = jsc.record({
    roleFilter: jsc.constant(OrgUserRole.Employee),
    locations: listOfIds,
    positionTypes: listOfIds,
  });

  const roleAdministrator = jsc.record({
    roleFilter: jsc.constant(OrgUserRole.Administrator),
    managesLocations: listOfIds,
    managesPositionTypes: listOfIds,
  });

  const roleSpecific = jsc.oneof([
    jsc.constant({ roleFilter: "" }),
    roleReplacementEmployee,
    roleEmployee,
    roleAdministrator,
  ]);

  const common = jsc.record({
    name: jsc.asciinestring,
    firstNameSort: jsc.elements(["", "asc", "desc"]),
    lastNameSort: jsc.elements(["", "asc", "desc"]),
    active: jsc.elements(["", "true", "false"]),
    endorsements: jsc.constant(""),
    positionTypes: jsc.constant(""),
    locations: jsc.constant(""),
    managesPositionTypes: jsc.constant(""),
    managesLocations: jsc.constant(""),
  });

  jsc.property(
    "A -> B -> A; both As are equal",
    common,
    roleSpecific,
    (c, r) => {
      const input = { ...c, ...r };
      const out = FilterParams.to(input);
      return isEqual(FilterParams.from(out), input);
    }
  );
});
