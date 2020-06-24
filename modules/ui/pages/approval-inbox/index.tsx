import * as React from "react";
import { makeStyles, Divider } from "@material-ui/core";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { InboxItem } from "./components/inbox-item";
import { useQueryBundle } from "graphql/hooks";
import { useRouteParams } from "ui/routes/definition";
import { ApprovalInboxRoute } from "ui/routes/approval-inbox";
import { compact } from "lodash-es";
import { GetApprovalInboxItems } from "./graphql/get-inbox-items.gen";
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

  const getPendingApprovalItems = useQueryBundle(GetApprovalInboxItems, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const getPreviousDecisions = useQueryBundle(GetApprovalInboxItems, {
    variables: {
      orgId: params.organizationId,
      getPastDecisions: true,
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
      ? compact(getPreviousDecisions.data?.vacancy?.approvalInbox?.results)
      : [];

  const pendingVacancies =
    getPendingApprovalItems.state === "DONE"
      ? compact(getPendingApprovalItems.data?.vacancy?.approvalInbox?.results)
      : [];

  useEffect(() => {
    if (pendingVacancies.length > 0 && !selected) {
      setSelected({
        id: pendingVacancies[0].id,
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
                    const isSelected = selected?.id === v.id;

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
                        inboxItem={v}
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
                    const isSelected = selected?.id === v.id;

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
                        inboxItem={v}
                        isPrevious={true}
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
