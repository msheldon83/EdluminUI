import { DocumentNode } from "graphql";

export type GraphqlBundle<TResult, TVars> = {
  _variables: TVars;
  _result: TResult;
  Document: DocumentNode;
};

export const customGraphqlErrorMessages = {
  JobAlreadyClaimed: "The job has already been filled.",
  SubstituteNoLongerAvailable: "Substitute is no longer available.",
};

export class CustomGraphqlError extends Error {
  constructor(errorKey: keyof typeof customGraphqlErrorMessages) {
    super(customGraphqlErrorMessages[errorKey]);
  }
}

// export class EditAbsenceError extends Error {
//   type: EditAbsenceErrorType;

//   constructor(message: string, type: EditAbsenceErrorType) {
//     super(message);
//     this.type = type;
//   }
// }

export type PickRequired<T, Y extends keyof Partial<T>> = Pick<Required<T>, Y>;

export type RequiredExcept<T, Y extends keyof Partial<T>> = Pick<
  Required<T>,
  Exclude<keyof T, Y>
>;
