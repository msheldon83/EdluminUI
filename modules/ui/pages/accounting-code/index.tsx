import { makeStyles, Grid, useTheme } from "@material-ui/core";
import { useIsMobile } from "hooks";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { AccountingCodeRoute } from "ui/routes/accounting-code";
import { useRouteParams } from "ui/routes/definition";
import { Button } from "@material-ui/core";
import { GetAllAccountingCodesWithinOrg } from "ui/pages/accounting-code/graphql/accounting-codes.gen";
import { UpdateAccountingCode } from "./graphql/update-accounting-code.gen";
import { CreateAccountingCode } from "./graphql/create-accounting-code.gen";
import { compact } from "lodash-es";
import { Column } from "material-table";
import { Table } from "ui/components/table";
import {
  AccountingCodeCreateInput,
  AccountingCodeUpdateInput,
} from "graphql/server-types.gen";

type Props = {};

export const AccountingCode: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(AccountingCodeRoute);

  const getAccountingCodes = useQueryBundle(GetAllAccountingCodesWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired: true },
  });

  const [updateAccountingCode] = useMutationBundle(UpdateAccountingCode);
  const [createAccountingCode] = useMutationBundle(CreateAccountingCode);

  const columns: Column<GetAllAccountingCodesWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    {
      title: t("Code"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
    },
    {
      title: t("School"),
      field: "location.id",
      type: "boolean",
      searchable: true,
      hidden: isMobile,
    },
  ];

  if (getAccountingCodes.state === "LOADING") {
    return <></>;
  }

  const accountingCodes = compact(
    getAccountingCodes?.data?.orgRef_AccountingCode?.all ?? []
  );
  const accountingCodesCount = accountingCodes.length;

  const updateRow = async (accountingCode: AccountingCodeUpdateInput) => {
    const result = await updateAccountingCode({
      variables: {
        accountingCode: {
          id: Number(accountingCode.id),
          rowVersion: accountingCode.rowVersion,
          name: accountingCode.name,
          externalId: accountingCode.externalId,
        },
      },
    });
    return result?.data.orgRef_AccountingCode?.update?.id;
  };

  const addRow = async (accountingCode: AccountingCodeCreateInput) => {
    const result = await createAccountingCode({
      variables: {
        accountingCode: {
          ...accountingCode,
          name: accountingCode.name,
          externalId: accountingCode.externalId,
        },
      },
    });
    return result?.data?.orgRef_AccountingCode?.create?.id;
  };

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item>
          <PageTitle title={t("Accounting Codes")} />
        </Grid>
      </Grid>
      <Table
        title={`${accountingCodesCount} ${t("Accounting Codes")}`}
        columns={columns}
        data={accountingCodes}
        selection={!isMobile}
        onRowClick={(event, positionType) => {
          if (!positionType) return;
          const newParams = {
            ...params,
            positionTypeId: positionType.id,
          };
          history.push(AccountingCodeRoute.generate(newParams));
        }}
        options={{
          search: true,
        }}
      />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(),
  },
}));
