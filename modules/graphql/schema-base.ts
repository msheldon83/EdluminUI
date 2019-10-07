import { Query, Mutation } from "./server-types.gen";

// import { Query, Mutation } from "client/graphql/types.gen";

export const rawSchema = require("./server-schema.graphql");

/** Shape of high level schema types. Used to type check mock apollo client arguments */
export interface SchemaMap {
  Query: Query;
  Mutation: Mutation;
}
