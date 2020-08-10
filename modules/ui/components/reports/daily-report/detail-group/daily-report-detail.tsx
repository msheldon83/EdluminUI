import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRoute } from "ui/routes/absence";
import { Detail } from "../helpers";
import { DailyReportDetailUI } from "./daily-report-detail-ui";
import { MobileDailyReportDetailUI } from "./mobile-daily-report-detail-ui";
import { canRemoveSub, canAssignSub, canEditAbsVac } from "helpers/permissions";
import { OrgUserPermissions, Role } from "ui/components/auth/types";
import { VacancyViewRoute } from "ui/routes/vacancy";

type Props = {
  detail: Detail;
  className?: string;
  selectedDetails: Detail[];
  updateSelectedDetails: (detail: Detail, add: boolean) => void;
  removeSub: (
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => Promise<void>;
  vacancyDate?: string;
  swapSubs?: (detail: Detail) => void;
};

export const DailyReportDetail: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const absenceEditParams = useRouteParams(AdminEditAbsenceRoute);
  const vacancyEditParams = useRouteParams(VacancyViewRoute);
  const isMobile = useIsMobile();

  const isChecked = !!props.selectedDetails.find(
    d => d.detailId === props.detail.detailId && d.type === props.detail.type
  );
  const existingUnfilledSelection = !!props.selectedDetails.find(
    d => d.state === "unfilled"
  );

  const disableSwapSub =
    (props.selectedDetails.length === 0 && !props.detail.substitute) ||
    props.detail.isClosed ||
    props.detail.isMultiDay ||
    props.detail.state === "noSubRequired" ||
    (!isChecked &&
      existingUnfilledSelection &&
      props.detail.state === "unfilled");

  const goToAbsenceEdit = (
    absVacId: string,
    absVacType: "absence" | "vacancy",
    editSub?: boolean
  ) => {
    const url = `${
      absVacType == "absence"
        ? AdminEditAbsenceRoute.generate({
            ...absenceEditParams,
            absenceId: absVacId,
          })
        : VacancyViewRoute.generate({
            ...vacancyEditParams,
            vacancyId: absVacId,
          })
    }${editSub ? "?step=preAssignSub" : ""}`;
    history.push(url, {
      returnUrl: `${history.location.pathname}${history.location.search}`,
    });
  };

  const rowActions = [
    {
      name: t("Edit"),
      onClick: () => goToAbsenceEdit(props.detail.id, props.detail.type),
      permissions: (
        permissions: OrgUserPermissions[],
        isSysAdmin: boolean,
        orgId?: string,
        forRole?: Role | null | undefined
      ) =>
        canEditAbsVac(
          props.detail.date,
          permissions,
          isSysAdmin,
          orgId,
          forRole,
          props.detail.approvalStatus
        ),
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
          goToAbsenceEdit(props.detail.id, props.detail.type, true);
        }
      },
      permissions: props.detail.substitute
        ? (
            permissions: OrgUserPermissions[],
            isSysAdmin: boolean,
            orgId?: string,
            forRole?: Role | null | undefined
          ) =>
            canRemoveSub(
              props.detail.date,
              permissions,
              isSysAdmin,
              orgId,
              forRole
            )
        : (
            permissions: OrgUserPermissions[],
            isSysAdmin: boolean,
            orgId?: string,
            forRole?: Role | null | undefined
          ) =>
            canAssignSub(
              props.detail.date,
              permissions,
              isSysAdmin,
              orgId,
              forRole
            ),
    });
  }
  if (!disableSwapSub) {
    rowActions.push({
      name: t("Swap Sub"),
      onClick: async () => {
        props.updateSelectedDetails(props.detail, true);
      },
      permissions: (
        permissions: OrgUserPermissions[],
        isSysAdmin: boolean,
        orgId?: string,
        forRole?: Role | null | undefined
      ) =>
        canAssignSub(
          props.detail.date,
          permissions,
          isSysAdmin,
          orgId,
          forRole
        ),
    });
  }
  return (
    <>
      {isMobile ? (
        <MobileDailyReportDetailUI
          {...props}
          rowActions={rowActions}
          highlighted={isChecked}
          swapMode={disableSwapSub ? "notswapable" : "swapable"}
          swapSubs={props.swapSubs}
        />
      ) : (
        <DailyReportDetailUI
          {...props}
          rowActions={rowActions}
          highlighted={isChecked}
          swapMode={disableSwapSub ? "notswapable" : "swapable"}
          swapSubs={props.swapSubs}
        />
      )}
    </>
  );
};
