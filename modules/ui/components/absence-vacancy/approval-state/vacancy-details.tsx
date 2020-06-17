import * as React from "react";
import { useTranslation } from "react-i18next";
import { Maybe } from "graphql/server-types.gen";
import { makeStyles, Grid } from "@material-ui/core";
import { compact } from "lodash-es";
import { SummaryDetails } from "./summary-details";

type Props = {
  orgId: string;
  vacancy: {
    id: string;
    adminOnlyNotes?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    details?:
      | Maybe<{
          startDate: string;
          endDate: string;
          locationId: string;
          vacancyReason: {
            id: string;
            name: string;
          };
        }>[]
      | null;
  };
  showSimpleDetail: boolean;
};

export const VacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const vacancy = props.vacancy;

  const reasons = compact(vacancy.details?.map(x => x?.vacancyReason)) ?? [];
  const uniqueReasonIds = [...new Set(reasons.map(x => x.id))] ?? [];

  return (
    <div className={classes.detailsContainer}>
      {props.showSimpleDetail && (
        <SummaryDetails
          orgId={props.orgId}
          startDate={vacancy.startDate}
          endDate={vacancy.endDate}
          isNormalVacancy={true}
          simpleSummary={true}
        />
      )}
      <div className={classes.reasonHeaderContainer}>
        <div className={[classes.subTitle, classes.reason].join(" ")}>
          {uniqueReasonIds.length > 1 ? t("Reasons") : t("Reason")}
        </div>
      </div>
      {uniqueReasonIds.map((r, i) => {
        return (
          <div key={i} className={classes.reasonRowContainer}>
            <div className={[classes.text, classes.reason].join(" ")}>
              {reasons.find(x => x.id === r)?.name}
            </div>
          </div>
        );
      })}
      <div className={classes.notesContainer}>
        <div className={classes.subTitle}>{t("Administrator comments")}</div>
        <div className={classes.text}>
          {vacancy.adminOnlyNotes ? vacancy.adminOnlyNotes : t("No comments")}
        </div>
      </div>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  detailsContainer: {
    width: "100%",
  },
  subTitle: {
    fontWeight: "bold",
    fontSize: theme.typography.pxToRem(14),
  },
  title: {
    fontSize: theme.typography.pxToRem(24),
  },
  text: {
    fontWeight: "normal",
    fontSize: theme.typography.pxToRem(14),
  },
  reasonHeaderContainer: {
    background: "#F0F0F0",
    border: "1px solid #E5E5E5",
    padding: theme.spacing(1),
    display: "flex",
    width: "95%",
  },
  reasonRowContainer: {
    borderBottom: "1px solid #E5E5E5",
    padding: theme.spacing(1),
    display: "flex",
    width: "95%",
  },
  reason: {
    width: "50%",
  },
  notesContainer: {
    paddingTop: theme.spacing(2),
  },
}));
