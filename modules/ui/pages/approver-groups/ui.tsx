import { useTranslation } from "react-i18next";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { compact } from "lodash-es";
import {
  ApproverGroupsRoute,
  ApproverGroupViewRoute,
} from "ui/routes/approver-groups";
import { useRouteParams } from "ui/routes/definition";
import { GetAllApproverGroupsWithinOrg } from "./graphql/get-all-approver-groups.gen";
import { useIsMobile } from "hooks";

type Props = {};

export const ApproverGroupsUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const isMobile = useIsMobile();
  const params = useRouteParams(ApproverGroupsRoute);

  const getApproverGroups = useQueryBundle(GetAllApproverGroupsWithinOrg, {
    variables: {
      orgId: params.organizationId,
    },
  });

  const columns: Column<GetAllApproverGroupsWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    {
      title: t("Members"),
      field: "members",
      searchable: false,
      hidden: isMobile,
      //Check Figma for custom Render with text-color change & tool tip
    },
    {
      title: t("Used in"),
      field: "usedIn",
      searchable: false,
      hidden: isMobile,
      //Check Figma for custom Render with text-color change & tool tip
    },
  ];

  if (getApproverGroups.state === "LOADING") {
    return <></>;
  }

  const approverGroups = compact(
    getApproverGroups?.data?.approverGroup?.all ?? []
  );
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
            const newParams = {
              ...params,
              approverGroupId: approverGroup.id,
            };
            history.push(ApproverGroupViewRoute.generate(newParams));
          }}
        />
      </Section>
    </>
  );
};
