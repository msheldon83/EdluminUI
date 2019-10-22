import { defineRoute, defineSubRoute } from "./definition";

describe("defineRoute and defineSubRoute", () => {
  it("gracefully handles slashes", () => {
    const parentA = defineRoute("///:orgId/", ["orgId"]);
    const childA = defineSubRoute(parentA, "//stuff");
    expect(parentA.path).toEqual("/:orgId");
    expect(childA.path).toEqual("/:orgId/stuff");

    const parentB = defineRoute(":thingId", ["thingId"]);
    const childB = defineSubRoute(parentB, "edit");
    expect(parentB.path).toEqual("/:thingId");
    expect(childB.path).toEqual("/:thingId/edit");
  });
});
