import * as React from "react";
import { Grid, makeStyles, Divider } from "@material-ui/core";
import { useState, useEffect } from "react";
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

export const ApprovalInbox: React.FC<{}> = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const params = useRouteParams(ApprovalInboxRoute);

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
    await getPendingApprovalItems.refetch();
    await getPreviousDecisions.refetch();
  };

  const onDeny = async () => {
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
    if (pendingVacancies.length > 0) {
      setSelected({
        id: pendingVacancies[0].isNormalVacancy
          ? pendingVacancies[0].id
          : pendingVacancies[0].absenceId ?? "",
        isNormalVacancy: pendingVacancies[0].isNormalVacancy,
      });
    }
  }, [pendingVacancies]);

  return (
    <>
      <div className={classes.header}>{t("Approvals")}</div>
      <Section>
        <Grid container spacing={2}>
          <Grid item container xs={6} spacing={2}>
            <Grid item xs={12}>
              <div className={classes.subTitle}>{t("Inbox")}</div>
            </Grid>
            <Grid item xs={12}>
              {pendingVacancies.map((v, i) => {
                return (
                  <InboxItem
                    key={i}
                    isSelected={checkIfSelected(
                      v.isNormalVacancy,
                      v.id,
                      v.absenceId ?? undefined
                    )}
                    setSelected={setSelected}
                    vacancy={v}
                  />
                );
              })}
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <div className={classes.subTitle}>{t("Previous decisions")}</div>
            </Grid>
            <Grid item xs={12}>
              {previousDecisions.map((v, i) => {
                return (
                  <InboxItem
                    key={i}
                    isSelected={checkIfSelected(
                      v.isNormalVacancy,
                      v.id,
                      v.absenceId ?? undefined
                    )}
                    setSelected={setSelected}
                    vacancy={v}
                    isPrevious={true}
                  />
                );
              })}
            </Grid>
          </Grid>
          <Grid item container xs={6}>
            <SelectedDetail
              orgId={params.organizationId}
              selectedItem={selected}
              onApprove={onApprove}
              onDeny={onDeny}
            />
          </Grid>
        </Grid>
      </Section>
    </>
  );
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
}));
