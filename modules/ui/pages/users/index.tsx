import { Button, IconButton, makeStyles } from "@material-ui/core";
import { usePagedQueryBundle, useQueryBundle } from "graphql/hooks";
import { useIsMobile, useDeferredState } from "hooks";
import { Column } from "material-table";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { PaginationControls } from "ui/components/pagination-controls";
import { Table } from "ui/components/table";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { GetAllUsersPaged } from "./graphql/get-all-users.gen";
import { User } from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { makeQueryIso, PaginationParams } from "hooks/query-params";
import { Section } from "ui/components/section";
import { Input } from "ui/components/form/input";

type Props = {};

export const UsersPage: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const columns = [
    { title: t("Id"), field: "id" },
    { title: t("Last Name"), field: "lastName" },
    { title: t("First Name"), field: "firstName" },
    { title: t("Username"), field: "loginEmail" },
  ];

  const [
    searchText,
    pendingSearchText,
    setPendingSearchText,
  ] = useDeferredState<string | undefined>(undefined, 200);

  // Default People list to 100 rows per page
  const userPaginationDefaults = makeQueryIso({
    defaults: {
      page: "1",
      limit: "25",
    },
    iso: PaginationParams,
  });
  const [getUsersQuery, pagination] = usePagedQueryBundle(
    GetAllUsersPaged,
    r => r.user?.paged?.totalCount,
    {
      variables: {
        searchText,
      },
      fetchPolicy: "cache-and-network",
    },
    userPaginationDefaults
  );

  const users = useMemo(() => {
    return getUsersQuery.state === "LOADING"
      ? []
      : compact(getUsersQuery?.data?.user?.paged?.results) || [];
  }, [getUsersQuery]);

  if (getUsersQuery.state === "LOADING") {
    return <></>;
  }

  return (
    <>
      <PageTitle title={t("Users")} />
      <Section>
        <div className={classes.searchTextFieldRow}>
          <div className={classes.searchTextFieldContainer}>
            <Input
              label={t("Search")}
              value={pendingSearchText}
              onChange={e => {
                if (!e.target.value) {
                  setPendingSearchText(undefined);
                } else {
                  setPendingSearchText(e.target.value);
                }
              }}
              placeholder={"First Name, Last Name, Email/Username or User Id"}
              fullWidth={true}
            />
          </div>
        </div>
        <div>
          <Table
            title={`${pagination.totalCount} Records`}
            columns={columns}
            data={users}
            options={{
              showTitle: !isMobile,
            }}
          />
          <div className={classes.pagination}>
            <PaginationControls pagination={pagination} />
          </div>
        </div>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  searchTextFieldContainer: {
    width: theme.typography.pxToRem(500),
  },
  searchTextFieldRow: {
    borderBottom: `1px solid ${theme.customColors.sectionBorder}`,
    paddingBottom: theme.spacing(3),
  },
  pagination: {
    padding: `${theme.spacing(8)} 0`,
  },
}));
