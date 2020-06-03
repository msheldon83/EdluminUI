import * as React from "react";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { EmployeeLink } from "ui/components/links/people";
import { useQueryBundle } from "graphql/hooks";
import { useRouteParams } from "ui/routes/definition";
import {
  AdminAbsenceApprovalViewRoute,
  AdminEditAbsenceRoute,
  EmployeeEditAbsenceRoute,
} from "ui/routes/edit-absence";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { GetAbsence } from "./graphql/get-absence.gen";
import { ApprovalDetail } from "ui/components/absence-vacancy/approval-state/approval-detail";

type Props = { actingAsEmployee?: boolean };
export const AbsenceApprovalDetail: React.FC<Props> = props => {
  const params = useRouteParams(AdminAbsenceApprovalViewRoute);
  const history = useHistory();
  const { t } = useTranslation();

  const getAbsence = useQueryBundle(GetAbsence, {
    variables: {
      id: params.absenceId,
    },
  });

  const absence =
    getAbsence.state === "DONE" ? getAbsence.data.absence?.byId : null;

  const onReturn = () => {
    props.actingAsEmployee
      ? history.push(
          EmployeeEditAbsenceRoute.generate({
            absenceId: params.absenceId,
          })
        )
      : history.push(
          AdminEditAbsenceRoute.generate({
            absenceId: params.absenceId,
            organizationId: params.organizationId,
          })
        );
  };

  const subHeader = !props.actingAsEmployee ? (
    <EmployeeLink orgUserId={absence?.employeeId} color="black">
      {`${absence?.employee?.firstName} ${absence?.employee?.lastName}`}
    </EmployeeLink>
  ) : (
    undefined
  );

  const approvalState = absence?.approvalState;

  if (!approvalState || !absence) {
    return <></>;
  }

  return (
    <>
      <AbsenceVacancyHeader
        subHeader={subHeader}
        pageHeader={`${t("Approval status for absence")} #${params.absenceId}`}
        onCancel={onReturn}
      />
      <ApprovalDetail
        orgId={params.organizationId}
        viewingAsEmployee={props.actingAsEmployee}
        approvalStateId={approvalState.id}
        currentStepId={approvalState.currentStepId}
        approvalWorkflowId={approvalState.approvalWorkflowId}
        comments={approvalState.comments}
        isTrueVacancy={false}
        absence={absence}
      />
    </>
  );
};
