import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { Column } from "material-table";
import { EditableTable } from "ui/components/editable-table";
import { usePagedQueryBundle } from "graphql/hooks";
import { GetUnavilableTimeExceptions } from "../graphql/get-unavailable-exceptions.gen";
import { formatAvailabilityLabel } from "./helpers";
import {
  parseISO,
  format,
  addMonths,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  isSameYear,
  isBefore,
} from "date-fns";
import { getBeginningOfSchoolYear } from "ui/components/helpers";
import { numberOfMonthsInSchoolYear } from "ui/components/schedule/helpers";
import { compact } from "lodash-es";
import { useMemo, useState } from "react";
import { ScheduleHeader } from "ui/components/schedule/schedule-header";
import { useIsMobile } from "hooks";

type Props = {
  userId: string;
  onDelete: (exceptionId: string) => Promise<unknown>;
  userCreatedDate: Date;
};

export const ExceptionList: React.FC<Props> = props => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  const today = useMemo(() => new Date(), []);

  const beginningOfSchoolYear = useMemo(() => {
    return getBeginningOfSchoolYear(today);
  }, [today]);

  const endOfSchoolYear = useMemo(
    () =>
      endOfMonth(
        addMonths(beginningOfSchoolYear, numberOfMonthsInSchoolYear - 1)
      ),
    [beginningOfSchoolYear]
  );

  const [queryStartDate, setQueryStartDate] = useState(today);
  const [queryEndDate, setQueryEndDate] = useState(endOfSchoolYear);

  const [getExceptions, pagination] = usePagedQueryBundle(
    GetUnavilableTimeExceptions,
    r => r.user?.pagedUserUnavailableTime?.totalCount,
    {
      variables: {
        userId: props.userId,
        toDate: queryEndDate,
        fromDate: queryStartDate,
      },
    }
  );

  const resetPageWrapper: <T, S>(f: (t: T) => S) => (t: T) => S = f => t => {
    pagination.goToPage(1);
    return f(t);
  };

  const exceptions = useMemo(() => {
    if (
      getExceptions.state === "DONE" &&
      getExceptions.data.user?.pagedUserUnavailableTime?.results
    ) {
      return (
        compact(getExceptions.data.user?.pagedUserUnavailableTime?.results) ??
        []
      );
    }
    return [];
  }, [getExceptions]);

  const formatDates = (startDate: Date, endDate: Date) => {
    if (isSameDay(startDate, endDate)) {
      return format(startDate, "MMM d, yyyy");
    }
    if (isSameMonth(startDate, endDate)) {
      return `${format(startDate, "MMM d")} - ${format(endDate, "d, yyyy")}`;
    }
    if (isSameYear(startDate, endDate)) {
      return `${format(startDate, "MMM d")} - ${format(
        endDate,
        "MMM d, yyyy"
      )}`;
    }
    return `${format(startDate, "MMM d, yyyy")} - ${format(
      endDate,
      "MMM d, yyyy"
    )}`;
  };

  const columns: Column<GetUnavilableTimeExceptions.Results>[] = [
    {
      title: t("Dates"),
      sorting: false,
      render: o => formatDates(parseISO(o.startDate), parseISO(o.endDate)),
    },
    {
      title: t("Reason"),
      field: "description",
      sorting: false,
      hidden: isMobile,
    },
    {
      title: t("Availability"),
      sorting: false,
      render: o =>
        formatAvailabilityLabel(t, o.availabilityType, o.availableTime),
    },
  ];

  return (
    <>
      <Section>
        <ScheduleHeader
          view={"list"}
          today={today}
          beginningOfCurrentSchoolYear={beginningOfSchoolYear}
          endOfSchoolCurrentYear={endOfSchoolYear}
          startDate={queryStartDate}
          setStartDate={resetPageWrapper(setQueryStartDate)}
          setEndDate={resetPageWrapper(setQueryEndDate)}
          userCreatedDate={props.userCreatedDate}
        />
        <EditableTable
          columns={columns}
          data={exceptions}
          onRowDelete={{
            action: async oldData => {
              await props.onDelete(oldData.id);
            },
          }}
          deletableRows={v =>
            !isBefore(parseISO(v.endDate), addDays(today, -1))
          }
          pagination={pagination}
        />
      </Section>
    </>
  );
};
