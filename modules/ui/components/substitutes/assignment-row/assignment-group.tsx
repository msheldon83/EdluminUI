import { makeStyles } from "@material-ui/styles";
import * as React from "react";
import { useState, useMemo } from "react";
import { AssignmentVacancyDetails } from "../../../pages/sub-schedule/types";
import { detailsHaveMultipleTimes } from "../assignment-details/helpers";
import { ExpandOrCollapseIndicator } from "../expand-or-collapse-indicator";
import { AssignmentGroupDetail } from "./assignment-group-detail/index";
import { AssignmentRowUI } from "./assignment-row-ui";
import { CancelDialog } from "./cancel-dialog";
import { useTranslation } from "react-i18next";

type Props = {
  vacancyDetails: AssignmentVacancyDetails[];
  onCancel: (
    assignmentId: string,
    rowVersion: string,
    vacancyDetailIds?: string[]
  ) => Promise<unknown>;
  className?: string;
  isAdmin: boolean;
  forSpecificAssignment?: boolean;
};

export const AssignmentGroup: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(
    props.forSpecificAssignment ?? false
  );
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);

  const onCancelClick = () => setIsCancelDialogOpen(true);
  const onCloseDialog = () => setIsCancelDialogOpen(false);

  const vacancyDetails = props.vacancyDetails;
  const { onCancel } = props;

  const assignment = vacancyDetails[0].assignment;

  const onCancelAllMutation = React.useCallback(async () => {
    await onCancel(
      assignment?.id ?? "",
      assignment?.rowVersion ?? "",
      undefined
    );
    onCloseDialog();
  }, [onCancel, assignment]);

  const vacancy =
    vacancyDetails[0].vacancy !== null && vacancyDetails[0].vacancy;

  const isFromVacancy = React.useMemo(() => {
    return !!vacancyDetails[0].vacancyReason;
  }, [vacancyDetails]);

  if (!vacancy || !assignment) return <></>;

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

  const confirmationNumber = assignment.id;
  const employeeName = isFromVacancy
    ? `${t("Vacancy")}`
    : `${vacancy.absence?.employee?.firstName} ${vacancy.absence?.employee?.lastName}`;
  const positionName = vacancy.position?.title ?? "";

  let totalDayPortion = 0;
  vacancyDetails.map(a => (totalDayPortion += a.dayPortion));

  const lastVacancyDetail = vacancyDetails[vacancyDetails.length - 1];
  const startDate = vacancyDetails[0].startDate!;

  /* the vacancy details come back from the server sorted by date,
  so this should be the latest date for the vacancy */
  const endDate = lastVacancyDetail.endDate!;

  const multipleTimes = detailsHaveMultipleTimes(vacancyDetails);

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
        onConfirm={onCancelAllMutation}
      />

      <div
        className={classes.container}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* this is the top row of a group. */}
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
          absenceId={vacancy?.absence?.id}
          vacancyId={vacancy?.id}
          payInfoLabel={
            vacancyDetails[0].vacancy?.payInfoSummary?.summaryLabel ?? ""
          }
          notesToReplacement={
            vacancyDetails[0].vacancy?.notesToReplacement ?? undefined
          }
          onCancel={onCancelClick}
          className={props.className}
          isAdmin={props.isAdmin}
          forSpecificAssignment={props.forSpecificAssignment}
          canCancel={vacancy?.canCancel}
        />
        {isExpanded && (
          <div className={classes.container}>
            {props.vacancyDetails.map((a, i) => (
              <AssignmentGroupDetail
                dayPortion={a.dayPortion}
                payInfoLabel={a.payInfo?.label ?? ""}
                startTimeLocal={a.startTimeLocal ?? ""}
                endTimeLocal={a.endTimeLocal ?? ""}
                locationName={a.location?.name ?? ""}
                shadeRow={i % 2 != 0}
                key={i}
                onCancel={() => {
                  event?.stopPropagation();
                  onCancel(
                    a.assignment?.id ?? "",
                    a.assignment?.rowVersion ?? "",
                    [a.id ?? ""]
                  );
                }}
                isAdmin={props.isAdmin}
                forSpecificAssignment={props.forSpecificAssignment}
                canCancel={a.canCancel}
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
