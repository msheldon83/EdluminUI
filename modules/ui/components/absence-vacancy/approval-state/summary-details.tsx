import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import {
  getDateRangeDisplay,
  getDayPartCountLabels,
} from "ui/components/employee/helpers";
import { parseISO, differenceInHours, format } from "date-fns";
import { DayPart, Maybe, ApprovalAction } from "graphql/server-types.gen";
import { useLocations } from "reference-data/locations";
import { useMyUserAccess } from "reference-data/my-user-access";

type Props = {
  orgId: string;
  absenceDetails?:
    | Maybe<{
        dayPartId?: DayPart | null;
        dayPortion: number;
        endTimeLocal?: string | null;
        startTimeLocal?: string | null;
      }>[]
    | null;
  createdLocal?: string;
  approvalChangedLocal?: string;
  positionTitle?: string;
  employeeName?: string;
  startDate?: string | null;
  endDate?: string | null;
  isNormalVacancy: boolean;
  simpleSummary: boolean;
  locationIds?: string[];
  decisions?: {
    approvalActionId: ApprovalAction;
    createdLocal?: string | null;
    actingOrgUserId: string;
  }[];
};

export const SummaryDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const userAccess = useMyUserAccess();
  const currentOrgUserId = userAccess?.me?.user?.orgUsers?.find(
    x => x?.orgId === props.orgId
  )?.id;
  const myDecision = props.decisions?.find(
    x => x.actingOrgUserId === currentOrgUserId
  );

  const getDecisionText = (approvalActionId: ApprovalAction) => {
    switch (approvalActionId) {
      case ApprovalAction.Approve:
        return t("Approved");
      case ApprovalAction.Deny:
        return t("Denied");
      case ApprovalAction.Skip:
        return t("Skipped");
      default:
        return "";
    }
  };

  const absenceDetails = props.absenceDetails;
  const startDate = parseISO(props.startDate ?? "");
  const endDate = parseISO(props.endDate ?? "");

  const createdDate = parseISO(props.createdLocal ?? "");
  const approvalChangedDate = myDecision
    ? parseISO(myDecision.createdLocal ?? "")
    : parseISO(props.approvalChangedLocal ?? "");

  const locations = useLocations(props.orgId);
  const locationNames = props.locationIds
    ? locations
        .filter(x => props.locationIds?.includes(x.id))
        .map(x => x.name)
        .join(", ")
    : "";

  const allDayParts =
    absenceDetails && absenceDetails.length > 0
      ? absenceDetails.map(d => ({
          dayPart: d!.dayPartId!,
          dayPortion: d!.dayPortion,
          hourDuration: differenceInHours(
            parseISO(d!.endTimeLocal!),
            parseISO(d!.startTimeLocal!)
          ),
        }))
      : [];

  const renderSimpleSummary = () => {
    return props.isNormalVacancy ? (
      <div className={classes.title}>
        {getDateRangeDisplay(startDate, endDate)}
      </div>
    ) : (
      <div className={classes.title}>
        {`${getDateRangeDisplay(startDate, endDate)} (${getDayPartCountLabels(
          allDayParts,
          t
        ).join(", ")})`}
      </div>
    );
  };

  return props.simpleSummary ? (
    <div className={classes.container}>{renderSimpleSummary()}</div>
  ) : (
    <div className={classes.container}>
      <div className={classes.title}>
        {props.isNormalVacancy ? props.positionTitle : props.employeeName}
      </div>
      <div className={classes.subTitle}>
        {props.isNormalVacancy
          ? getDateRangeDisplay(startDate, endDate)
          : `${getDateRangeDisplay(
              startDate,
              endDate
            )} (${getDayPartCountLabels(allDayParts, t).join(", ")})`}
      </div>
      <div className={classes.text}>
        {props.isNormalVacancy
          ? locationNames
          : `${props.positionTitle} @ ${locationNames}`}
      </div>
      <div className={classes.updatedText}>{`${t("Created")} ${format(
        createdDate,
        "MMM d"
      )} @ ${format(createdDate, "h:mm a")}`}</div>
      <div className={classes.updatedText}>{`${
        myDecision
          ? getDecisionText(myDecision.approvalActionId)
          : t("Awaiting approval since")
      } ${format(approvalChangedDate, "MMM d")} @ ${format(
        approvalChangedDate,
        "h:mm a"
      )}`}</div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(1),
  },
  subTitle: {
    fontWeight: 600,
    fontSize: theme.typography.pxToRem(16),
  },
  title: {
    fontSize: theme.typography.pxToRem(24),
  },
  text: {
    fontWeight: "normal",
    fontSize: theme.typography.pxToRem(14),
    marginBottom: theme.spacing(1),
  },
  updatedText: {
    color: "#9E9E9E",
  },
}));
