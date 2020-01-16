import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { Detail } from "../helpers";
import { DailyReportDetailUI } from "./daily-report-detail-ui";
import { MobileDailyReportDetailUI } from "./mobile-daily-report-detail-ui";
import { OrgUserPermissions } from "reference-data/my-user-access";
import {
  canRemoveSub,
  canAssignSub,
  canEditAbsence,
} from "helpers/permissions";

type Props = {
  detail: Detail;
  className?: string;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
};

export const DailyReportDetail: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const absenceEditParams = useRouteParams(AdminEditAbsenceRoute);
  const isMobile = useIsMobile();

  const isChecked = !!props.selectedDetails.find(
    d => d.detailId === props.detail.detailId && d.type === props.detail.type
  );
  const existingUnfilledSelection = !!props.selectedDetails.find(
    d => d.state === "unfilled"
  );
  const hideCheckbox =
    props.detail.isMultiDay ||
    props.detail.state === "noSubRequired" ||
    (!isChecked &&
      existingUnfilledSelection &&
      props.detail.state === "unfilled");

  const goToAbsenceEdit = (absenceId: string) => {
    const url = AdminEditAbsenceRoute.generate({
      ...absenceEditParams,
      absenceId,
    });
    history.push(url, {
      returnUrl: `${history.location.pathname}${history.location.search}`,
    });
  };

  const rowActions = [
    {
      name: t("Edit"),
      onClick: () => goToAbsenceEdit(props.detail.id),
      permissions: (
        permissions: OrgUserPermissions[],
        isSysAdmin: boolean,
        orgId?: string
      ) => canEditAbsence(props.detail.date, permissions, isSysAdmin, orgId),
    },
  ];
  if (props.detail.state !== "noSubRequired") {
    rowActions.push({
      name: props.detail.substitute ? t("Remove Sub") : t("Assign Sub"),
      onClick: async () => {
        if (props.detail.substitute) {
          await props.removeSub(
            props.detail.assignmentId,
            props.detail.assignmentRowVersion
          );
        } else {
          goToAbsenceEdit(props.detail.id);
        }
      },
      permissions: props.detail.substitute
        ? (
            permissions: OrgUserPermissions[],
            isSysAdmin: boolean,
            orgId?: string
          ) => canRemoveSub(props.detail.date, permissions, isSysAdmin, orgId)
        : (
            permissions: OrgUserPermissions[],
            isSysAdmin: boolean,
            orgId?: string
          ) => canAssignSub(props.detail.date, permissions, isSysAdmin, orgId),
    });
  }

  return (
    <>
      {isMobile ? (
        <MobileDailyReportDetailUI
          {...props}
          rowActions={rowActions}
          hideCheckbox={hideCheckbox}
          goToAbsenceEdit={goToAbsenceEdit}
          isChecked={isChecked}
        />
      ) : (
        <DailyReportDetailUI
          {...props}
          rowActions={rowActions}
          hideCheckbox={hideCheckbox}
          goToAbsenceEdit={goToAbsenceEdit}
          isChecked={isChecked}
        />
      )}
    </>
  );
};
