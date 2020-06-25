import { useTranslation } from "react-i18next";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { Table } from "ui/components/table";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Column } from "material-table";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import ErrorIcon from "@material-ui/icons/Error";
import { compact, flatMap } from "lodash-es";
import {
  ApproverGroupsRoute,
  ApproverGroupAddLocationsRoute,
  ApproverGroupAddRemoveMembersRoute,
} from "ui/routes/approver-groups";
import { useRouteParams } from "ui/routes/definition";
import { GetAllApproverGroupsWithinOrg } from "./graphql/get-all-approver-groups.gen";
import { useIsMobile } from "hooks";

export const ApproverGroupsUI: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(ApproverGroupsRoute);

  const getApproverGroups = useQueryBundle(GetAllApproverGroupsWithinOrg, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const approverGroups =
    getApproverGroups.state === "DONE"
      ? compact(getApproverGroups.data?.approverGroup?.all)
      : [];

  const columns: Column<GetAllApproverGroupsWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
      render: data =>
        data.memberCount === 0 ? (
          <>
            <div className={classes.warning}>{data.name}</div>
          </>
        ) : (
          <>
            <div>{data.name}</div>
          </>
        ),
    },
    {
      title: t("Members"),
      field: "memberCount",
      searchable: false,
      hidden: isMobile,
      render: data => {
        return data.variesByLocation ? (
          data.allLocationsHaveGroup ? (
            <>
              <div>{t("Varies by school")}</div>
            </>
          ) : (
            <>
              <div className={classes.warning}>
                {t("Varies by school")}
                <Tooltip
                  title={t(
                    "There are no approvers defined for this group. " +
                      "Any workflow step referring to an empty approver group will be skipped."
                  )}
                >
                  <ErrorIcon className={classes.icon} />
                </Tooltip>
              </div>
            </>
          )
        ) : (
          <div>{data.memberCount}</div>
        );
      },
    },
    {
      title: t("Used in"),
      field: "approvalWorkflows",
      searchable: false,
      hidden: isMobile,
      render: data => {
        if (!data.approvalWorkflows) return t("Not used");
        return data.approvalWorkflows.length === 1 ? (
          <>
            <div>{data.approvalWorkflows[0]?.name}</div>
          </>
        ) : (
          <div>{`${data.approvalWorkflows.length} ${t(" Workflows")}`}</div>
        );
      },
    },
  ];

  const approverGroupsCount = approverGroups.length;

  return (
    <>
      <Section>
        <Table
          title={`${approverGroupsCount} ${t("Approver Groups")}`}
          columns={columns}
          data={approverGroups}
          selection={false}
          onRowClick={(event, approverGroup) => {
            if (!approverGroup) return;

            //Location Page
            if (approverGroup.variesByLocation) {
              history.push(
                ApproverGroupAddLocationsRoute.generate({
                  approverGroupHeaderId: approverGroup?.id ?? "",
                  organizationId: params.organizationId,
                })
              );
            }
            //Admin Page
            else {
              history.push(
                ApproverGroupAddRemoveMembersRoute.generate({
                  approverGroupId: approverGroup?.approverGroups![0]?.id ?? "",
                  organizationId: params.organizationId,
                })
              );
            }
          }}
        />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  warning: {
    fontWeight: 600,
    color: theme.customColors.primary,
  },
  icon: {
    paddingLeft: "10px",
    fill: theme.customColors.primary,
  },
}));
