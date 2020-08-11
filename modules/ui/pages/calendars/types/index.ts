import Maybe from "graphql/tsutils/Maybe";
import {
  Contract,
  CalendarChangeReason,
  CalendarChange,
  Location,
} from "graphql/server-types.gen";

export type CalendarEvent = {
  id?: Maybe<string>;
  rowVersion?: Maybe<string>;
  description?: Maybe<string>;
  startDate: Maybe<string>;
  endDate: Maybe<string>;
  calendarChangeReasonId?: Maybe<string>;
  affectsAllContracts?: Maybe<boolean>;
  affectsAllLocations?: Maybe<boolean>;
  contractIds?: Maybe<Array<Maybe<string>>>;
  changedContracts?: Maybe<Array<Maybe<Contract>>>;
  locationIds?: Maybe<Array<Maybe<string>>>;
  calendarChangeReason?: Maybe<CalendarChangeReason>;
};

export type CalendarChangeDate = {
  date: Date;
  isClosed: boolean;
  isModified: boolean;
  isInservice: boolean;
};

export const CalendarChangeToCalendarEvent = (
  calendarChange: Pick<
    CalendarChange,
    | "id"
    | "rowVersion"
    | "description"
    | "startDate"
    | "endDate"
    | "calendarChangeReasonId"
    | "affectsAllContracts"
    | "affectsAllLocations"
    | "changedContracts"
    | "locationIds"
    | "calendarChangeReason"
  >
) => {
  const calendarEvent: CalendarEvent = {
    id: calendarChange.id,
    rowVersion: calendarChange.rowVersion,
    description: calendarChange.description,
    startDate: calendarChange.startDate,
    endDate: calendarChange.endDate,
    calendarChangeReasonId: calendarChange.calendarChangeReasonId,
    affectsAllContracts: calendarChange.affectsAllContracts,
    affectsAllLocations: calendarChange.affectsAllLocations,
    contractIds: calendarChange.changedContracts?.map(c => c?.id),
    changedContracts: calendarChange.changedContracts,
    locationIds: calendarChange.locationIds,
    calendarChangeReason: calendarChange.calendarChangeReason,
  };
  return calendarEvent;
};
