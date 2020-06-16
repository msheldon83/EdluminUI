import * as React from "react";
import { Grid, makeStyles, Divider } from "@material-ui/core";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { InboxItem } from "./components/inbox-item";
import { useQueryBundle } from "graphql/hooks";
import { useRouteParams } from "ui/routes/definition";
import { ApprovalInboxRoute } from "ui/routes/approval-inbox";
import { compact } from "lodash-es";
import { GetPendingApprovalItems } from "./graphql/get-pending-items.gen";
import { GetPreviousApprovalDecisions } from "./graphql/get-previous-decisions.gen";
import { SelectedDetail } from "./components/selected-detail";
import { useMyUserAccess } from "reference-data/my-user-access";
import { useIsMobile } from "hooks";

export const ApprovalInbox: React.FC<{}> = () => {
  const isMobile = useIsMobile();
  const classes = useStyles({ isMobile });
  const { t } = useTranslation();
  const params = useRouteParams(ApprovalInboxRoute);

  const userAccess = useMyUserAccess();

  const [selected, setSelected] = useState<{
    id: string;
    isNormalVacancy: boolean;
  } | null>(null);

  const checkIfSelected = (
    isNormalVacancy: boolean,
    vacancyId?: string,
    absenceId?: string
  ) => {
    if (!selected) return false;
    if (isNormalVacancy) {
      return vacancyId === selected?.id;
    } else {
      return absenceId === selected?.id;
    }
  };

  const getPendingApprovalItems = useQueryBundle(GetPendingApprovalItems, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const getPreviousDecisions = useQueryBundle(GetPreviousApprovalDecisions, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const onApprove = async () => {
    setSelected(null);
    await getPendingApprovalItems.refetch();
    await getPreviousDecisions.refetch();
  };

  const onDeny = async () => {
    setSelected(null);
    await getPendingApprovalItems.refetch();
    await getPreviousDecisions.refetch();
  };

  const previousDecisions =
    getPreviousDecisions.state === "DONE"
      ? compact(
          getPreviousDecisions.data?.vacancy?.pastApprovalDecisions?.results
        )
      : [];

  const pendingVacancies =
    getPendingApprovalItems.state === "DONE"
      ? compact(getPendingApprovalItems.data?.vacancy?.vacanciesNeedingApproval)
      : [];

  useEffect(() => {
    if (pendingVacancies.length > 0 && !selected) {
      setSelected({
        id: pendingVacancies[0].isNormalVacancy
          ? pendingVacancies[0].id
          : pendingVacancies[0].absenceId ?? "",
        isNormalVacancy: pendingVacancies[0].isNormalVacancy,
      });
    }
  }, [pendingVacancies, selected]);

  return (
    <>
      <div className={classes.header}>{t("Approvals")}</div>
      <Section>
        {userAccess?.isSysAdmin ? (
          <div className={classes.subTitle}>
            {t(
              "Please impersonate a district admin to approve absences and vacancies."
            )}
          </div>
        ) : (
          <div className={!isMobile ? classes.desktopContainer : undefined}>
            <div className={classes.inboxContainer}>
              <div className={classes.subTitle}>{t("Inbox")}</div>
              {getPendingApprovalItems.state === "LOADING" ? (
                <div>{t("Loading")}</div>
              ) : (
                <div>
                  {pendingVacancies.map((v, i) => {
                    const isSelected = checkIfSelected(
                      v.isNormalVacancy,
                      v.id,
                      v.absenceId ?? undefined
                    );

                    return isMobile && isSelected ? (
                      <div className={classes.selectedItemContainer}>
                        <SelectedDetail
                          orgId={params.organizationId}
                          selectedItem={selected}
                          onApprove={onApprove}
                          onDeny={onDeny}
                        />
                      </div>
                    ) : (
                      <InboxItem
                        key={i}
                        orgId={params.organizationId}
                        isSelected={isSelected}
                        setSelected={setSelected}
                        vacancy={v}
                        approvalState={
                          v.isNormalVacancy
                            ? v.approvalState
                            : v.absence?.approvalState
                        }
                      />
                    );
                  })}
                </div>
              )}
              <Divider className={classes.divider} />
              <div className={classes.subTitle}>{t("Previous decisions")}</div>
              {getPreviousDecisions.state === "LOADING" ? (
                <div>{t("Loading")}</div>
              ) : (
                <div>
                  {previousDecisions.map((v, i) => {
                    const isSelected = checkIfSelected(
                      v.isNormalVacancy,
                      v.id,
                      v.absenceId ?? undefined
                    );

                    return isMobile && isSelected ? (
                      <div className={classes.selectedItemContainer}>
                        <SelectedDetail
                          orgId={params.organizationId}
                          selectedItem={selected}
                          onApprove={onApprove}
                          onDeny={onDeny}
                        />
                      </div>
                    ) : (
                      <InboxItem
                        key={i}
                        orgId={params.organizationId}
                        isSelected={isSelected}
                        setSelected={setSelected}
                        vacancy={v}
                        approvalState={
                          v.isNormalVacancy
                            ? v.approvalState
                            : v.absence?.approvalState
                        }
                        isPrevious={true}
                        decisions={
                          v.isNormalVacancy
                            ? v.approvalState?.decisions
                            : v.absence?.approvalState?.decisions
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
            {!isMobile && (
              <div className={classes.selectedItemContainer}>
                <SelectedDetail
                  orgId={params.organizationId}
                  selectedItem={selected}
                  onApprove={onApprove}
                  onDeny={onDeny}
                />
              </div>
            )}
          </div>
        )}
      </Section>
    </>
  );
};

type StyleProps = {
  isMobile: boolean;
};

const useStyles = makeStyles(theme => ({
  header: {
    fontSize: theme.typography.pxToRem(48),
    fontWeight: 600,
    paddingBottom: theme.spacing(2),
  },
  subTitle: {
    fontSize: theme.typography.pxToRem(24),
  },
  desktopContainer: {
    display: "flex",
  },
  inboxContainer: (props: StyleProps) => ({
    width: props.isMobile ? "100%" : "50%",
    paddingRight: props.isMobile ? theme.spacing(0) : theme.spacing(1),
  }),
  selectedItemContainer: (props: StyleProps) => ({
    width: props.isMobile ? "100%" : "50%",
    paddingLeft: props.isMobile ? theme.spacing(0) : theme.spacing(1),
    marginTop: props.isMobile ? theme.spacing(1) : theme.spacing(0),
    marginBottom: props.isMobile ? theme.spacing(1) : theme.spacing(0),
  }),
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));
