import Maybe from "graphql/tsutils/Maybe";
import { Contract, CalendarChangeReason } from "graphql/server-types.gen";

export type CalendarEvent = {
  id?: Maybe<string>;
  rowVersion?: Maybe<string>;
  description?: Maybe<string>;
  startDate: Maybe<string>;
  endDate: Maybe<string>;
  calendarChangeReasonId?: Maybe<string>;
  affectsAllContracts?: Maybe<boolean>;
  contractIds?: Maybe<Array<Maybe<string>>>;
  changedContracts?: Maybe<Array<Maybe<Contract>>>;
  calendarChangeReason?: Maybe<CalendarChangeReason>;
};
