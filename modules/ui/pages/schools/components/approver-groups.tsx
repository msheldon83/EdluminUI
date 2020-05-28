import { useTranslation } from "react-i18next";
import * as React from "react";
import { Table } from "ui/components/table";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Column } from "material-table";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import ErrorIcon from "@material-ui/icons/Error";
import { ApproverGroupAddRemoveMembersRoute } from "ui/routes/approver-groups";
import { LocationViewRoute } from "ui/routes/locations";
import { useRouteParams } from "ui/routes/definition";
import { useIsMobile } from "hooks";

type Props = {
  approverGroups: any[];
};

type ApproverGroup = {
  id: string;
  name: string;
  approverGroupHeaderId: string;
  memberCount: number;
  approvalWorkflows: string[];
};

export const ApproverGroupsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(LocationViewRoute);

  let { approverGroups } = props;

  approverGroups =
    approverGroups?.map(e => {
      return {
        id: e?.id,
        name: e?.name,
        approverGroupHeaderId: e?.approverGroupHeaderId,
        memberCount: e?.memberCount,
        approvalWorkflows: e?.approvalWorkflows?.map((e: any) => {
          return e.name;
        }),
      };
    }) ?? [];

  const columns: Column<ApproverGroup>[] = [
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
        data.memberCount === 0 || !data.approverGroupHeaderId ? (
          <>
            <div className={classes.warning}>
              {data.memberCount ?? t("0")}
              <Tooltip
                title={t(
                  "There are no approvers defined for this location. " +
                    "Any workflow step referring to an empty approver location will be skipped."
                )}
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
      field: "approvalWorkflows",
      searchable: false,
      hidden: isMobile,
      render: data => (
        <>
          <div>
            {data.approvalWorkflows ? data.approvalWorkflows.length : 0}
            {t(" Workflows")}
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      <Section>
        <Table
          title={t("Approver Groups")}
          columns={columns}
          data={approverGroups}
          selection={false}
          onRowClick={(event, approverGroup) => {
            if (!approverGroup) return;

            history.push({
              pathname: ApproverGroupAddRemoveMembersRoute.generate({
                approverGroupId: approverGroup?.id ?? "",
                organizationId: params.organizationId,
              }),
              state: { locationId: params.locationId },
            });
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
