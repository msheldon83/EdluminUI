import { makeStyles } from "@material-ui/styles";
import { formatIsoDateIfPossible } from "helpers/date";
import { groupBy } from "lodash-es";
import * as React from "react";
import { useState } from "react";
import { AssignmentVacancyDetails } from "../../../pages/sub-schedule/types";
import { AssignmentGroupDetail } from "./assignment-group-detail/index";
import { AssignmentRowUI } from "./assignment-row-ui";
import { CancelDialog } from "./cancel-dialog";
import { Typography } from "@material-ui/core";
import { ExpandOrCollapseIndicator } from "../expand-or-collapse-indicator";

type Props = {
  vacancyDetails: AssignmentVacancyDetails[];
  onCancel: (
    assignmentId: string,
    rowVersion: string,
    vacancyDetailIds?: string[]
  ) => void;
  className?: string;
  isAdmin: boolean;
  forSpecificAssignment?: boolean;
};

export const AssignmentGroup: React.FC<Props> = props => {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(
    props.forSpecificAssignment ?? false
  );
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);

  const onCancelClick = () => setIsCancelDialogOpen(true);
  const onCloseDialog = () => setIsCancelDialogOpen(false);

  const vacancyDetails = props.vacancyDetails;
  const { onCancel } = props;

  const onCancelAllMutation = React.useCallback(
    () =>
      onCancel(
        vacancyDetails[0].assignment?.id ?? "",
        vacancyDetails[0].assignment?.rowVersion ?? "",
        undefined
      ),
    [onCancel, vacancyDetails[0].assignment]
  );

  const vacancy =
    vacancyDetails[0].vacancy !== null && vacancyDetails[0].vacancy;
  if (!vacancy || !vacancyDetails[0].assignment) return <></>;

  const locationNames = [...new Set(vacancyDetails.map(a => a.location!.name))];
  const locationNameText =
    locationNames.length > 1
      ? `${locationNames[0]} +${locationNames.length - 1}`
      : locationNames[0];

  const orgNames = [
    ...new Set(vacancyDetails.map(a => a.vacancy!.organization.name)),
  ];
  const orgNameText =
    orgNames.length > 1
      ? `${orgNames[0]} +${orgNames.length - 1}`
      : orgNames[0];

  const confirmationNumber = vacancyDetails[0].assignment.id;
  const employeeName = `${vacancy.absence?.employee?.firstName} ${vacancy.absence?.employee?.lastName}`;
  const positionName = vacancy.position?.name ?? "";

  let totalDayPortion = 0;
  vacancyDetails.map(a => (totalDayPortion += a.dayPortion));

  const lastVacancyDetail = vacancyDetails[vacancyDetails.length - 1];
  const startDate = vacancyDetails[0].startDate!;

  /* the vacancy details come back from the server sorted by date,
  so this should be the latest date for the vacancy */
  const endDate = lastVacancyDetail.endDate!;

  const multipleStarts =
    Object.entries(
      groupBy(vacancyDetails, a =>
        formatIsoDateIfPossible(a.startTimeLocal, "h:mm aaa")
      )
    ).length > 1;
  const multipleEndTimes =
    Object.entries(
      groupBy(vacancyDetails, a =>
        formatIsoDateIfPossible(a.endTimeLocal, "h:mm aaa")
      )
    ).length > 1;
  const multipleTimes = multipleStarts && multipleEndTimes;

  const times = multipleTimes
    ? { multipleTimes }
    : {
        multipleTimes,
        endTime: vacancyDetails[0].endTimeLocal!,
      };

  return (
    <>
      <CancelDialog
        open={isCancelDialogOpen}
        onClose={onCloseDialog}
        onCancel={onCancelAllMutation}
      />

      <div
        className={classes.container}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <AssignmentRowUI
          confirmationNumber={confirmationNumber}
          {...times}
          startTime={vacancyDetails[0].startTimeLocal!}
          employeeName={employeeName}
          startDate={startDate}
          endDate={endDate}
          locationName={locationNameText || ""}
          organizationName={orgNameText}
          positionName={positionName}
          dayPortion={totalDayPortion}
          onCancel={onCancelClick}
          className={props.className}
          isAdmin={props.isAdmin}
          forSpecificAssignment={props.forSpecificAssignment}
        />
        {isExpanded && (
          <div className={classes.container}>
            {props.vacancyDetails.map((a, i) => (
              <AssignmentGroupDetail
                dayPortion={a.dayPortion}
                startTimeLocal={a.startTimeLocal ?? ""}
                endTimeLocal={a.endTimeLocal ?? ""}
                locationName={a.location?.name ?? ""}
                shadeRow={i % 2 != 0}
                key={i}
                onCancel={() =>
                  onCancel(
                    a.assignment?.id ?? "",
                    a.assignment?.rowVersion ?? "",
                    [a.id ?? ""]
                  )
                }
                isAdmin={props.isAdmin}
                forSpecificAssignment={props.forSpecificAssignment}
              />
            ))}
          </div>
        )}
        <ExpandOrCollapseIndicator isExpanded={isExpanded} />
      </div>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
  },
}));
