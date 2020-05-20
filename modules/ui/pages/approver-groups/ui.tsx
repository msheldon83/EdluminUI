import { useTranslation } from "react-i18next";
import * as React from "react";
import { useQueryBundle, usePagedQueryBundle } from "graphql/hooks";
import { Table } from "ui/components/table";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Column } from "material-table";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { PaginationControls } from "ui/components/pagination-controls";
import ErrorIcon from "@material-ui/icons/Error";
import { compact } from "lodash-es";
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

  const [getApproverGroups, pagination] = usePagedQueryBundle(
    GetAllApproverGroupsWithinOrg,
    r => r.approverGroup?.paged?.totalCount,
    {
      variables: {
        orgId: params.organizationId,
        sortBy: [
          {
            sortByPropertyName: "id",
            sortAscending: false,
          },
        ],
      },
    }
  );

  const approverGroups =
    getApproverGroups.state === "DONE"
      ? compact(getApproverGroups.data?.approverGroup?.paged?.results)
      : [];

  const columns: Column<GetAllApproverGroupsWithinOrg.Results>[] = [
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
      render: data =>
        data.memberCount === 0 ? (
          <>
            <div className={classes.warning}>
              {data.memberCount}
              <Tooltip
                title={
                  data.allLocationsHaveGroup
                    ? t(
                        "At least one school does not have approvers defined. " +
                          "Any workflow step referring to an empty approver group will be skipped"
                      )
                    : t(
                        "There are no approvers defined for this group. " +
                          "Any workflow step referring to an empty approver group will be skipped."
                      )
                }
              >
                <ErrorIcon className={classes.icon} />
              </Tooltip>
            </div>
          </>
        ) : (
          <>
            <div>{data.memberCount}</div>
          </>
        ),
    },
    {
      title: t("Used in"),
      field: "usedIn",
      searchable: false,
      hidden: isMobile,
      render: data => (
        <>
          <div>Workflow info</div>
        </>
      ),
    },
  ];

  const approverGroupsCount = pagination.totalCount;

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
            history.push(
              ApproverGroupAddRemoveMembersRoute.generate({
                approverGroupId: approverGroup?.approverGroups[0]?.id ?? "",
                organizationId: params.organizationId,
              })
            );
          }}
        />
        <PaginationControls pagination={pagination} />
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