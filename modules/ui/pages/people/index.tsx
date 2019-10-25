import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useTranslation } from "react-i18next";
import { Table } from "ui/components/table";
import { useQueryBundle } from "graphql/hooks";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import { GetAllPeopleForOrg } from "./GetAllPeopleForOrg.gen";
import { AccountCircleOutlined } from "@material-ui/icons";

type Props = {};

export const PeoplePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PeopleRoute);
  const allPeopleQuery = useQueryBundle(GetAllPeopleForOrg, {
    variables: { orgId: params.organizationId },
  });
  if (
    allPeopleQuery.state === "LOADING" ||
    !allPeopleQuery.data.orgUser ||
    !allPeopleQuery.data.orgUser.all
  ) {
    return <></>;
  }
  const people = allPeopleQuery.data.orgUser.all;
  const peopleCount = people.length;

  const columns = [
    {
      title: t("Name"),
      field: "name",
      render: (p: Exclude<(typeof people)[0], null>) =>
        p && `${p.firstName} ${p.lastName}`,
    },
  ];

  return (
    <>
      <PageTitle title={t("People")} />
      <Table
        title={`${peopleCount} ${peopleCount > 1 ? t("People") : t("Person")}`}
        columns={columns}
        data={people}
        selection={true}
      />
    </>
  );
};
