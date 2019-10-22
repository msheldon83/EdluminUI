import { useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { AllOrganizations } from "ui/pages/organizations/AllOrganizations.gen";
import * as React from "react";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";
import { oc } from 'ts-optchain';

type Props = {};
export const OrganizationsPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const getOrganizations = useQueryBundle(AllOrganizations, {
    variables: { limit: 25, offset: 0 },
  });

  const columns = [
    { title: t("OrgId"), field: "id", defaultSort: "asc" },
    { title: t("Name"), field: "name" }
  ];

  if (getOrganizations.state === "LOADING") {
    return <></>;
  }

  const organizations = oc(getOrganizations).data.organization.paged.results([]);
  const organizationsCount = organizations.length;

  return (
    <>
      <PageTitle title={`${organizationsCount} ${t("Organizations")}`} />
      <Table
        title={""}
        columns={columns}
        data={organizations}
        selection={false}
      ></Table>
    </>
  );
};