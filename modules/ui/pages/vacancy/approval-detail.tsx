import * as React from "react";
import { AbsenceVacancyHeader } from "ui/components/absence-vacancy/header";
import { useQueryBundle } from "graphql/hooks";
import { useRouteParams } from "ui/routes/definition";
import { VacancyViewRoute, VacancyApprovalViewRoute } from "ui/routes/vacancy";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { GetVacancyById } from "./graphql/get-vacancy-byid.gen";
import { ApprovalDetail } from "ui/components/absence-vacancy/approval-state/approval-detail";

export const VacancyApprovalDetail: React.FC<{}> = () => {
  const params = useRouteParams(VacancyApprovalViewRoute);
  const history = useHistory();
  const { t } = useTranslation();

  const getVacancy = useQueryBundle(GetVacancyById, {
    variables: {
      id: params.vacancyId,
    },
  });

  const vacancy =
    getVacancy.state === "DONE" ? getVacancy.data.vacancy?.byId : null;

  const onReturn = () => {
    history.push(VacancyViewRoute.generate(params));
  };

  const approvalState = vacancy?.approvalState;

  if (!approvalState) {
    return <></>;
  }

  return (
    <>
      <AbsenceVacancyHeader
        subHeader={vacancy?.position?.title}
        pageHeader={`${t("Approval status for vacancy")} #V${params.vacancyId}`}
        onCancel={onReturn}
        isForVacancy={true}
      />
      <ApprovalDetail
        orgId={params.organizationId}
        approvalStateId={approvalState.id}
        currentStepId={approvalState.currentStepId}
        approvalWorkflowId={approvalState.approvalWorkflowId}
        comments={approvalState.comments}
        isTrueVacancy={true}
        vacancy={vacancy}
      />
    </>
  );
};