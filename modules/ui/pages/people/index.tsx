import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { useTranslation } from "react-i18next";
import { Table } from "ui/components/table";
import { useQueryBundle } from "graphql/hooks";
import { useRouteParams } from "ui/routes/definition";
import { PeopleRoute } from "ui/routes/people";
import { GetAllPeopleForOrg } from "./graphql/get-all-people-for-org.gen";
import { AccountCircleOutlined } from "@material-ui/icons";
import { compact } from "lodash-es";
import { makeStyles } from "@material-ui/core";
import { useTheme } from "@material-ui/styles";

type Props = {};

export const PeoplePage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const params = useRouteParams(PeopleRoute);
  const theme = useTheme();
  const allPeopleQuery = useQueryBundle(GetAllPeopleForOrg, {
    variables: { orgId: params.organizationId },
  });
  if (
    allPeopleQuery.state === "LOADING" ||
    !allPeopleQuery.data.orgUser?.paged?.results
  ) {
    return <></>;
  }
  const people = compact(allPeopleQuery.data.orgUser?.paged?.results);
  const peopleCount = people.length;

  const columns = [
    {
      cellStyle: { width: theme.typography.pxToRem(70), alignItems: "center" },
      render: () => <AccountCircleOutlined />, // eslint-disable-line
    },
    {
      title: t("Name"),
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
