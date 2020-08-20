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
  affectsAllLocations?: Maybe<boolean>;
  changedContracts?: Maybe<Array<Maybe<Contract>>>;
  locationIds?: Maybe<Array<Maybe<string>>>;
  contractIds?: Maybe<Array<Maybe<string>>>;
  calendarChangeReason?: Maybe<CalendarChangeReason>;
};

export type CalendarChangeDate = {
  date: Date;
  isClosed: boolean;
  isModified: boolean;
  isInservice: boolean;
};
