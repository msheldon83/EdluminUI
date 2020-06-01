import * as React from "react";
import {
  AbsenceApprovalWorkflowRoute,
  VacancyApprovalWorkflowRoute,
} from "ui/routes/approval-workflow";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { ApprovalWorkflowType } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  type: ApprovalWorkflowType;
};

export const WorkflowReturnLink: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  switch (props.type) {
    case ApprovalWorkflowType.Absence:
      return (
        <Link
          to={AbsenceApprovalWorkflowRoute.generate({
            organizationId: props.orgId,
          })}
          className={classes.link}
        >
          {t("Return to Absence workflows")}
        </Link>
      );
    case ApprovalWorkflowType.Vacancy:
      return (
        <Link
          to={VacancyApprovalWorkflowRoute.generate({
            organizationId: props.orgId,
          })}
          className={classes.link}
        >
          {t("Return to Vacancy workflows")}
        </Link>
      );
    default:
      return <></>;
  }
};

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.customColors.blue,
    "&:visited": {
      color: theme.customColors.blue,
    },
  },
}));
