import { Button, Grid, makeStyles } from "@material-ui/core";
import { useTheme } from "@material-ui/styles";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { compact } from "lodash-es";
import { Table } from "ui/components/table";
import { PageTitle } from "ui/components/page-title";
import { Column } from "material-table";
import {
  PayCodeRoute,
  PayCodeAddRoute,
  PayCodeViewEditRoute,
} from "ui/routes/pay-code";
import { useRouteParams } from "ui/routes/definition";
import { GetAllPayCodesWithinOrg } from "ui/pages/pay-code/graphql/get-pay-codes.gen";
import { DeletePayCode } from "./graphql/delete-pay-code.gen";

type Props = {};

export const PayCode: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const params = useRouteParams(PayCodeRoute);
  const [includeExpired, setIncludeExpired] = React.useState(false);

  const getPayCodes = useQueryBundle(GetAllPayCodesWithinOrg, {
    variables: { orgId: params.organizationId, includeExpired },
  });
  const [deletePayCodeMutation] = useMutationBundle(DeletePayCode);
  const deletePayCode = (payCodeId: string) => {
    return deletePayCodeMutation({
      variables: {
        payCodeId: Number(payCodeId),
      },
    });
  };

  const deleteSelected = async (data: { id: string } | { id: string }[]) => {
    if (Array.isArray(data)) {
      await Promise.all(data.map(id => deletePayCode(id.id)));
    } else {
      await Promise.resolve(deletePayCode(data.id));
    }
    await getPayCodes.refetch();
  };

  const columns: Column<GetAllPayCodesWithinOrg.All>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
      searchable: true,
    },
    {
      title: t("External Id"),
      field: "externalId",
      searchable: true,
      hidden: isMobile,
    },
    {
      title: t("Description"),
      field: "description",
      searchable: true,
      hidden: isMobile,
    },
  ];

  if (getPayCodes.state === "LOADING") {
    return <></>;
  }

  const payCodes = compact(getPayCodes?.data?.orgRef_PayCode?.all ?? []);
  const payCodesCount = payCodes.length;

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
          <PageTitle title={t("Pay Codes")} />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            component={Link}
            to={PayCodeAddRoute.generate(params)}
          >
            {t("Add Pay Code")}
          </Button>
        </Grid>
      </Grid>
      <Table
        title={`${payCodesCount} ${t("Pay Codes")}`}
        columns={columns}
        data={payCodes}
        selection={!isMobile}
        onRowClick={(event, payCode) => {
          if (!payCode) return;
          const newParams = {
            ...params,
            payCodeId: payCode.id,
          };
          history.push(PayCodeViewEditRoute.generate(newParams));
        }}
        options={{
          search: true,
        }}
        showIncludeExpired={true}
        onIncludeExpiredChange={checked => {
          setIncludeExpired(checked);
        }}
        expiredRowCheck={(rowData: GetAllPayCodesWithinOrg.All) =>
          rowData.expired
        }
        actions={[
          {
            tooltip: `${t("Delete selected pay codes")}`,
            icon: () => <DeleteOutline /> /* eslint-disable-line */, // This should be able to be "delete" as a string which will use the table delete icon, but that didn't work for some reason
            onClick: async (event, data) => {
              await deleteSelected(data);
            },
          },
        ]}
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
